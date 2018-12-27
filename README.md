# react-lazy-value

`react-lazy-value` allows you to lazily and asynchronously evaluate a value during the render phase of your component. It can be used for [data fetching](#data-fetching), [code splitting](#code-splitting), [state management](#reducer), and other async use cases.

## Examples

### Data Fetching

```js
import React from "react";
import ReactDOM from "react-dom";
import lazyValue from "react-lazy-value";

const currentUser = lazyValue(async () => {
  const response = await fetch(`/api/me`);
  const json = await response.json();
  return json;
});

function Loading() {
  return <h1>Loading...</h1>;
}

function App() {
  return <h1>Hello {currentUser.value.name}!</h1>;
}

ReactDOM.render(
  <React.Suspense fallback={<Loading />}>
    <App />
  </React.Suspense>,
  document.getElementById("app")
);
```

### Code Splitting

```js
import React from "react";
import ReactDOM from "react-dom";
import lazyValue from "react-lazy-value";

const moment = lazyValue(() => import("moment"));

function Loading(props) {
  return <h1>Loading...</h1>;
}

function App() {
  return <h1>{moment.value.calendar()}!</h1>;
}

ReactDOM.render(
  <React.Suspense fallback={<Loading />}>
    <App />
  </React.Suspense>,
  document.getElementById("app")
);
```

### Reducer

```js
import lazyValue from "react-lazy-value";

function reducer(state, action) {
  switch (action.type) {
    case "LOAD_USER":
      return lazyValue(async () => {
        const response = await fetch(`/api/users/${action.payload.id}`);
        const json = await response.json();
        return json;
      });

    case "UPDATE_USER":
      return lazyValue(() => ({
        ...state.value,
        ...action.payload
      }));

    default:
      return state;
  }
}
```

### Eager Execution

```js
import lazyValue from "react-lazy-value";

const currentUser = lazyValue.touch(
  lazyValue(async () => {
    const response = await fetch(`/api/me`);
    const json = await response.json();
    return json;
  })
);
```

## How does it work?

`react-lazy-value` relies on [React Suspense](https://reactjs.org/docs/react-api.html#suspense) which lets components "wait" on a lazy value before rendering.

## JSON.stringify

The `lazy` object is treated as `undefined` when in a pending or error state.
