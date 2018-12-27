const lazyValue = require("../");

describe("JSON.stringify", () => {
  test("lazy", () => {
    const lazy = lazyValue(() => 1);
    expect(JSON.stringify(lazy)).toBe(undefined);
  });

  test("pending", () => {
    const lazy = lazyValue.touch(lazyValue(async () => 1));
    expect(JSON.stringify(lazy)).toBe(undefined);
  });

  test("resolved", async () => {
    const value = 1;
    const lazy = lazyValue(async () => 1);

    try {
      lazy.value;
    } catch (promise) {
      await promise;
    }

    expect(JSON.stringify(lazy)).toBe(JSON.stringify({ value }));
  });

  test("rejected", async () => {
    const lazy = lazyValue(async () => Promise.reject(new Error("error")));

    try {
      lazy.value;
    } catch (promise) {
      await promise.catch(() => {});
    }

    expect(JSON.stringify(lazy)).toBe(undefined);
  });

  test("value", () => {
    const value = 1;
    const lazy = lazyValue.touch(lazyValue(() => value));
    expect(JSON.stringify(lazy)).toBe(JSON.stringify({ value }));
  });
});
