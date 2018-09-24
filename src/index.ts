import {Middleware} from "redux";
import {IFormConfig, Form, parseConfig} from "abstract-form/lib";

export const FORM_INIT = '@@abstract-form-redux/FORM_INIT';
export const FORM_RESTORE_DATA = '@@abstract-form-redux/FORM_RESTORE_DATA';
export const FORM_SET_VALUE = '@@abstract-form-redux/FORM_SET_VALUE';
export const FORM_VALIDATE = '@@abstract-form-redux/FORM_VALIDATE';
export const FORM_UPDATE_UI = '@@abstract-form-redux/FORM_UPDATE_UI';

interface IAbstractFormState {
  form: Form;
}

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

// export function formEnhancer(middlewares: (()=>any)[]):(store:any)=>any {
//   return createStore => (reducer, initialState, enhancer) => {
//     const liftedStore = createStore(reducer, enhancer);
//
//     return liftedStore(reducer, enhancer);
//   };
// }

export function action(type: string, payload: any):{ type: string, payload: any } {
  return { type, payload };
}
