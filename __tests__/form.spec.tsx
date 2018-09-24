import enzyme from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';

enzyme.configure({adapter: new Adapter()});

import {expect} from 'chai';

import React from 'react';
import {Provider, connect} from 'react-redux';
import {AnyAction, applyMiddleware, createStore, Reducer} from 'redux';
import {action, FORM_INIT, FORM_SET_VALUE formEnhancer} from '../src';
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
      {(Object.entries(form) || []).map((item, index:number) => (
        <li key={index}>{item[1]}</li>
      ))}
      </ul>
    );
  }
}

const ConnectedForm = connect(
  (state: any) => {
    return {
      form: !!state.$$abstractForm?state.$$abstractForm.data:null
    };
  },
  (dispatch) => {
    return {dispatch};
  })(Form);

describe('Static Form Integration', () => {
  it('should render initial state', () => {
    // @ts-ignore
    const dummyReducer: Reducer<{}, AnyAction> = (state: any, action: AnyAction) => state;
    const store = createStore(dummyReducer, {}, formEnhancer());
    const wrapper = enzyme.mount(<ConnectedForm store={store} dispatch={store.dispatch} />);

    expect(wrapper.html()).to.be.equal('<ul><li></li><li></li></ul>');
  });

  it('should render updated data', () => {
    // @ts-ignore
    const dummyReducer: Reducer<{}, AnyAction> = (state: any, action: AnyAction) => state;
    const store = createStore(dummyReducer, {}, formEnhancer());
    const wrapper = enzyme.mount(<ConnectedForm store={store} dispatch={store.dispatch} />);
    store.dispatch(action(FORM_SET_VALUE, {
      path: '$',
      value: {
        q1: 'Tom',
        q2: 1980
      }
    }));

    expect(wrapper.html()).to.be.equal('<ul><li>Tom</li><li>1980</li></ul>');
  });
});
