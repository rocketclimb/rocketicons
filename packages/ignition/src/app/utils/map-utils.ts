interface Array<T> {
  groupBy<K>(grouper: (item: T) => K): Map<K, Array<T>>;
}

Array.prototype.groupBy = function <K, V>(
  grouper: (item: V) => K
): Map<K, Array<V>> {
  console.log("groupBy called");

  return this.reduce((store: Map<K, Array<V>>, item: V) => {
    const key = grouper(item);
    if (!store.has(key)) {
      store.set(key, [item]);
    } else {
      store.get(key)?.push(item);
    }
    return store;
  }, new Map<K, Array<V>>());
};
