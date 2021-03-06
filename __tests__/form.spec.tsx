import 'core-js/fn/object/entries';
import enzyme from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import chai, {expect} from 'chai';
import chaiSpies from 'chai-spies';

import React from 'react';
import {connect} from 'react-redux';
import {AnyAction, createStore, Reducer} from 'redux';
import {action, FormActionType, formEnhancer} from '../src';
import {IFormItemConfig} from 'abstract-form';
import {IError} from 'abstract-form/lib';

enzyme.configure({adapter: new Adapter()});
chai.use(chaiSpies);

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
          "label": "Nick name",
          "required": true
        },
        {
          "id": "q2",
          "dataType": "number",
          "label": "Year of birth"
        }
      ]
    }`;
    dispatch(action(FormActionType.FORM_INIT, configString));
  }

  render() {
    // @ts-ignore
    const {form, errors} = this.props;
    if (!form) {
      return <ul></ul>;
    }

    return (
      <ul>
      {(Object.entries(form) || []).map((item:Array<any>, index:number) => (
        <li key={`f-${index}`}>{item[1]}</li>
      ))}
      {(errors || []).map((item:IError, index:number) => (
        <li key={`e-${index}`}>error: {item.path} {item.message}</li>
      ))}
      </ul>
    );
  }
}

const ConnectedForm = connect(
  (state: any) => {
    return {
      form: !!state.$$abstractForm?state.$$abstractForm.data:null,
      errors: !!state.$$abstractForm?state.$$abstractForm.errors:null
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
    store.dispatch(action(FormActionType.FORM_SET_VALUE, {
      path: '$',
      value: {
        q1: 'Tom',
        q2: 1980
      }
    }));

    expect(wrapper.html()).to.be.equal('<ul><li>Tom</li><li>1980</li></ul>');
  });

  it('should react to form submit', () => {
    // @ts-ignore
    const dummyReducer: Reducer<{}, AnyAction> = (state: any, action: AnyAction) => state;
    const store = createStore(dummyReducer, {}, formEnhancer());
    const wrapper = enzyme.mount(<ConnectedForm store={store} dispatch={store.dispatch} />);
    const spy = chai.spy();

    store.dispatch(action(FormActionType.FORM_SET_VALUE, {
      path: '$',
      value: {
        q1: 'Tom',
        q2: 1980
      }
    }));

    store.dispatch(action(FormActionType.FORM_SUBMIT, { action: spy }));
    expect(wrapper.html()).to.be.equal('<ul><li>Tom</li><li>1980</li></ul>');

    expect(spy).to.have.been.called;
  });

  it('should render errors', () => {
    // @ts-ignore
    const dummyReducer: Reducer<{}, AnyAction> = (state: any, action: AnyAction) => state;
    const store = createStore(dummyReducer, {}, formEnhancer());
    const wrapper = enzyme.mount(<ConnectedForm store={store} dispatch={store.dispatch} />);
    store.dispatch(action(FormActionType.FORM_SET_VALUE, {
      path: '$',
      value: {
        q2: 1980
      }
    }));
    store.dispatch(action(FormActionType.FORM_VALIDATE, { paths: '$' }));

    expect(wrapper.html()).to.be.equal('<ul><li></li><li>1980</li><li>error: $.q1 required</li></ul>');
  });

  it('should render errors', () => {
    // @ts-ignore
    const dummyReducer: Reducer<{}, AnyAction> = (state: any, action: AnyAction) => state;
    const store = createStore(dummyReducer, {}, formEnhancer());
    const wrapper = enzyme.mount(<ConnectedForm store={store} dispatch={store.dispatch} />);

    store.dispatch(action(FormActionType.FORM_VALIDATE, { paths: '$' }));
    store.dispatch(action(FormActionType.FORM_RESTORE_DATA, {
      q1: 'Tom',
      q2: 1980
    }));

    expect(wrapper.html()).to.be.equal('<ul><li>Tom</li><li>1980</li></ul>');
  });
});
