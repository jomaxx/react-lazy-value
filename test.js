const React = require("react");
const ReactDOM = require("react-dom");
const lazyValue = require("./");

jest.spyOn(console, "error");

test("renders fallback", done => {
  render({
    lazy: lazyValue(async () => 1),
    onFallback: done
  });
});

test("renders value", done => {
  const value = {};

  render({
    lazy: lazyValue(async () => value),
    onMount(result) {
      expect(result).toBe(value);
      done();
    }
  });
});

test("renders error", done => {
  console.error.mockReturnValueOnce();

  const value = new Error("error");

  render({
    lazy: lazyValue(async () => Promise.reject(value)),
    onError(error) {
      expect(error).toBe(value);
      done();
    }
  });
});

test("renders synchronous value", done => {
  const value = {};

  render({
    lazy: lazyValue(() => value),
    onMount(result) {
      expect(result).toBe(value);
      done();
    }
  });
});

test("touches value", () => {
  const value = 1;
  const init = jest.fn(() => value);
  let lazy = lazyValue(init);
  expect(init).toHaveBeenCalledTimes(0);
  lazy = lazyValue.touch(lazyValue.touch(lazy));
  expect(init).toHaveBeenCalledTimes(1);
  expect(lazy.value).toBe(value);
});

class ErrorBoundary extends React.Component {
  static getDerivedStateFromError(error) {
    return { error };
  }

  static get defaultProps() {
    return {
      onError() {}
    };
  }

  componentDidUpdate() {
    this.props.onError(this.state.error);
  }

  render() {
    if (this.state) return null;
    return this.props.children;
  }
}

class Test extends React.Component {
  static get defaultProps() {
    return {
      onMount() {}
    };
  }

  componentDidMount() {
    this.props.onMount(this.props.lazy.value);
  }

  render() {
    this.props.lazy.value;
    return null;
  }
}

class Fallback extends React.Component {
  static get defaultProps() {
    return {
      onFallback() {}
    };
  }

  componentDidMount() {
    this.props.onFallback();
  }

  render() {
    return null;
  }
}

function render(props) {
  ReactDOM.render(
    React.createElement(
      ErrorBoundary,
      props,
      React.createElement(
        React.Suspense,
        { fallback: React.createElement(Fallback, props) },
        React.createElement(Test, props)
      )
    ),
    document.createElement("div")
  );
}
