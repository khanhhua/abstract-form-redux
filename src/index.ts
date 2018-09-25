import {AnyAction, applyMiddleware, compose, Middleware, Reducer, StoreEnhancer} from "redux";
import {IError, parseConfig, ValidationResult} from 'abstract-form/lib';
import {Form} from 'abstract-form/lib/form';

export const FORM_INIT = '@@abstract-form-redux/FORM_INIT';
export const FORM_RESTORE_DATA = '@@abstract-form-redux/FORM_RESTORE_DATA';
export const FORM_SET_VALUE = '@@abstract-form-redux/FORM_SET_VALUE';
export const FORM_VALIDATE = '@@abstract-form-redux/FORM_VALIDATE';
export const FORM_UPDATE_UI = '@@abstract-form-redux/FORM_UPDATE_UI';

interface IAbstractFormState {
  form: Form;
  data: {};
  errors: IError[];
}

interface IAbstractFormStateContainer {
  $$abstractForm: IAbstractFormState
}

const formReducer: Reducer<{}, AnyAction> = (state: any, action: AnyAction) => {
  if (action.type === FORM_INIT) {
    let $$abstractForm = action.payload;
    return {...state, $$abstractForm};
  } else if (action.type === FORM_SET_VALUE) {
    let {form, errors} = state.$$abstractForm;
    return {...state, $$abstractForm: {
      form,
      errors,
      data: action.payload
    }};
  } else if (action.type === FORM_VALIDATE) {
    let { form, data } = state.$$abstractForm;
    let payload:ValidationResult = action.payload;

    return {...state, $$abstractForm: {
        form,
        data,
        errors: payload.ok?[]:payload.errors
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

    switch (action.type) {
      case FORM_INIT: {
        if (ensureState(state)) {
          return;
        }

        let config = parseConfig(action.payload);
        let form:Form = new Form(config);
        let $$abstractForm: IAbstractFormState = {
          form,
          data: form.select('$'),
          errors: []
        };

        next({
          type: FORM_INIT,
          payload: $$abstractForm
        });

        break;
      }
      case FORM_RESTORE_DATA: break;
      case FORM_SET_VALUE: {
        if (!ensureState(state)) {
          return;
        }
        let form:Form = state.$$abstractForm.form;
        const { path, value } = action.payload;

        form.setData(path, value);
        next({
          type: FORM_SET_VALUE,
          payload: form.select('$')
        });

        break;
      }
      case FORM_VALIDATE: {
        if (!ensureState(state)) {
          return;
        }
        let form:Form = state.$$abstractForm.form;
        const { paths } = action.payload;
        let result:ValidationResult;

        if (paths === '$') {
          result = form.validate(paths)
          next({
            type: FORM_VALIDATE,
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
          }, new ValidationResult())

          next({
            type: FORM_VALIDATE,
            payload: result
          });
        }

        break;
      }
      default:
        next(action);
    }
  })
}

export function formEnhancer(options: any = {}):(store:any)=>any {
  return createStore => (reducer: Reducer<{}, AnyAction>, initialState: any) => {
    const liftedStore = createStore(
      compose(reducer, formReducer),
      { ...initialState, $$abstractForm:null },
      applyMiddleware(formMiddleware(options))
    );

    return liftedStore;
  };
}

export function action(type: string, payload: any):{ type: string, payload: any } {
  return { type, payload };
}
