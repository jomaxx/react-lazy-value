const React = require("react");
const ReactDOM = require("react-dom");
const lazyValue = require("../");

jest.spyOn(console, "error");

describe("ReactDOM renders", () => {
  test("pending", done => {
    render({
      lazy: lazyValue(async () => 1),
      onFallback: done
    });
  });

  test("resolved", done => {
    const value = {};

    render({
      lazy: lazyValue(async () => value),
      onMount(result) {
        expect(result).toBe(value);
        done();
      }
    });
  });

  test("rejected", done => {
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

  test("value", done => {
    const value = {};

    render({
      lazy: lazyValue(() => value),
      onMount(result) {
        expect(result).toBe(value);
        done();
      }
    });
  });
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
