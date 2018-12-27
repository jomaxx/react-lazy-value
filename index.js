module.exports = lazyValue;
module.exports.touch = touch;

function lazyValue(init) {
  let toJSON = function() {
    return undefined;
  };

  let getValue = function() {
    let value = init();

    if (isThenable(value)) {
      getValue = function() {
        throw value;
      };

      value.then(
        function(result) {
          toJSON = undefined;

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
    } else {
      toJSON = undefined;

      getValue = function() {
        return value;
      };
    }

    return getValue();
  };

  return {
    get value() {
      return getValue();
    },

    get toJSON() {
      return toJSON;
    }
  };
}

function touch(lazy) {
  try {
    lazy.value;
  } catch (error) {}

  return lazy;
}

function isThenable(thenable) {
  return (
    thenable !== null &&
    typeof thenable === "object" &&
    typeof thenable.then === "function"
  );
}
