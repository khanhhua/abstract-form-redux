import chai, {expect} from 'chai'
import chaiSpies from 'chai-spies';

chai.use(chaiSpies);

import {AnyAction, createStore, Reducer} from 'redux';
import {
  action,
  FORM_INIT,
  FORM_RESTORE_DATA,
  FORM_SET_VALUE,
  FORM_VALIDATE,
  formEnhancer
} from "./index";
import {parseConfig} from "abstract-form/lib";
import {Form} from "abstract-form/lib/form";

describe('Abstract Form Enhancer', () => {
  describe('action FORM_INIT', () => {
    const spy = chai.spy();

    // @ts-ignore
    const dummyReducer: Reducer<{}, AnyAction> = (state: any, action: AnyAction) => {
      return state;
    };
    const store = createStore(dummyReducer, {}, formEnhancer());
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
