module.exports = lazyValue;

function lazyValue(init) {
  let getValue = function() {
    let value = init();

    getValue = function() {
      return value;
    };

    if (isThenable(value)) {
      getValue = function() {
        throw value;
      };

      value.then(
        function(result) {
          getValue = function() {
            return result;
          };
        },
        function(error) {
          getValue = function() {
            throw error;
          };
        }
      );
    }

    return getValue();
  };

  return {
    get value() {
      return getValue();
    }
  };
}

function isThenable(thenable) {
  return (
    thenable !== null &&
    typeof thenable === "object" &&
    typeof thenable.then === "function"
  );
}
