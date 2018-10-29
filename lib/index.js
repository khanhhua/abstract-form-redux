"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const redux_1 = require("redux");
const lib_1 = require("abstract-form/lib");
const form_1 = require("abstract-form/lib/form");
var FormActionType;
(function (FormActionType) {
    FormActionType["FORM_INIT"] = "@@abstract-form-redux/FORM_INIT";
    FormActionType["FORM_RESTORE_DATA"] = "@@abstract-form-redux/FORM_RESTORE_DATA";
    FormActionType["FORM_SET_VALUE"] = "@@abstract-form-redux/FORM_SET_VALUE";
    FormActionType["FORM_VALIDATE"] = "@@abstract-form-redux/FORM_VALIDATE";
    FormActionType["FORM_SUBMIT"] = "@@abstract-form-redux/FORM_SUBMIT";
    FormActionType["FORM_UPDATE_UI"] = "@@abstract-form-redux/FORM_UPDATE_UI";
})(FormActionType = exports.FormActionType || (exports.FormActionType = {}));
const formReducer = (state, action) => {
    if (action.type === FormActionType.FORM_INIT) {
        let $$abstractForm = action.payload;
        return Object.assign({}, state, { $$abstractForm });
    }
    else if (action.type === FormActionType.FORM_SET_VALUE) {
        let { form, errors } = state.$$abstractForm;
        return Object.assign({}, state, { $$abstractForm: {
                form,
                errors,
                data: action.payload
            } });
    }
    else if (action.type === FormActionType.FORM_VALIDATE) {
        let { form, data } = state.$$abstractForm;
        let payload = action.payload;
        return Object.assign({}, state, { $$abstractForm: {
                form,
                data,
                errors: payload.ok ? [] : payload.errors
            } });
    }
    else if (action.type === FormActionType.FORM_RESTORE_DATA) {
        let { form } = state.$$abstractForm;
        return Object.assign({}, state, { $$abstractForm: {
                form,
                errors: [],
                data: action.payload
            } });
    }
    else if (action.type === FormActionType.FORM_UPDATE_UI) {
        let { form, errors, data, ui } = state.$$abstractForm;
        let newUI = action.payload.reduce((acc, item) => {
            acc[item.path] = item.properties;
            return acc;
        }, {});
        return Object.assign({}, state, { $$abstractForm: {
                form,
                errors,
                data,
                ui: Object.assign({}, ui, newUI)
            } });
    }
    else {
        return state;
    }
};
function formMiddleware(options = {}) {
    function ensureState(state) {
        return !!state.$$abstractForm;
    }
    return (store => next => action => {
        const state = store.getState();
        switch (action.type) {
            case FormActionType.FORM_INIT: {
                if (ensureState(state)) {
                    return;
                }
                let config = lib_1.parseConfig(action.payload);
                let form = new form_1.Form(config);
                let $$abstractForm = {
                    form,
                    data: form.select('$'),
                    errors: [],
                    ui: {}
                };
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
                let form = state.$$abstractForm.form;
                const value = action.payload;
                form.setData('$', value);
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
                let form = state.$$abstractForm.form;
                const { path, value } = action.payload;
                form.setData(path, value);
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
                let form = state.$$abstractForm.form;
                const { paths } = action.payload;
                let result;
                if (paths === '$') {
                    result = form.validate(paths);
                    next({
                        type: FormActionType.FORM_VALIDATE,
                        payload: result
                    });
                    return;
                }
                else if (Array.isArray(paths)) {
                    result = paths.reduce((acc, path) => {
                        const thisValidation = form.validate(path);
                        if (thisValidation.ok) {
                            return acc;
                        }
                        else {
                            thisValidation.errors.forEach(item => acc.addError(item));
                            return acc;
                        }
                    }, new lib_1.ValidationResult());
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
                let form = state.$$abstractForm.form;
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
                        ret.then((resData) => {
                            next({
                                type: FormActionType.FORM_SUBMIT,
                                status: 'success',
                                payload: resData
                            });
                        }).catch((error) => {
                            next({
                                type: FormActionType.FORM_SUBMIT,
                                status: 'error',
                                payload: error
                            });
                        });
                    }
                    else {
                        next({
                            type: FormActionType.FORM_SUBMIT,
                            payload: ret
                        });
                    }
                }
                else if (url) {
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
                    }).then((res) => {
                        if (res.ok) {
                            return res.json();
                        }
                        else {
                            throw new Error('Data error');
                        }
                    }).then((resData) => {
                        next({
                            type: FormActionType.FORM_SUBMIT,
                            status: 'success',
                            payload: resData
                        });
                    }).catch(error => {
                        next({
                            type: FormActionType.FORM_SUBMIT,
                            status: 'error',
                            payload: error
                        });
                    });
                }
                else {
                    next({
                        type: FormActionType.FORM_SUBMIT,
                        payload: data
                    });
                }
                break;
            }
            default:
                next(action);
        }
    });
}
exports.formMiddleware = formMiddleware;
function formEnhancer(options = {}) {
    return createStore => (reducer, initialState, middlewares) => {
        function composedReducer(state, action) {
            return reducer(formReducer(state, action), action);
        }
        const liftedStore = createStore(composedReducer, Object.assign({}, initialState, { $$abstractForm: null }), redux_1.applyMiddleware(formMiddleware(options)));
        return liftedStore;
    };
}
exports.formEnhancer = formEnhancer;
function action(type, payload) {
    return { type, payload };
}
exports.action = action;
//# sourceMappingURL=index.js.map