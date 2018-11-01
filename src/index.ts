import {Action, AnyAction, applyMiddleware, compose, Dispatch, Middleware, Reducer, StoreEnhancer} from 'redux';
import {IError, parseConfig, ValidationResult} from 'abstract-form/lib';
import {Form} from 'abstract-form/lib/form';

export enum FormActionType {
  FORM_INIT = '@@abstract-form-redux/FORM_INIT',
  FORM_RESTORE_DATA = '@@abstract-form-redux/FORM_RESTORE_DATA',
  FORM_SET_VALUE = '@@abstract-form-redux/FORM_SET_VALUE',
  FORM_VALIDATE = '@@abstract-form-redux/FORM_VALIDATE',
  FORM_SUBMIT = '@@abstract-form-redux/FORM_SUBMIT',
  FORM_UPDATE_UI = '@@abstract-form-redux/FORM_UPDATE_UI'
}

interface IFormAction extends AnyAction {
  type: FormActionType,
  payload: any;
}

interface IElementAttributes {
  focused?: boolean;
  visible?: boolean;
}

interface IAbstractFormState {
  form: Form;
  data: {};
  ui: {[key:string]: IElementAttributes},
  errors: IError[];
}

interface IAbstractFormStateContainer {
  $$abstractForm: IAbstractFormState
}

const formReducer: Reducer<{}, IFormAction> = (state: any, action: IFormAction) => {
  if (action.type === FormActionType.FORM_INIT) {
    let $$abstractForm = action.payload;
    return {...state, $$abstractForm};
  } else if (action.type === FormActionType.FORM_SET_VALUE) {
    let {form, errors} = state.$$abstractForm;
    return {...state, $$abstractForm: {
      form,
      errors,
      data: action.payload
    }};
  } else if (action.type === FormActionType.FORM_VALIDATE) {
    let { form, data } = state.$$abstractForm;
    let payload:ValidationResult = action.payload;

    return {...state, $$abstractForm: {
        form,
        data,
        errors: payload.ok?[]:payload.errors
      }};
  } else if (action.type === FormActionType.FORM_RESTORE_DATA) {
    let {form} = state.$$abstractForm;
    return {...state, $$abstractForm: {
        form,
        errors: [],
        data: action.payload
      }};
  } else if (action.type === FormActionType.FORM_UPDATE_UI) {
    let {form, errors, data, ui} = state.$$abstractForm;
    let newUI = action.payload.reduce((acc:any, item: {path: string, properties: any}) => {
      acc[item.path] = item.properties;

      return acc;
    }, {});

    return {...state, $$abstractForm: {
        form,
        errors,
        data,
        ui: {...ui, ...newUI}
      }};
  } else {
    return state;
  }
};

export function formMiddleware(options: any = {}):Middleware<any, any, any> {
  function ensureState(state:any):boolean {
    return !!state.$$abstractForm;
  }

  return <Middleware<any, any, any>>(store => next => action => {
    const state:IAbstractFormStateContainer = <IAbstractFormStateContainer>store.getState();

    return new Promise((resolve: ((_?: any) => void), reject: ((_: any) => void)) => {
      switch (action.type) {
        case FormActionType.FORM_INIT: {
          if (ensureState(state)) {
            return;
          }

          let config = parseConfig(action.payload);
          let form:Form = new Form(config);
          let $$abstractForm: IAbstractFormState = {
            form,
            data: form.select('$'),
            errors: [],
            ui: {}
          };

          resolve();

          next({
            type: FormActionType.FORM_INIT,
            payload: $$abstractForm
          });

          break;
        }
        case FormActionType.FORM_RESTORE_DATA: {
          if (!ensureState(state)) {
            return;
          }

          let form:Form = state.$$abstractForm.form;
          const value = action.payload;

          form.setData('$', value);
          resolve();

          next({
            type: FormActionType.FORM_RESTORE_DATA,
            payload: form.select('$')
          });

          break;
        }
        case FormActionType.FORM_SET_VALUE: {
          if (!ensureState(state)) {
            return;
          }
          let form:Form = state.$$abstractForm.form;
          const { path, value } = action.payload;

          form.setData(path, value);
          resolve();

          next({
            type: FormActionType.FORM_SET_VALUE,
            payload: form.select('$')
          });

          break;
        }
        case FormActionType.FORM_VALIDATE: {
          if (!ensureState(state)) {
            return;
          }
          let form:Form = state.$$abstractForm.form;
          const { paths } = action.payload;
          let result:ValidationResult;

          if (paths === '$') {
            result = form.validate(paths);
            resolve(result.ok);

            next({
              type: FormActionType.FORM_VALIDATE,
              payload: result
            });
            return;
          } else if (Array.isArray(paths)) {
            result = paths.reduce((acc: ValidationResult, path:string) => {
              const thisValidation = form.validate(path);
              if (thisValidation.ok) {
                return acc;
              } else {
                thisValidation.errors.forEach(item => acc.addError(item))
                return acc;
              }
            }, new ValidationResult());
            resolve(result);

            next({
              type: FormActionType.FORM_VALIDATE,
              payload: result
            });
          }

          break;
        }
        case FormActionType.FORM_SUBMIT: {
          if (!ensureState(state)) {
            return;
          }

          let form:Form = state.$$abstractForm.form;
          const { url, action: formAction } = action.payload;
          const data = form.select('$');

          if (url && formAction) {
            throw new Error('Both URL and action handler are defined');
          }

          if (formAction && typeof formAction === 'function') {
            const ret = formAction(data);
            if (ret && ret.then) {
              next({
                type: FormActionType.FORM_SUBMIT,
                status: 'pending',
                payload: data
              });
              ret.then((resData:any) => {
                resolve();
                next({
                  type: FormActionType.FORM_SUBMIT,
                  status: 'success',
                  payload: resData
                });
              }).catch((error:any) => {
                reject(error);
                next({
                  type: FormActionType.FORM_SUBMIT,
                  status: 'error',
                  payload: error
                });
              })
            } else {
              resolve();
              next({
                type: FormActionType.FORM_SUBMIT,
                payload: ret
              });
            }
          } else if (url) {
            next({
              type: FormActionType.FORM_SUBMIT,
              status: 'pending',
              payload: data
            });

            fetch(url, {
              method: 'POST',
              headers: {
                cache: 'no-cache',
                contentType: 'application/json',
              },
              body: JSON.stringify(data),
            }).then((res:any) => {
              if (res.ok) {
                return res.json();
              } else {
                throw new Error('Data error');
              }
            }).then((resData:any) => {
              resolve(resData);
              next({
                type: FormActionType.FORM_SUBMIT,
                status: 'success',
                payload: resData
              });
            }).catch(error => {
              reject(error);
              next({
                type: FormActionType.FORM_SUBMIT,
                status: 'error',
                payload: error
              });
            })
          } else {
            resolve();
            next({
              type: FormActionType.FORM_SUBMIT,
              payload: data
            });
          }
          break;
        }
        default:
          resolve();
          next(action);
      }
    });
  })
}

export function formEnhancer(options: any = {}):(store:any)=>any {
  return createStore => (reducer: Reducer<{}, AnyAction>, initialState: any, middlewares:Array<Middleware>) => {
    function composedReducer(state: any, action: any) {
      return reducer(formReducer(state, action), action);
    }

    const liftedStore = createStore(
      composedReducer,
      { ...initialState, $$abstractForm:null },
      applyMiddleware(formMiddleware(options))
    );

    return liftedStore;
  };
}

export function action(type: FormActionType, payload: any):{ type: FormActionType, payload: any } {
  return { type, payload };
}
