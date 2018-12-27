module.exports = lazyValue;
module.exports.touch = touch;

function lazyValue(init) {
  let getValue = function() {
    let value = init();

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
    } else {
      getValue = function() {
        return value;
      };
    }

    return getValue();
  };

  return {
    get value() {
      return getValue();
    }
  };
}

function touch(lazy) {
  try {
    lazy.value;
  } catch (error) {}
}

function isThenable(thenable) {
  return (
    thenable !== null &&
    typeof thenable === "object" &&
    typeof thenable.then === "function"
  );
}
