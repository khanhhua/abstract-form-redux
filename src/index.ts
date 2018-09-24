import {AnyAction, applyMiddleware, compose, Middleware, Reducer, StoreEnhancer} from "redux";
import {parseConfig} from 'abstract-form/lib';
import {Form} from 'abstract-form/lib/form';

export const FORM_INIT = '@@abstract-form-redux/FORM_INIT';
export const FORM_RESTORE_DATA = '@@abstract-form-redux/FORM_RESTORE_DATA';
export const FORM_SET_VALUE = '@@abstract-form-redux/FORM_SET_VALUE';
export const FORM_VALIDATE = '@@abstract-form-redux/FORM_VALIDATE';
export const FORM_UPDATE_UI = '@@abstract-form-redux/FORM_UPDATE_UI';

interface IAbstractFormState {
  form: Form;
  data: {};
}

interface IAbstractFormStateContainer {
  $$abstractForm: IAbstractFormState
}

const formReducer: Reducer<{}, AnyAction> = (state: any, action: AnyAction) => {
  if (action.type === FORM_INIT) {
    let $$abstractForm = action.payload;
    return {...state, $$abstractForm};
  } else if (action.type === FORM_SET_VALUE) {
    let form = state.$$abstractForm.form;
    return {...state, $$abstractForm: {
      form,
      data: action.payload
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
    switch (action.type) {
      case FORM_INIT: {
        const state:any = store.getState();
        if (ensureState(state)) {
          return;
        }

        let config = parseConfig(action.payload);
        let form:Form = new Form(config);
        let $$abstractForm: IAbstractFormState = {
          form,
          data: form.select('$')
        };

        next({
          type: FORM_INIT,
          payload: $$abstractForm
        });

        break;
      }
      case FORM_RESTORE_DATA: break;
      case FORM_SET_VALUE: {
        const state:IAbstractFormStateContainer = <IAbstractFormStateContainer>store.getState();
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
      case FORM_VALIDATE: break;
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
