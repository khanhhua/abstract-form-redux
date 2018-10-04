import { Middleware } from "redux";
export declare const FORM_INIT = "@@abstract-form-redux/FORM_INIT";
export declare const FORM_RESTORE_DATA = "@@abstract-form-redux/FORM_RESTORE_DATA";
export declare const FORM_SET_VALUE = "@@abstract-form-redux/FORM_SET_VALUE";
export declare const FORM_VALIDATE = "@@abstract-form-redux/FORM_VALIDATE";
export declare const FORM_UPDATE_UI = "@@abstract-form-redux/FORM_UPDATE_UI";
export declare function formMiddleware(options?: any): Middleware<any, any, any>;
export declare function formEnhancer(options?: any): (store: any) => any;
export declare function action(type: string, payload: any): {
    type: string;
    payload: any;
};