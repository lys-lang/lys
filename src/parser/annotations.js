"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Annotation {
    get name() {
        return this.constructor.name;
    }
    toString() {
        return this.name;
    }
}
exports.Annotation = Annotation;
var annotations;
(function (annotations) {
    class IsTailRec extends Annotation {
    }
    annotations.IsTailRec = IsTailRec;
    class LabelId extends Annotation {
        constructor(label) {
            super();
            this.label = label;
            //stub
        }
    }
    annotations.LabelId = LabelId;
    class IsTailRecCall extends Annotation {
    }
    annotations.IsTailRecCall = IsTailRecCall;
    class IsValueNode extends Annotation {
    }
    annotations.IsValueNode = IsValueNode;
    class IsReturnExpression extends Annotation {
        constructor() {
            super(...arguments);
            this.targetLocal = null;
        }
        toString() {
            if (this.targetLocal === null)
                return super.toString();
            return super.toString() + `[${this.targetLocal.index}]`;
        }
    }
    annotations.IsReturnExpression = IsReturnExpression;
})(annotations = exports.annotations || (exports.annotations = {}));
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYW5ub3RhdGlvbnMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJhbm5vdGF0aW9ucy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUVBO0lBQ0UsSUFBSSxJQUFJO1FBQ04sT0FBTyxJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQztJQUMvQixDQUFDO0lBQ0QsUUFBUTtRQUNOLE9BQU8sSUFBSSxDQUFDLElBQUksQ0FBQztJQUNuQixDQUFDO0NBQ0Y7QUFQRCxnQ0FPQztBQUdELElBQWlCLFdBQVcsQ0FzQjNCO0FBdEJELFdBQWlCLFdBQVc7SUFDMUIsZUFBdUIsU0FBUSxVQUFVO0tBQUc7SUFBL0IscUJBQVMsWUFBc0IsQ0FBQTtJQUU1QyxhQUFxQixTQUFRLFVBQVU7UUFDckMsWUFBbUIsS0FBYTtZQUM5QixLQUFLLEVBQUUsQ0FBQztZQURTLFVBQUssR0FBTCxLQUFLLENBQVE7WUFFOUIsTUFBTTtRQUNSLENBQUM7S0FDRjtJQUxZLG1CQUFPLFVBS25CLENBQUE7SUFFRCxtQkFBMkIsU0FBUSxVQUFVO0tBQUc7SUFBbkMseUJBQWEsZ0JBQXNCLENBQUE7SUFFaEQsaUJBQXlCLFNBQVEsVUFBVTtLQUFHO0lBQWpDLHVCQUFXLGNBQXNCLENBQUE7SUFFOUMsd0JBQWdDLFNBQVEsVUFBVTtRQUFsRDs7WUFDRSxnQkFBVyxHQUFpQixJQUFJLENBQUM7UUFNbkMsQ0FBQztRQUpDLFFBQVE7WUFDTixJQUFJLElBQUksQ0FBQyxXQUFXLEtBQUssSUFBSTtnQkFBRSxPQUFPLEtBQUssQ0FBQyxRQUFRLEVBQUUsQ0FBQztZQUN2RCxPQUFPLEtBQUssQ0FBQyxRQUFRLEVBQUUsR0FBRyxJQUFJLElBQUksQ0FBQyxXQUFXLENBQUMsS0FBSyxHQUFHLENBQUM7UUFDMUQsQ0FBQztLQUNGO0lBUFksOEJBQWtCLHFCQU85QixDQUFBO0FBQ0gsQ0FBQyxFQXRCZ0IsV0FBVyxHQUFYLG1CQUFXLEtBQVgsbUJBQVcsUUFzQjNCIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgTG9jYWwgfSBmcm9tICcuL25vZGVzJztcblxuZXhwb3J0IGFic3RyYWN0IGNsYXNzIEFubm90YXRpb24ge1xuICBnZXQgbmFtZSgpOiBzdHJpbmcge1xuICAgIHJldHVybiB0aGlzLmNvbnN0cnVjdG9yLm5hbWU7XG4gIH1cbiAgdG9TdHJpbmcoKSB7XG4gICAgcmV0dXJuIHRoaXMubmFtZTtcbiAgfVxufVxuZXhwb3J0IHR5cGUgSUFubm90YXRpb25Db25zdHJ1Y3RvcjxUIGV4dGVuZHMgQW5ub3RhdGlvbj4gPSB7IG5ldyAoLi4uYXJncyk6IFQgfTtcblxuZXhwb3J0IG5hbWVzcGFjZSBhbm5vdGF0aW9ucyB7XG4gIGV4cG9ydCBjbGFzcyBJc1RhaWxSZWMgZXh0ZW5kcyBBbm5vdGF0aW9uIHt9XG5cbiAgZXhwb3J0IGNsYXNzIExhYmVsSWQgZXh0ZW5kcyBBbm5vdGF0aW9uIHtcbiAgICBjb25zdHJ1Y3RvcihwdWJsaWMgbGFiZWw6IHN0cmluZykge1xuICAgICAgc3VwZXIoKTtcbiAgICAgIC8vc3R1YlxuICAgIH1cbiAgfVxuXG4gIGV4cG9ydCBjbGFzcyBJc1RhaWxSZWNDYWxsIGV4dGVuZHMgQW5ub3RhdGlvbiB7fVxuXG4gIGV4cG9ydCBjbGFzcyBJc1ZhbHVlTm9kZSBleHRlbmRzIEFubm90YXRpb24ge31cblxuICBleHBvcnQgY2xhc3MgSXNSZXR1cm5FeHByZXNzaW9uIGV4dGVuZHMgQW5ub3RhdGlvbiB7XG4gICAgdGFyZ2V0TG9jYWw6IG51bGwgfCBMb2NhbCA9IG51bGw7XG5cbiAgICB0b1N0cmluZygpIHtcbiAgICAgIGlmICh0aGlzLnRhcmdldExvY2FsID09PSBudWxsKSByZXR1cm4gc3VwZXIudG9TdHJpbmcoKTtcbiAgICAgIHJldHVybiBzdXBlci50b1N0cmluZygpICsgYFske3RoaXMudGFyZ2V0TG9jYWwuaW5kZXh9XWA7XG4gICAgfVxuICB9XG59XG4iXX0=