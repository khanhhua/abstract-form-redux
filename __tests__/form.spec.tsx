import enzyme from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';

enzyme.configure({adapter: new Adapter()});

import {expect} from 'chai';

import React from 'react';
import {Provider, connect} from 'react-redux';
import {AnyAction, applyMiddleware, createStore, Reducer} from "redux";
import {action, FORM_INIT, formEnhancer, formMiddleware} from "../src";
import {IFormItemConfig} from 'abstract-form';

class Form extends React.Component {
  constructor(props:any) {
    super(props);
  }

  componentWillMount() {
    // @ts-ignore
    const {dispatch} = this.props;
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
    dispatch(action(FORM_INIT, configString));
    this.forceUpdate();
  }

  render() {
    // @ts-ignore
    const {form} = this.props;
    if (!form) {
      return <ul></ul>;
    }

    return (
      <ul>
      {(form.config.items || []).map((item:IFormItemConfig, index:number) => (
        <li key={index}>{form.select(item.id)}</li>
      ))}
      </ul>
    );
  }
}

const ConnectedForm = connect(
  (state: any) => {
    return {
      form: !!state.$$abstractForm?state.$$abstractForm.form:null
    };
  },
  (dispatch) => {
    return {dispatch};
  })(Form);

describe('Static Form Integration', () => {
  it('should render', () => {
// @ts-ignore
    const dummyReducer: Reducer<{}, AnyAction> = (state: any, action: AnyAction) => {
      return state;
    };
    const store = createStore(dummyReducer, {}, formEnhancer());
    const wrapper = enzyme.mount(<ConnectedForm store={store} dispatch={store.dispatch} />);

    expect(wrapper.html()).to.be.equal('<ul><li></li><li></li></ul>');
  });
});
