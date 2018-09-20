export function AbstractFormReduxEnhancer(middlewares: (()=>any)[]) {
  return createStore => (reducer, initialState, enhancer) => {
    const liftedStore = createStore(reducer, enhancer);

    return liftedStore(reducer, enhancer);
  };
}
