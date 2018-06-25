export function last<T>(list: T[]): T {
  return list[list.length - 1];
}

/*
Item represents a member in any of our arrays.
Since we are expecting arbitrarily nested arrays then we define Item as either Number or any[]
*/
export type Item = any | any[];

const isArray: (i: Item) => i is any[] = Array.isArray;

/*
Converts an arbitrarily nested array of arrays and/or integers into a single-dimension array
of integers preserving the order.
*/
export function flatten(array: Item[]): any[] {
  if (!isArray(array)) return [array];

  return array.reduce((acc: any[], next: Item) => {
    if (!isArray(next)) {
      acc.push(next);
    } else if (next.length) {
      flatten(next).forEach(item => {
        acc.push(item);
      });
    }
    return acc;
  }, []);
}
