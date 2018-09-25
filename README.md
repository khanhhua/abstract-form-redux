abstract-form-redux
===================

[![Build Status](https://travis-ci.org/khanhhua/abstract-form-redux.svg?branch=master)](https://travis-ci.org/khanhhua/abstract-form-redux)

Redux adapter for Abstract Form library

## Setup your redux store

Setup your store using the provided enhancer `formEnhancer`

```
import {formEnhancer} from 'abstract-form-redux';

const store = createStore(rootReducer, {}, formEnhancer());
```


## Application state tree

The shape of your store state should now include a `$$abstractForm` node:

```
{
    $$abstractForm: {
        form: null,
        data: {},
        errors: []
    }
}
```

## Render your app

The life cycle of a form must be as follows:

1. Form init
1. Set value(s) to form
1. Validate form values
1. Possibly restore form values to valid state

### Action `FORM_INIT`

### Action `FORM_SET_VALUE`

### Action `FORM_VALIDATE`

### Action `FORM_RESTORE`