/*!
 * Copyright 2019 Omar Tawfik. Please see LICENSE file at the root of this repository.
 */

export function filterUndefined<T>(...items: (T | undefined)[]): T[] {
  const result = Array<T>();

  items.forEach(item => {
    if (item) {
      result.push(item);
    }
  });

  return result;
}
