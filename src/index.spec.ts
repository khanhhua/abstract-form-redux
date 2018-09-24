import chai, {expect} from 'chai'
import chaiSpies from 'chai-spies';

chai.use(chaiSpies);

import {AnyAction, applyMiddleware, createStore, Reducer} from 'redux';
import {action, formMiddleware, FORM_INIT, FORM_RESTORE_DATA, FORM_SET_VALUE, FORM_VALIDATE} from "./index";
import {Form, parseConfig} from "abstract-form/lib";

describe('Abstract Form Middleware', () => {
  describe('action FORM_INIT', () => {
    const spy = chai.spy();

    // @ts-ignore
    const dummyReducer: Reducer<{}, AnyAction> = (state: any, action: AnyAction) => {
      if (action.type === FORM_INIT) {
        return {...state, $$abstractForm: action.payload};
      } else {
        return state;
      }
    };
    const store = createStore(dummyReducer, {}, applyMiddleware(formMiddleware()));
    store.subscribe(spy);

    it('should pass', () => {
      let configString = `{
        "items": [
          {
            "id": "q1",
            "dataType": "text",
            "label": "Nick name"
          },
          {
            "id": "q2",
            "dataType": "number",
            "label": "Year of birth"
          }
        ]
      }`;
      const form = new Form(parseConfig(configString));

      store.dispatch(action(FORM_INIT, configString));

      expect(spy).to.have.been.called();
      expect(store.getState()).to.be.deep.equal({
        $$abstractForm: {
          form
        }
      });
    });
  });

  describe('action FORM_RESTORE_DATA', () => {
    it('should pass', () => {

    });
  });

  describe('action FORM_SET_VALUE', () => {
    it('should pass', () => {

    });
  });

  describe('action FORM_VALIDATE', () => {
    it('should pass', () => {

    });
  });
});
