module.exports = lazyValue;

function lazyValue(init) {
  let getValue = function() {
    let promise = init();

    getValue = function() {
      throw promise;
    };

    promise.then(
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

    return getValue();
  };

  return {
    get value() {
      return getValue();
    }
  };
}
