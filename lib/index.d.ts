import { Middleware } from 'redux';
export declare enum FormActionType {
    FORM_INIT = "@@abstract-form-redux/FORM_INIT",
    FORM_RESTORE_DATA = "@@abstract-form-redux/FORM_RESTORE_DATA",
    FORM_SET_VALUE = "@@abstract-form-redux/FORM_SET_VALUE",
    FORM_VALIDATE = "@@abstract-form-redux/FORM_VALIDATE",
    FORM_SUBMIT = "@@abstract-form-redux/FORM_SUBMIT",
    FORM_UPDATE_UI = "@@abstract-form-redux/FORM_UPDATE_UI"
}
export declare function formMiddleware(options?: any): Middleware<any, any, any>;
export declare function formEnhancer(options?: any): (store: any) => any;
export declare function action(type: FormActionType, payload: any): {
    type: FormActionType;
    payload: any;
};
