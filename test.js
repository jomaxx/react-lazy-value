const React = require("react");
const ReactDOM = require("react-dom");
const lazyValue = require("./");

jest.spyOn(console, "error");

function render(tree) {
  ReactDOM.render(tree, document.createElement("div"));
}

test("renders fallback", done => {
  const lazy = lazyValue(async () => null);

  function Fallback() {
    done();
    return null;
  }

  function Test() {
    lazy.value;
    return null;
  }

  render(
    React.createElement(
      React.Suspense,
      { fallback: React.createElement(Fallback) },
      React.createElement(Test)
    )
  );
});

test("renders value", done => {
  const value = {};
  const lazy = lazyValue(async () => value);

  function Test() {
    expect(lazy.value).toBe(value);
    done();
    return null;
  }

  render(
    React.createElement(
      React.Suspense,
      { fallback: null },
      React.createElement(Test)
    )
  );
});

test("renders error", done => {
  console.error.mockReturnValueOnce();

  const value = new Error("error");
  const lazy = lazyValue(async () => Promise.reject(value));

  class ErrorBoundary extends React.Component {
    static getDerivedStateFromError(error) {
      return { error };
    }

    componentDidUpdate() {
      expect(this.state.error).toBe(value);
      done();
    }

    render() {
      if (this.state) return null;
      return this.props.children;
    }
  }

  function Test() {
    lazy.value;
    return null;
  }

  render(
    React.createElement(
      ErrorBoundary,
      null,
      React.createElement(
        React.Suspense,
        { fallback: null },
        React.createElement(Test)
      )
    )
  );
});
