"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function last(list) {
    return list[list.length - 1];
}
exports.last = last;
const isArray = Array.isArray;
/*
Converts an arbitrarily nested array of arrays and/or integers into a single-dimension array
of integers preserving the order.
*/
function flatten(array) {
    if (!isArray(array))
        return [array];
    return array.reduce((acc, next) => {
        if (!isArray(next)) {
            acc.push(next);
        }
        else if (next.length) {
            flatten(next).forEach(item => {
                acc.push(item);
            });
        }
        return acc;
    }, []);
}
exports.flatten = flatten;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaGVscGVycy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImhlbHBlcnMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSxjQUF3QixJQUFTO0lBQy9CLE9BQU8sSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUM7QUFDL0IsQ0FBQztBQUZELG9CQUVDO0FBUUQsTUFBTSxPQUFPLEdBQTRCLEtBQUssQ0FBQyxPQUFPLENBQUM7QUFFdkQ7OztFQUdFO0FBQ0YsaUJBQXdCLEtBQWE7SUFDbkMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUM7UUFBRSxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUM7SUFFcEMsT0FBTyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUMsR0FBVSxFQUFFLElBQVUsRUFBRSxFQUFFO1FBQzdDLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEVBQUU7WUFDbEIsR0FBRyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztTQUNoQjthQUFNLElBQUksSUFBSSxDQUFDLE1BQU0sRUFBRTtZQUN0QixPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxFQUFFO2dCQUMzQixHQUFHLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQ2pCLENBQUMsQ0FBQyxDQUFDO1NBQ0o7UUFDRCxPQUFPLEdBQUcsQ0FBQztJQUNiLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQztBQUNULENBQUM7QUFiRCwwQkFhQyIsInNvdXJjZXNDb250ZW50IjpbImV4cG9ydCBmdW5jdGlvbiBsYXN0PFQ+KGxpc3Q6IFRbXSk6IFQge1xuICByZXR1cm4gbGlzdFtsaXN0Lmxlbmd0aCAtIDFdO1xufVxuXG4vKlxuSXRlbSByZXByZXNlbnRzIGEgbWVtYmVyIGluIGFueSBvZiBvdXIgYXJyYXlzLlxuU2luY2Ugd2UgYXJlIGV4cGVjdGluZyBhcmJpdHJhcmlseSBuZXN0ZWQgYXJyYXlzIHRoZW4gd2UgZGVmaW5lIEl0ZW0gYXMgZWl0aGVyIE51bWJlciBvciBhbnlbXVxuKi9cbmV4cG9ydCB0eXBlIEl0ZW0gPSBhbnkgfCBhbnlbXTtcblxuY29uc3QgaXNBcnJheTogKGk6IEl0ZW0pID0+IGkgaXMgYW55W10gPSBBcnJheS5pc0FycmF5O1xuXG4vKlxuQ29udmVydHMgYW4gYXJiaXRyYXJpbHkgbmVzdGVkIGFycmF5IG9mIGFycmF5cyBhbmQvb3IgaW50ZWdlcnMgaW50byBhIHNpbmdsZS1kaW1lbnNpb24gYXJyYXlcbm9mIGludGVnZXJzIHByZXNlcnZpbmcgdGhlIG9yZGVyLlxuKi9cbmV4cG9ydCBmdW5jdGlvbiBmbGF0dGVuKGFycmF5OiBJdGVtW10pOiBhbnlbXSB7XG4gIGlmICghaXNBcnJheShhcnJheSkpIHJldHVybiBbYXJyYXldO1xuXG4gIHJldHVybiBhcnJheS5yZWR1Y2UoKGFjYzogYW55W10sIG5leHQ6IEl0ZW0pID0+IHtcbiAgICBpZiAoIWlzQXJyYXkobmV4dCkpIHtcbiAgICAgIGFjYy5wdXNoKG5leHQpO1xuICAgIH0gZWxzZSBpZiAobmV4dC5sZW5ndGgpIHtcbiAgICAgIGZsYXR0ZW4obmV4dCkuZm9yRWFjaChpdGVtID0+IHtcbiAgICAgICAgYWNjLnB1c2goaXRlbSk7XG4gICAgICB9KTtcbiAgICB9XG4gICAgcmV0dXJuIGFjYztcbiAgfSwgW10pO1xufVxuIl19