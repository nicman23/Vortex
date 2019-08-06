function lazy<T>(func: () => T): () => T {
  let value: T;

  return () => {
    if (value === undefined) {
      value = func();
    }
    return value;
  };
}

export default lazy;
