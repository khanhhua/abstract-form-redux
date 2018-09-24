import {AnyAction, applyMiddleware, compose, Middleware, Reducer, StoreEnhancer} from "redux";
import {parseConfig} from "abstract-form/lib";
import {Form} from "abstract-form/lib/form";

export const FORM_INIT = '@@abstract-form-redux/FORM_INIT';
export const FORM_RESTORE_DATA = '@@abstract-form-redux/FORM_RESTORE_DATA';
export const FORM_SET_VALUE = '@@abstract-form-redux/FORM_SET_VALUE';
export const FORM_VALIDATE = '@@abstract-form-redux/FORM_VALIDATE';
export const FORM_UPDATE_UI = '@@abstract-form-redux/FORM_UPDATE_UI';

interface IAbstractFormState {
  form: Form;
}

const formReducer: Reducer<{}, AnyAction> = (state: any, action: AnyAction) => {
  if (action.type === FORM_INIT) {
    return {...state, $$abstractForm: action.payload};
  } else {
    return state;
  }
};

export function formMiddleware(options: any = {}):Middleware<any, any, any> {
  return <Middleware<any, any, any>>(store => next => action => {
    switch (action.type) {
      case FORM_INIT:
        const state:any = store.getState();
        if (state.$$abstractForm) {
          return;
        }

        let config = parseConfig(action.payload);
        let $$abstractForm: IAbstractFormState = {
          form: new Form(config)
        };

        next({
          type: FORM_INIT,
          payload: $$abstractForm
        });

        break;
      case FORM_RESTORE_DATA: break;
      case FORM_SET_VALUE: break;
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
