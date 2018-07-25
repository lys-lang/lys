"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const types_1 = require("./types");
var Nodes;
(function (Nodes) {
    class Node {
        constructor(astNode) {
            this.astNode = astNode;
            this.hasParentheses = false;
            this.errors = [];
            this.ofType = null;
        }
        /** Name of the node constructor */
        get nodeName() {
            return this.constructor.name;
        }
        get children() {
            let accumulator = [];
            Object.keys(this).forEach($ => {
                if ($ == 'parent')
                    return;
                if (this[$] && this[$] instanceof Node) {
                    accumulator.push(this[$]);
                }
                if (this[$] && this[$] instanceof Array && this[$].length && this[$][0] instanceof Node) {
                    accumulator.push(...this[$]);
                }
            });
            return accumulator;
        }
        get text() {
            return '';
        }
        hasAnnotation(name) {
            if (!this.annotations)
                return false;
            if (typeof name === 'function') {
                return !!this.getAnnotation(name);
            }
            else {
                return this.annotations.has(name);
            }
        }
        getAnnotationsByClass(klass) {
            const ret = [];
            if (this.annotations) {
                this.annotations.forEach($ => {
                    if ($ instanceof klass)
                        ret.push($);
                });
            }
            return ret;
        }
        getAnnotation(klass) {
            const ret = [];
            if (this.annotations) {
                this.annotations.forEach($ => {
                    if ($ instanceof klass)
                        ret.push($);
                });
            }
            return ret[0];
        }
        removeAnnotation(name) {
            if (typeof name === 'function') {
                this.getAnnotationsByClass(name).forEach($ => this.annotations.delete($));
            }
            else {
                this.annotations.delete(name);
            }
        }
        annotate(annotation) {
            if (!this.annotations)
                this.annotations = new Set();
            this.annotations.add(annotation);
        }
        getAnnotations() {
            if (!this.annotations) {
                this.annotations = new Set();
            }
            return this.annotations;
        }
    }
    Nodes.Node = Node;
    class ExpressionNode extends Node {
    }
    Nodes.ExpressionNode = ExpressionNode;
    class NameIdentifierNode extends Node {
        get text() {
            return JSON.stringify(this.name);
        }
    }
    Nodes.NameIdentifierNode = NameIdentifierNode;
    class TypeNode extends Node {
    }
    Nodes.TypeNode = TypeNode;
    class TypeReferenceNode extends TypeNode {
        constructor() {
            super(...arguments);
            this.isPointer = 0;
            this.isArray = false;
        }
        get text() {
            return JSON.stringify(this.name.name);
        }
    }
    Nodes.TypeReferenceNode = TypeReferenceNode;
    class FunctionParameterTypeNode extends TypeNode {
    }
    Nodes.FunctionParameterTypeNode = FunctionParameterTypeNode;
    class FunctionTypeNode extends TypeNode {
    }
    Nodes.FunctionTypeNode = FunctionTypeNode;
    class VariableReferenceNode extends ExpressionNode {
    }
    Nodes.VariableReferenceNode = VariableReferenceNode;
    class BlockNode extends ExpressionNode {
    }
    Nodes.BlockNode = BlockNode;
    class DirectiveNode extends Node {
        constructor() {
            super(...arguments);
            this.isExported = false;
        }
    }
    Nodes.DirectiveNode = DirectiveNode;
    class DocumentNode extends Node {
        constructor() {
            super(...arguments);
            this.errors = [];
        }
    }
    Nodes.DocumentNode = DocumentNode;
    class ParameterNode extends Node {
    }
    Nodes.ParameterNode = ParameterNode;
    class FunctionNode extends ExpressionNode {
        constructor() {
            super(...arguments);
            this.injected = false;
            this.parameters = [];
            this.localsByName = new Map();
            /** Array of locals by index. */
            this.localsByIndex = [];
            /** List of additional non-parameter locals. */
            this.additionalLocals = [];
            /** Current break context label. */
            this.breakContext = null;
            this.nextInlineId = 0;
            this.nextBreakId = 0;
            this.breakStack = null;
            this.tempI32s = null;
            this.tempI64s = null;
            this.tempF32s = null;
            this.tempF64s = null;
        }
        processParameters() {
            let localIndex = 0;
            this.parameters.forEach(parameter => {
                let local = new Local(localIndex++, parameter.parameterName.name, parameter.parameterName);
                this.localsByName.set(local.name, local);
                this.localsByIndex[local.index] = local;
            });
        }
        /** Adds a local of the specified type, with an optional name. */
        addLocal(type, name = null, declaration = null) {
            // if it has a name, check previously as this method will throw otherwise
            var localIndex = this.parameters.length + this.additionalLocals.length;
            var local = new Local(localIndex, name ? name : 'var$' + localIndex.toString(10), declaration);
            local.type = type;
            if (name) {
                if (this.localsByName.has(name))
                    throw new Error('duplicate local name');
                this.localsByName.set(name, local);
            }
            this.localsByIndex[local.index] = local;
            this.additionalLocals.push(local);
            return local;
        }
        /** Gets a free temporary local of the specified type. */
        getTempLocal(type) {
            var temps;
            switch (type.nativeType) {
                case types_1.NativeTypes.i32: {
                    temps = this.tempI32s;
                    break;
                }
                case types_1.NativeTypes.i64: {
                    temps = this.tempI64s;
                    break;
                }
                case types_1.NativeTypes.f32: {
                    temps = this.tempF32s;
                    break;
                }
                case types_1.NativeTypes.f64: {
                    temps = this.tempF64s;
                    break;
                }
                default:
                    throw new Error('concrete type expected');
            }
            var local;
            if (temps && temps.length) {
                local = temps.pop();
                local.type = type;
            }
            else {
                local = this.addLocal(type);
            }
            return local;
        }
        /** Frees the temporary local for reuse. */
        freeTempLocal(local) {
            var temps;
            if (local.type === null)
                throw new Error('type is null'); // internal error
            switch (local.type.nativeType) {
                case types_1.NativeTypes.i32: {
                    temps = this.tempI32s || (this.tempI32s = []);
                    break;
                }
                case types_1.NativeTypes.i64: {
                    temps = this.tempI64s || (this.tempI64s = []);
                    break;
                }
                case types_1.NativeTypes.f32: {
                    temps = this.tempF32s || (this.tempF32s = []);
                    break;
                }
                case types_1.NativeTypes.f64: {
                    temps = this.tempF64s || (this.tempF64s = []);
                    break;
                }
                default:
                    throw new Error('concrete type expected');
            }
            if (local.index < 0)
                throw new Error('invalid local index');
            temps.push(local);
        }
        /** Gets and immediately frees a temporary local of the specified type. */
        getAndFreeTempLocal(type) {
            var temps;
            switch (type.nativeType) {
                case types_1.NativeTypes.i32: {
                    temps = this.tempI32s || (this.tempI32s = []);
                    break;
                }
                case types_1.NativeTypes.i64: {
                    temps = this.tempI64s || (this.tempI64s = []);
                    break;
                }
                case types_1.NativeTypes.f32: {
                    temps = this.tempF32s || (this.tempF32s = []);
                    break;
                }
                case types_1.NativeTypes.f64: {
                    temps = this.tempF64s || (this.tempF64s = []);
                    break;
                }
                default:
                    throw new Error('concrete type expected');
            }
            var local;
            if (temps.length) {
                local = temps[temps.length - 1];
                local.type = type;
            }
            else {
                local = this.addLocal(type);
                temps.push(local);
            }
            return local;
        }
        /** Enters a(nother) break context. */
        enterBreakContext() {
            var id = this.nextBreakId++;
            if (!this.breakStack)
                this.breakStack = [id];
            else
                this.breakStack.push(id);
            return (this.breakContext = id.toString(10));
        }
        /** Leaves the current break context. */
        leaveBreakContext() {
            if (!this.breakStack)
                throw new Error('there was no breakStack');
            var length = this.breakStack.length;
            if (length == 0)
                throw new Error('the breakStack is empty');
            this.breakStack.pop();
            if (length > 1) {
                this.breakContext = this.breakStack[length - 2].toString(10);
            }
            else {
                this.breakContext = null;
                this.breakStack = null;
            }
        }
        /** Finalizes the function once compiled, releasing no longer needed resources. */
        finalize() {
            if (this.breakStack && this.breakStack.length)
                throw new Error('break stack');
            this.breakStack = null;
            this.breakContext = null;
            this.tempI32s = this.tempI64s = this.tempF32s = this.tempF64s = null;
        }
    }
    Nodes.FunctionNode = FunctionNode;
    class ContextAwareFunction extends FunctionNode {
        constructor(baseFunction, closure) {
            super(baseFunction.astNode);
            this.baseFunction = baseFunction;
            this.closure = closure;
            this.injected = true;
            this.functionName = baseFunction.functionName;
            this.functionReturnType = baseFunction.functionReturnType;
            this.parameters = baseFunction.parameters;
            this.body = baseFunction.body;
        }
    }
    Nodes.ContextAwareFunction = ContextAwareFunction;
    class FunDirectiveNode extends DirectiveNode {
    }
    Nodes.FunDirectiveNode = FunDirectiveNode;
    class OverloadedFunctionNode extends DirectiveNode {
        constructor() {
            super(...arguments);
            this.injected = true;
            this.functions = [];
        }
    }
    Nodes.OverloadedFunctionNode = OverloadedFunctionNode;
    class VarDeclarationNode extends Node {
        constructor() {
            super(...arguments);
            this.mutable = true;
        }
    }
    Nodes.VarDeclarationNode = VarDeclarationNode;
    class ValDeclarationNode extends VarDeclarationNode {
        constructor() {
            super(...arguments);
            this.mutable = false;
        }
    }
    Nodes.ValDeclarationNode = ValDeclarationNode;
    class VarDirectiveNode extends DirectiveNode {
    }
    Nodes.VarDirectiveNode = VarDirectiveNode;
    class ValDirectiveNode extends VarDirectiveNode {
    }
    Nodes.ValDirectiveNode = ValDirectiveNode;
    class AssignmentNode extends Node {
    }
    Nodes.AssignmentNode = AssignmentNode;
    class TypeDirectiveNode extends DirectiveNode {
    }
    Nodes.TypeDirectiveNode = TypeDirectiveNode;
    class LiteralNode extends ExpressionNode {
        get text() {
            return JSON.stringify(this.value);
        }
    }
    Nodes.LiteralNode = LiteralNode;
    class FloatLiteral extends LiteralNode {
        get value() {
            return parseFloat(this.astNode.text);
        }
        set value(value) {
            this.astNode.text = value.toString();
        }
    }
    Nodes.FloatLiteral = FloatLiteral;
    class IntegerLiteral extends LiteralNode {
        get value() {
            return parseInt(this.astNode.text);
        }
        set value(value) {
            this.astNode.text = value.toString();
        }
    }
    Nodes.IntegerLiteral = IntegerLiteral;
    class BooleanLiteral extends LiteralNode {
        get value() {
            return this.astNode.text.trim() == 'true';
        }
        set value(value) {
            this.astNode.text = value.toString();
        }
    }
    Nodes.BooleanLiteral = BooleanLiteral;
    class NullLiteral extends LiteralNode {
        constructor() {
            super(...arguments);
            this.value = null;
        }
    }
    Nodes.NullLiteral = NullLiteral;
    class FunctionCallNode extends ExpressionNode {
        constructor() {
            super(...arguments);
            this.isInfix = false;
        }
    }
    Nodes.FunctionCallNode = FunctionCallNode;
    class BinaryExpressionNode extends ExpressionNode {
        get text() {
            if (!this.operator)
                throw new Error('BinaryExpressionNode w/o operator');
            return JSON.stringify(this.operator);
        }
    }
    Nodes.BinaryExpressionNode = BinaryExpressionNode;
    class UnaryExpressionNode extends ExpressionNode {
        get text() {
            return JSON.stringify(this.operator);
        }
    }
    Nodes.UnaryExpressionNode = UnaryExpressionNode;
    class BooleanNegNode extends ExpressionNode {
    }
    Nodes.BooleanNegNode = BooleanNegNode;
    class NumberNegNode extends ExpressionNode {
    }
    Nodes.NumberNegNode = NumberNegNode;
    class MatcherNode extends ExpressionNode {
    }
    Nodes.MatcherNode = MatcherNode;
    class IfNode extends ExpressionNode {
    }
    Nodes.IfNode = IfNode;
    class MatchConditionNode extends MatcherNode {
    }
    Nodes.MatchConditionNode = MatchConditionNode;
    class MatchLiteralNode extends MatcherNode {
    }
    Nodes.MatchLiteralNode = MatchLiteralNode;
    class MatchDefaultNode extends MatcherNode {
    }
    Nodes.MatchDefaultNode = MatchDefaultNode;
    class PatternMatcherNode extends ExpressionNode {
    }
    Nodes.PatternMatcherNode = PatternMatcherNode;
    /////// Non-grammar nodes
    /** This node replaces the function body */
    class TailRecLoopNode extends Nodes.ExpressionNode {
    }
    Nodes.TailRecLoopNode = TailRecLoopNode;
})(Nodes = exports.Nodes || (exports.Nodes = {}));
class Global {
    constructor(index, name, declarationNode) {
        this.index = index;
        this.name = name;
        this.declarationNode = declarationNode;
    }
}
exports.Global = Global;
class Local {
    /** index in the function */
    constructor(index, name, declarationNode) {
        this.index = index;
        this.name = name;
        this.declarationNode = declarationNode;
    }
}
exports.Local = Local;
function findNodesByType(astRoot, type, list = []) {
    if (astRoot instanceof type) {
        list.push(astRoot);
    }
    astRoot.children.forEach($ => findNodesByType($, type, list));
    return list;
}
exports.findNodesByType = findNodesByType;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibm9kZXMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJub2Rlcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUVBLG1DQUEwRDtBQUkxRCxJQUFpQixLQUFLLENBcWZyQjtBQXJmRCxXQUFpQixLQUFLO0lBQ3BCO1FBU0UsWUFBbUIsT0FBZ0I7WUFBaEIsWUFBTyxHQUFQLE9BQU8sQ0FBUztZQVJuQyxtQkFBYyxHQUFZLEtBQUssQ0FBQztZQUNoQyxXQUFNLEdBQVksRUFBRSxDQUFDO1lBR3JCLFdBQU0sR0FBUyxJQUFJLENBQUM7UUFJa0IsQ0FBQztRQUV2QyxtQ0FBbUM7UUFDbkMsSUFBSSxRQUFRO1lBQ1YsT0FBTyxJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQztRQUMvQixDQUFDO1FBRUQsSUFBSSxRQUFRO1lBQ1YsSUFBSSxXQUFXLEdBQVcsRUFBRSxDQUFDO1lBRTdCLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxFQUFFO2dCQUM1QixJQUFJLENBQUMsSUFBSSxRQUFRO29CQUFFLE9BQU87Z0JBQzFCLElBQUksSUFBSSxDQUFDLENBQUMsQ0FBQyxJQUFJLElBQUksQ0FBQyxDQUFDLENBQUMsWUFBWSxJQUFJLEVBQUU7b0JBQ3RDLFdBQVcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7aUJBQzNCO2dCQUNELElBQUksSUFBSSxDQUFDLENBQUMsQ0FBQyxJQUFJLElBQUksQ0FBQyxDQUFDLENBQUMsWUFBWSxLQUFLLElBQUksSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sSUFBSSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFlBQVksSUFBSSxFQUFFO29CQUN2RixXQUFXLENBQUMsSUFBSSxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7aUJBQzlCO1lBQ0gsQ0FBQyxDQUFDLENBQUM7WUFF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LENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO0tBQ3BCO0lBQ0QsT0FBTyxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxlQUFlLENBQUMsQ0FBQyxFQUFFLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDO0lBQzlELE9BQU8sSUFBSSxDQUFDO0FBQ2QsQ0FBQztBQU5ELDBDQU1DIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgSVRva2VuLCBUb2tlbkVycm9yIH0gZnJvbSAnZWJuZic7XG5pbXBvcnQgeyBDbG9zdXJlIH0gZnJvbSAnLi9jbG9zdXJlJztcbmltcG9ydCB7IFR5cGUsIE5hdGl2ZVR5cGVzLCBGdW5jdGlvblR5cGUgfSBmcm9tICcuL3R5cGVzJztcbmltcG9ydCB7IEJpbmFyeU9wZXJhdGlvbiB9IGZyb20gJy4uL2NvbXBpbGVyL2xhbmd1YWdlT3BlcmF0aW9ucyc7XG5pbXBvcnQgeyBBbm5vdGF0aW9uLCBJQW5ub3RhdGlvbkNvbnN0cnVjdG9yIH0gZnJvbSAnLi9hbm5vdGF0aW9ucyc7XG5cbmV4cG9ydCBuYW1lc3BhY2UgTm9kZXMge1xuICBleHBvcnQgYWJzdHJhY3QgY2xhc3MgTm9kZSB7XG4gICAgaGFzUGFyZW50aGVzZXM6IGJvb2xlYW4gPSBmYWxzZTtcbiAgICBlcnJvcnM6IEVycm9yW10gPSBbXTtcbiAgICBjbG9zdXJlOiBDbG9zdXJlO1xuICAgIHBhcmVudDogTm9kZTtcbiAgICBvZlR5cGU6IFR5cGUgPSBudWxsO1xuXG4gICAgcHJpdmF0ZSBhbm5vdGF0aW9uczogU2V0PEFubm90YXRpb24+O1xuXG4gICAgY29uc3RydWN0b3IocHVibGljIGFzdE5vZGU/OiBJVG9rZW4pIHt9XG5cbiAgICAvKiogTmFtZSBvZiB0aGUgbm9kZSBjb25zdHJ1Y3RvciAqL1xuICAgIGdldCBub2RlTmFtZSgpOiBzdHJpbmcge1xuICAgICAgcmV0dXJuIHRoaXMuY29uc3RydWN0b3IubmFtZTtcbiAgICB9XG5cbiAgICBnZXQgY2hpbGRyZW4oKTogTm9kZVtdIHtcbiAgICAgIGxldCBhY2N1bXVsYXRvcjogTm9kZVtdID0gW107XG5cbiAgICAgIE9iamVjdC5rZXlzKHRoaXMpLmZvckVhY2goJCA9PiB7XG4gICAgICAgIGlmICgkID09ICdwYXJlbnQnKSByZXR1cm47XG4gICAgICAgIGlmICh0aGlzWyRdICYmIHRoaXNbJF0gaW5zdGFuY2VvZiBOb2RlKSB7XG4gICAgICAgICAgYWNjdW11bGF0b3IucHVzaCh0aGlzWyRdKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodGhpc1skXSAmJiB0aGlzWyRdIGluc3RhbmNlb2YgQXJyYXkgJiYgdGhpc1skXS5sZW5ndGggJiYgdGhpc1skXVswXSBpbnN0YW5jZW9mIE5vZGUpIHtcbiAgICAgICAgICBhY2N1bXVsYXRvci5wdXNoKC4uLnRoaXNbJF0pO1xuICAgICAgICB9XG4gICAgICB9KTtcblxuICAgICAgcmV0dXJuIGFjY3VtdWxhdG9yO1xuICAgIH1cblxuICAgIGdldCB0ZXh0KCkge1xuICAgICAgcmV0dXJuICcnO1xuICAgIH1cblxuICAgIGhhc0Fubm90YXRpb248VCBleHRlbmRzIEFubm90YXRpb24gPSBBbm5vdGF0aW9uPihuYW1lOiBBbm5vdGF0aW9uIHwgSUFubm90YXRpb25Db25zdHJ1Y3RvcjxUPikge1xuICAgICAgaWYgKCF0aGlzLmFubm90YXRpb25zKSByZXR1cm4gZmFsc2U7XG5cbiAgICAgIGlmICh0eXBlb2YgbmFtZSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICByZXR1cm4gISF0aGlzLmdldEFubm90YXRpb24obmFtZSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gdGhpcy5hbm5vdGF0aW9ucy5oYXMobmFtZSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgZ2V0QW5ub3RhdGlvbnNCeUNsYXNzPFQgZXh0ZW5kcyBBbm5vdGF0aW9uPihrbGFzczogSUFubm90YXRpb25Db25zdHJ1Y3RvcjxUPik6IFRbXSB7XG4gICAgICBjb25zdCByZXQgPSBbXTtcbiAgICAgIGlmICh0aGlzLmFubm90YXRpb25zKSB7XG4gICAgICAgIHRoaXMuYW5ub3RhdGlvbnMuZm9yRWFjaCgkID0+IHtcbiAgICAgICAgICBpZiAoJCBpbnN0YW5jZW9mIGtsYXNzKSByZXQucHVzaCgkKTtcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgICByZXR1cm4gcmV0O1xuICAgIH1cblxuICAgIGdldEFubm90YXRpb248VCBleHRlbmRzIEFubm90YXRpb24+KGtsYXNzOiBJQW5ub3RhdGlvbkNvbnN0cnVjdG9yPFQ+KTogVCB7XG4gICAgICBjb25zdCByZXQgPSBbXTtcbiAgICAgIGlmICh0aGlzLmFubm90YXRpb25zKSB7XG4gICAgICAgIHRoaXMuYW5ub3RhdGlvbnMuZm9yRWFjaCgkID0+IHtcbiAgICAgICAgICBpZiAoJCBpbnN0YW5jZW9mIGtsYXNzKSByZXQucHVzaCgkKTtcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgICByZXR1cm4gcmV0WzBdO1xuICAgIH1cblxuICAgIHJlbW92ZUFubm90YXRpb248VCBleHRlbmRzIEFubm90YXRpb24gPSBBbm5vdGF0aW9uPihuYW1lOiBBbm5vdGF0aW9uIHwgSUFubm90YXRpb25Db25zdHJ1Y3RvcjxUPikge1xuICAgICAgaWYgKHR5cGVvZiBuYW1lID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIHRoaXMuZ2V0QW5ub3RhdGlvbnNCeUNsYXNzKG5hbWUpLmZvckVhY2goJCA9PiB0aGlzLmFubm90YXRpb25zLmRlbGV0ZSgkKSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLmFubm90YXRpb25zLmRlbGV0ZShuYW1lKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBhbm5vdGF0ZShhbm5vdGF0aW9uOiBBbm5vdGF0aW9uKSB7XG4gICAgICBpZiAoIXRoaXMuYW5ub3RhdGlvbnMpIHRoaXMuYW5ub3RhdGlvbnMgPSBuZXcgU2V0KCk7XG4gICAgICB0aGlzLmFubm90YXRpb25zLmFkZChhbm5vdGF0aW9uKTtcbiAgICB9XG5cbiAgICBnZXRBbm5vdGF0aW9ucygpIHtcbiAgICAgIGlmICghdGhpcy5hbm5vdGF0aW9ucykge1xuICAgICAgICB0aGlzLmFubm90YXRpb25zID0gbmV3IFNldCgpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHRoaXMuYW5ub3RhdGlvbnM7XG4gICAgfVxuICB9XG5cbiAgZXhwb3J0IGFic3RyYWN0IGNsYXNzIEV4cHJlc3Npb25Ob2RlIGV4dGVuZHMgTm9kZSB7fVxuXG4gIGV4cG9ydCBjbGFzcyBOYW1lSWRlbnRpZmllck5vZGUgZXh0ZW5kcyBOb2RlIHtcbiAgICBuYW1lOiBzdHJpbmc7XG4gICAgZ2V0IHRleHQoKSB7XG4gICAgICByZXR1cm4gSlNPTi5zdHJpbmdpZnkodGhpcy5uYW1lKTtcbiAgICB9XG4gIH1cblxuICBleHBvcnQgY2xhc3MgVHlwZU5vZGUgZXh0ZW5kcyBOb2RlIHtcbiAgICAvKiogUmVzb2x2ZWQgdHlwZSBvYmplY3QgKi9cbiAgICBuYXRpdmVUeXBlOiBUeXBlO1xuICB9XG5cbiAgZXhwb3J0IGNsYXNzIFR5cGVSZWZlcmVuY2VOb2RlIGV4dGVuZHMgVHlwZU5vZGUge1xuICAgIC8qKiBOYW1lIG9mIHRoZSByZWZlcmVuY2VkIHR5cGUgKi9cbiAgICBuYW1lOiBOYW1lSWRlbnRpZmllck5vZGU7XG5cbiAgICBnZXQgdGV4dCgpIHtcbiAgICAgIHJldHVybiBKU09OLnN0cmluZ2lmeSh0aGlzLm5hbWUubmFtZSk7XG4gICAgfVxuXG4gICAgaXNQb2ludGVyOiBudW1iZXIgPSAwO1xuICAgIGlzQXJyYXk6IGJvb2xlYW4gPSBmYWxzZTtcbiAgfVxuXG4gIGV4cG9ydCBjbGFzcyBGdW5jdGlvblBhcmFtZXRlclR5cGVOb2RlIGV4dGVuZHMgVHlwZU5vZGUge1xuICAgIG5hbWU/OiBOYW1lSWRlbnRpZmllck5vZGU7XG4gICAgcGFyYW1ldGVyVHlwZTogVHlwZU5vZGU7XG4gIH1cblxuICBleHBvcnQgY2xhc3MgRnVuY3Rpb25UeXBlTm9kZSBleHRlbmRzIFR5cGVOb2RlIHtcbiAgICByZXR1cm5UeXBlOiBUeXBlTm9kZTtcbiAgICBwYXJhbWV0ZXJzOiBGdW5jdGlvblBhcmFtZXRlclR5cGVOb2RlW107XG4gIH1cblxuICBleHBvcnQgY2xhc3MgVmFyaWFibGVSZWZlcmVuY2VOb2RlIGV4dGVuZHMgRXhwcmVzc2lvbk5vZGUge1xuICAgIHZhcmlhYmxlOiBOYW1lSWRlbnRpZmllck5vZGU7XG4gIH1cblxuICBleHBvcnQgY2xhc3MgQmxvY2tOb2RlIGV4dGVuZHMgRXhwcmVzc2lvbk5vZGUge1xuICAgIGxhYmVsOiBzdHJpbmc7XG4gICAgc3RhdGVtZW50czogTm9kZVtdO1xuICB9XG5cbiAgZXhwb3J0IGFic3RyYWN0IGNsYXNzIERpcmVjdGl2ZU5vZGUgZXh0ZW5kcyBOb2RlIHtcbiAgICBpc0V4cG9ydGVkOiBib29sZWFuID0gZmFsc2U7XG4gIH1cblxuICBleHBvcnQgY2xhc3MgRG9jdW1lbnROb2RlIGV4dGVuZHMgTm9kZSB7XG4gICAgZGlyZWN0aXZlczogRGlyZWN0aXZlTm9kZVtdO1xuICAgIGVycm9yczogVG9rZW5FcnJvcltdID0gW107XG4gICAgZmlsZT86IHN0cmluZztcbiAgICB0ZXh0Q29udGVudDogc3RyaW5nO1xuICB9XG5cbiAgZXhwb3J0IGNsYXNzIFBhcmFtZXRlck5vZGUgZXh0ZW5kcyBOb2RlIHtcbiAgICBwYXJhbWV0ZXJOYW1lOiBOYW1lSWRlbnRpZmllck5vZGU7XG4gICAgcGFyYW1ldGVyVHlwZTogVHlwZU5vZGU7XG4gICAgZGVmYXVsdFZhbHVlOiBFeHByZXNzaW9uTm9kZTtcbiAgfVxuXG4gIGV4cG9ydCBjbGFzcyBGdW5jdGlvbk5vZGUgZXh0ZW5kcyBFeHByZXNzaW9uTm9kZSB7XG4gICAgaW5qZWN0ZWQ6IGJvb2xlYW4gPSBmYWxzZTtcbiAgICBmdW5jdGlvbk5hbWU6IE5hbWVJZGVudGlmaWVyTm9kZTtcbiAgICBmdW5jdGlvblJldHVyblR5cGU6IFR5cGVOb2RlO1xuICAgIHBhcmFtZXRlcnM6IFBhcmFtZXRlck5vZGVbXSA9IFtdO1xuICAgIGJvZHk6IEV4cHJlc3Npb25Ob2RlO1xuXG4gICAgaW50ZXJuYWxJZGVudGlmaWVyOiBzdHJpbmc7XG5cbiAgICBsb2NhbHNCeU5hbWU6IE1hcDxzdHJpbmcsIExvY2FsPiA9IG5ldyBNYXAoKTtcblxuICAgIC8qKiBBcnJheSBvZiBsb2NhbHMgYnkgaW5kZXguICovXG4gICAgbG9jYWxzQnlJbmRleDogTG9jYWxbXSA9IFtdO1xuXG4gICAgLyoqIExpc3Qgb2YgYWRkaXRpb25hbCBub24tcGFyYW1ldGVyIGxvY2Fscy4gKi9cbiAgICBhZGRpdGlvbmFsTG9jYWxzOiBMb2NhbFtdID0gW107XG5cbiAgICAvKiogQ3VycmVudCBicmVhayBjb250ZXh0IGxhYmVsLiAqL1xuICAgIGJyZWFrQ29udGV4dDogc3RyaW5nIHwgbnVsbCA9IG51bGw7XG5cbiAgICAvKiogQ29udGV4dHVhbCB0eXBlIGFyZ3VtZW50cy4gKi9cbiAgICBjb250ZXh0dWFsVHlwZUFyZ3VtZW50czogTWFwPHN0cmluZywgVHlwZT4gfCBudWxsO1xuXG4gICAgbmV4dElubGluZUlkOiBudW1iZXIgPSAwO1xuXG4gICAgcHJpdmF0ZSBuZXh0QnJlYWtJZDogbnVtYmVyID0gMDtcbiAgICBwcml2YXRlIGJyZWFrU3RhY2s6IG51bWJlcltdIHwgbnVsbCA9IG51bGw7XG5cbiAgICBwcml2YXRlIHRlbXBJMzJzOiBMb2NhbFtdIHwgbnVsbCA9IG51bGw7XG4gICAgcHJpdmF0ZSB0ZW1wSTY0czogTG9jYWxbXSB8IG51bGwgPSBudWxsO1xuICAgIHByaXZhdGUgdGVtcEYzMnM6IExvY2FsW10gfCBudWxsID0gbnVsbDtcbiAgICBwcml2YXRlIHRlbXBGNjRzOiBMb2NhbFtdIHwgbnVsbCA9IG51bGw7XG5cbiAgICBwcm9jZXNzUGFyYW1ldGVycygpIHtcbiAgICAgIGxldCBsb2NhbEluZGV4ID0gMDtcblxuICAgICAgdGhpcy5wYXJhbWV0ZXJzLmZvckVhY2gocGFyYW1ldGVyID0+IHtcbiAgICAgICAgbGV0IGxvY2FsID0gbmV3IExvY2FsKGxvY2FsSW5kZXgrKywgcGFyYW1ldGVyLnBhcmFtZXRlck5hbWUubmFtZSwgcGFyYW1ldGVyLnBhcmFtZXRlck5hbWUpO1xuICAgICAgICB0aGlzLmxvY2Fsc0J5TmFtZS5zZXQobG9jYWwubmFtZSwgbG9jYWwpO1xuICAgICAgICB0aGlzLmxvY2Fsc0J5SW5kZXhbbG9jYWwuaW5kZXhdID0gbG9jYWw7XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICAvKiogQWRkcyBhIGxvY2FsIG9mIHRoZSBzcGVjaWZpZWQgdHlwZSwgd2l0aCBhbiBvcHRpb25hbCBuYW1lLiAqL1xuICAgIGFkZExvY2FsKHR5cGU6IFR5cGUsIG5hbWU6IHN0cmluZyB8IG51bGwgPSBudWxsLCBkZWNsYXJhdGlvbjogTmFtZUlkZW50aWZpZXJOb2RlIHwgbnVsbCA9IG51bGwpOiBMb2NhbCB7XG4gICAgICAvLyBpZiBpdCBoYXMgYSBuYW1lLCBjaGVjayBwcmV2aW91c2x5IGFzIHRoaXMgbWV0aG9kIHdpbGwgdGhyb3cgb3RoZXJ3aXNlXG4gICAgICB2YXIgbG9jYWxJbmRleCA9IHRoaXMucGFyYW1ldGVycy5sZW5ndGggKyB0aGlzLmFkZGl0aW9uYWxMb2NhbHMubGVuZ3RoO1xuXG4gICAgICB2YXIgbG9jYWwgPSBuZXcgTG9jYWwobG9jYWxJbmRleCwgbmFtZSA/IG5hbWUgOiAndmFyJCcgKyBsb2NhbEluZGV4LnRvU3RyaW5nKDEwKSwgZGVjbGFyYXRpb24pO1xuICAgICAgbG9jYWwudHlwZSA9IHR5cGU7XG4gICAgICBpZiAobmFtZSkge1xuICAgICAgICBpZiAodGhpcy5sb2NhbHNCeU5hbWUuaGFzKG5hbWUpKSB0aHJvdyBuZXcgRXJyb3IoJ2R1cGxpY2F0ZSBsb2NhbCBuYW1lJyk7XG4gICAgICAgIHRoaXMubG9jYWxzQnlOYW1lLnNldChuYW1lLCBsb2NhbCk7XG4gICAgICB9XG4gICAgICB0aGlzLmxvY2Fsc0J5SW5kZXhbbG9jYWwuaW5kZXhdID0gbG9jYWw7XG4gICAgICB0aGlzLmFkZGl0aW9uYWxMb2NhbHMucHVzaChsb2NhbCk7XG4gICAgICByZXR1cm4gbG9jYWw7XG4gICAgfVxuXG4gICAgLyoqIEdldHMgYSBmcmVlIHRlbXBvcmFyeSBsb2NhbCBvZiB0aGUgc3BlY2lmaWVkIHR5cGUuICovXG4gICAgZ2V0VGVtcExvY2FsKHR5cGU6IFR5cGUpOiBMb2NhbCB7XG4gICAgICB2YXIgdGVtcHM6IExvY2FsW10gfCBudWxsO1xuICAgICAgc3dpdGNoICh0eXBlLm5hdGl2ZVR5cGUpIHtcbiAgICAgICAgY2FzZSBOYXRpdmVUeXBlcy5pMzI6IHtcbiAgICAgICAgICB0ZW1wcyA9IHRoaXMudGVtcEkzMnM7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgICAgY2FzZSBOYXRpdmVUeXBlcy5pNjQ6IHtcbiAgICAgICAgICB0ZW1wcyA9IHRoaXMudGVtcEk2NHM7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgICAgY2FzZSBOYXRpdmVUeXBlcy5mMzI6IHtcbiAgICAgICAgICB0ZW1wcyA9IHRoaXMudGVtcEYzMnM7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgICAgY2FzZSBOYXRpdmVUeXBlcy5mNjQ6IHtcbiAgICAgICAgICB0ZW1wcyA9IHRoaXMudGVtcEY2NHM7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ2NvbmNyZXRlIHR5cGUgZXhwZWN0ZWQnKTtcbiAgICAgIH1cblxuICAgICAgdmFyIGxvY2FsOiBMb2NhbDtcblxuICAgICAgaWYgKHRlbXBzICYmIHRlbXBzLmxlbmd0aCkge1xuICAgICAgICBsb2NhbCA9IHRlbXBzLnBvcCgpO1xuICAgICAgICBsb2NhbC50eXBlID0gdHlwZTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGxvY2FsID0gdGhpcy5hZGRMb2NhbCh0eXBlKTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIGxvY2FsO1xuICAgIH1cblxuICAgIC8qKiBGcmVlcyB0aGUgdGVtcG9yYXJ5IGxvY2FsIGZvciByZXVzZS4gKi9cbiAgICBmcmVlVGVtcExvY2FsKGxvY2FsOiBMb2NhbCk6IHZvaWQge1xuICAgICAgdmFyIHRlbXBzOiBMb2NhbFtdO1xuICAgICAgaWYgKGxvY2FsLnR5cGUgPT09IG51bGwpIHRocm93IG5ldyBFcnJvcigndHlwZSBpcyBudWxsJyk7IC8vIGludGVybmFsIGVycm9yXG4gICAgICBzd2l0Y2ggKGxvY2FsLnR5cGUubmF0aXZlVHlwZSkge1xuICAgICAgICBjYXNlIE5hdGl2ZVR5cGVzLmkzMjoge1xuICAgICAgICAgIHRlbXBzID0gdGhpcy50ZW1wSTMycyB8fCAodGhpcy50ZW1wSTMycyA9IFtdKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgICBjYXNlIE5hdGl2ZVR5cGVzLmk2NDoge1xuICAgICAgICAgIHRlbXBzID0gdGhpcy50ZW1wSTY0cyB8fCAodGhpcy50ZW1wSTY0cyA9IFtdKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgICBjYXNlIE5hdGl2ZVR5cGVzLmYzMjoge1xuICAgICAgICAgIHRlbXBzID0gdGhpcy50ZW1wRjMycyB8fCAodGhpcy50ZW1wRjMycyA9IFtdKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgICBjYXNlIE5hdGl2ZVR5cGVzLmY2NDoge1xuICAgICAgICAgIHRlbXBzID0gdGhpcy50ZW1wRjY0cyB8fCAodGhpcy50ZW1wRjY0cyA9IFtdKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgIHRocm93IG5ldyBFcnJvcignY29uY3JldGUgdHlwZSBleHBlY3RlZCcpO1xuICAgICAgfVxuICAgICAgaWYgKGxvY2FsLmluZGV4IDwgMCkgdGhyb3cgbmV3IEVycm9yKCdpbnZhbGlkIGxvY2FsIGluZGV4Jyk7XG4gICAgICB0ZW1wcy5wdXNoKGxvY2FsKTtcbiAgICB9XG5cbiAgICAvKiogR2V0cyBhbmQgaW1tZWRpYXRlbHkgZnJlZXMgYSB0ZW1wb3JhcnkgbG9jYWwgb2YgdGhlIHNwZWNpZmllZCB0eXBlLiAqL1xuICAgIGdldEFuZEZyZWVUZW1wTG9jYWwodHlwZTogVHlwZSk6IExvY2FsIHtcbiAgICAgIHZhciB0ZW1wczogTG9jYWxbXTtcbiAgICAgIHN3aXRjaCAodHlwZS5uYXRpdmVUeXBlKSB7XG4gICAgICAgIGNhc2UgTmF0aXZlVHlwZXMuaTMyOiB7XG4gICAgICAgICAgdGVtcHMgPSB0aGlzLnRlbXBJMzJzIHx8ICh0aGlzLnRlbXBJMzJzID0gW10pO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICAgIGNhc2UgTmF0aXZlVHlwZXMuaTY0OiB7XG4gICAgICAgICAgdGVtcHMgPSB0aGlzLnRlbXBJNjRzIHx8ICh0aGlzLnRlbXBJNjRzID0gW10pO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICAgIGNhc2UgTmF0aXZlVHlwZXMuZjMyOiB7XG4gICAgICAgICAgdGVtcHMgPSB0aGlzLnRlbXBGMzJzIHx8ICh0aGlzLnRlbXBGMzJzID0gW10pO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICAgIGNhc2UgTmF0aXZlVHlwZXMuZjY0OiB7XG4gICAgICAgICAgdGVtcHMgPSB0aGlzLnRlbXBGNjRzIHx8ICh0aGlzLnRlbXBGNjRzID0gW10pO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdjb25jcmV0ZSB0eXBlIGV4cGVjdGVkJyk7XG4gICAgICB9XG5cbiAgICAgIHZhciBsb2NhbDogTG9jYWw7XG5cbiAgICAgIGlmICh0ZW1wcy5sZW5ndGgpIHtcbiAgICAgICAgbG9jYWwgPSB0ZW1wc1t0ZW1wcy5sZW5ndGggLSAxXTtcbiAgICAgICAgbG9jYWwudHlwZSA9IHR5cGU7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBsb2NhbCA9IHRoaXMuYWRkTG9jYWwodHlwZSk7XG4gICAgICAgIHRlbXBzLnB1c2gobG9jYWwpO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gbG9jYWw7XG4gICAgfVxuXG4gICAgLyoqIEVudGVycyBhKG5vdGhlcikgYnJlYWsgY29udGV4dC4gKi9cbiAgICBlbnRlckJyZWFrQ29udGV4dCgpOiBzdHJpbmcge1xuICAgICAgdmFyIGlkID0gdGhpcy5uZXh0QnJlYWtJZCsrO1xuICAgICAgaWYgKCF0aGlzLmJyZWFrU3RhY2spIHRoaXMuYnJlYWtTdGFjayA9IFtpZF07XG4gICAgICBlbHNlIHRoaXMuYnJlYWtTdGFjay5wdXNoKGlkKTtcbiAgICAgIHJldHVybiAodGhpcy5icmVha0NvbnRleHQgPSBpZC50b1N0cmluZygxMCkpO1xuICAgIH1cblxuICAgIC8qKiBMZWF2ZXMgdGhlIGN1cnJlbnQgYnJlYWsgY29udGV4dC4gKi9cbiAgICBsZWF2ZUJyZWFrQ29udGV4dCgpOiB2b2lkIHtcbiAgICAgIGlmICghdGhpcy5icmVha1N0YWNrKSB0aHJvdyBuZXcgRXJyb3IoJ3RoZXJlIHdhcyBubyBicmVha1N0YWNrJyk7XG4gICAgICB2YXIgbGVuZ3RoID0gdGhpcy5icmVha1N0YWNrLmxlbmd0aDtcbiAgICAgIGlmIChsZW5ndGggPT0gMCkgdGhyb3cgbmV3IEVycm9yKCd0aGUgYnJlYWtTdGFjayBpcyBlbXB0eScpO1xuICAgICAgdGhpcy5icmVha1N0YWNrLnBvcCgpO1xuICAgICAgaWYgKGxlbmd0aCA+IDEpIHtcbiAgICAgICAgdGhpcy5icmVha0NvbnRleHQgPSB0aGlzLmJyZWFrU3RhY2tbbGVuZ3RoIC0gMl0udG9TdHJpbmcoMTApO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5icmVha0NvbnRleHQgPSBudWxsO1xuICAgICAgICB0aGlzLmJyZWFrU3RhY2sgPSBudWxsO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8qKiBGaW5hbGl6ZXMgdGhlIGZ1bmN0aW9uIG9uY2UgY29tcGlsZWQsIHJlbGVhc2luZyBubyBsb25nZXIgbmVlZGVkIHJlc291cmNlcy4gKi9cbiAgICBmaW5hbGl6ZSgpOiB2b2lkIHtcbiAgICAgIGlmICh0aGlzLmJyZWFrU3RhY2sgJiYgdGhpcy5icmVha1N0YWNrLmxlbmd0aCkgdGhyb3cgbmV3IEVycm9yKCdicmVhayBzdGFjaycpO1xuICAgICAgdGhpcy5icmVha1N0YWNrID0gbnVsbDtcbiAgICAgIHRoaXMuYnJlYWtDb250ZXh0ID0gbnVsbDtcbiAgICAgIHRoaXMudGVtcEkzMnMgPSB0aGlzLnRlbXBJNjRzID0gdGhpcy50ZW1wRjMycyA9IHRoaXMudGVtcEY2NHMgPSBudWxsO1xuICAgIH1cbiAgfVxuXG4gIGV4cG9ydCBjbGFzcyBDb250ZXh0QXdhcmVGdW5jdGlvbiBleHRlbmRzIEZ1bmN0aW9uTm9kZSB7XG4gICAgY29uc3RydWN0b3IocHVibGljIGJhc2VGdW5jdGlvbjogRnVuY3Rpb25Ob2RlLCBwdWJsaWMgY2xvc3VyZTogQ2xvc3VyZSkge1xuICAgICAgc3VwZXIoYmFzZUZ1bmN0aW9uLmFzdE5vZGUpO1xuICAgICAgdGhpcy5pbmplY3RlZCA9IHRydWU7XG4gICAgICB0aGlzLmZ1bmN0aW9uTmFtZSA9IGJhc2VGdW5jdGlvbi5mdW5jdGlvbk5hbWU7XG4gICAgICB0aGlzLmZ1bmN0aW9uUmV0dXJuVHlwZSA9IGJhc2VGdW5jdGlvbi5mdW5jdGlvblJldHVyblR5cGU7XG4gICAgICB0aGlzLnBhcmFtZXRlcnMgPSBiYXNlRnVuY3Rpb24ucGFyYW1ldGVycztcbiAgICAgIHRoaXMuYm9keSA9IGJhc2VGdW5jdGlvbi5ib2R5O1xuICAgIH1cbiAgfVxuXG4gIGV4cG9ydCBjbGFzcyBGdW5EaXJlY3RpdmVOb2RlIGV4dGVuZHMgRGlyZWN0aXZlTm9kZSB7XG4gICAgZnVuY3Rpb25Ob2RlOiBGdW5jdGlvbk5vZGU7XG4gIH1cblxuICBleHBvcnQgY2xhc3MgT3ZlcmxvYWRlZEZ1bmN0aW9uTm9kZSBleHRlbmRzIERpcmVjdGl2ZU5vZGUge1xuICAgIGluamVjdGVkID0gdHJ1ZTtcbiAgICBmdW5jdGlvbk5hbWU6IE5hbWVJZGVudGlmaWVyTm9kZTtcbiAgICBmdW5jdGlvbnM6IEZ1bkRpcmVjdGl2ZU5vZGVbXSA9IFtdO1xuICB9XG5cbiAgZXhwb3J0IGNsYXNzIFZhckRlY2xhcmF0aW9uTm9kZSBleHRlbmRzIE5vZGUge1xuICAgIG11dGFibGUgPSB0cnVlO1xuICAgIHZhcmlhYmxlTmFtZTogTmFtZUlkZW50aWZpZXJOb2RlO1xuICAgIHZhcmlhYmxlVHlwZTogVHlwZVJlZmVyZW5jZU5vZGU7XG4gICAgdmFsdWU6IEV4cHJlc3Npb25Ob2RlO1xuICAgIGxvY2FsOiBMb2NhbEdsb2JhbEhlYXBSZWZlcmVuY2U7XG4gIH1cblxuICBleHBvcnQgY2xhc3MgVmFsRGVjbGFyYXRpb25Ob2RlIGV4dGVuZHMgVmFyRGVjbGFyYXRpb25Ob2RlIHtcbiAgICBtdXRhYmxlID0gZmFsc2U7XG4gIH1cblxuICBleHBvcnQgY2xhc3MgVmFyRGlyZWN0aXZlTm9kZSBleHRlbmRzIERpcmVjdGl2ZU5vZGUge1xuICAgIGRlY2w6IFZhckRlY2xhcmF0aW9uTm9kZTtcbiAgfVxuXG4gIGV4cG9ydCBjbGFzcyBWYWxEaXJlY3RpdmVOb2RlIGV4dGVuZHMgVmFyRGlyZWN0aXZlTm9kZSB7XG4gICAgZGVjbDogVmFsRGVjbGFyYXRpb25Ob2RlO1xuICB9XG5cbiAgZXhwb3J0IGNsYXNzIEFzc2lnbm1lbnROb2RlIGV4dGVuZHMgTm9kZSB7XG4gICAgdmFyaWFibGU6IFZhcmlhYmxlUmVmZXJlbmNlTm9kZTtcbiAgICB2YWx1ZTogRXhwcmVzc2lvbk5vZGU7XG4gIH1cblxuICBleHBvcnQgY2xhc3MgVHlwZURpcmVjdGl2ZU5vZGUgZXh0ZW5kcyBEaXJlY3RpdmVOb2RlIHtcbiAgICB2YXJpYWJsZU5hbWU6IE5hbWVJZGVudGlmaWVyTm9kZTtcbiAgICB2YWx1ZVR5cGU6IFR5cGVOb2RlO1xuICB9XG5cbiAgZXhwb3J0IGFic3RyYWN0IGNsYXNzIExpdGVyYWxOb2RlPFQ+IGV4dGVuZHMgRXhwcmVzc2lvbk5vZGUge1xuICAgIHZhbHVlOiBUO1xuICAgIGdldCB0ZXh0KCkge1xuICAgICAgcmV0dXJuIEpTT04uc3RyaW5naWZ5KHRoaXMudmFsdWUpO1xuICAgIH1cbiAgfVxuXG4gIGV4cG9ydCBjbGFzcyBGbG9hdExpdGVyYWwgZXh0ZW5kcyBMaXRlcmFsTm9kZTxudW1iZXI+IHtcbiAgICBnZXQgdmFsdWUoKTogbnVtYmVyIHtcbiAgICAgIHJldHVybiBwYXJzZUZsb2F0KHRoaXMuYXN0Tm9kZS50ZXh0KTtcbiAgICB9XG4gICAgc2V0IHZhbHVlKHZhbHVlOiBudW1iZXIpIHtcbiAgICAgIHRoaXMuYXN0Tm9kZS50ZXh0ID0gdmFsdWUudG9TdHJpbmcoKTtcbiAgICB9XG4gIH1cblxuICBleHBvcnQgY2xhc3MgSW50ZWdlckxpdGVyYWwgZXh0ZW5kcyBMaXRlcmFsTm9kZTxudW1iZXI+IHtcbiAgICBnZXQgdmFsdWUoKTogbnVtYmVyIHtcbiAgICAgIHJldHVybiBwYXJzZUludCh0aGlzLmFzdE5vZGUudGV4dCk7XG4gICAgfVxuICAgIHNldCB2YWx1ZSh2YWx1ZTogbnVtYmVyKSB7XG4gICAgICB0aGlzLmFzdE5vZGUudGV4dCA9IHZhbHVlLnRvU3RyaW5nKCk7XG4gICAgfVxuICB9XG5cbiAgZXhwb3J0IGNsYXNzIEJvb2xlYW5MaXRlcmFsIGV4dGVuZHMgTGl0ZXJhbE5vZGU8Ym9vbGVhbj4ge1xuICAgIGdldCB2YWx1ZSgpOiBib29sZWFuIHtcbiAgICAgIHJldHVybiB0aGlzLmFzdE5vZGUudGV4dC50cmltKCkgPT0gJ3RydWUnO1xuICAgIH1cbiAgICBzZXQgdmFsdWUodmFsdWU6IGJvb2xlYW4pIHtcbiAgICAgIHRoaXMuYXN0Tm9kZS50ZXh0ID0gdmFsdWUudG9TdHJpbmcoKTtcbiAgICB9XG4gIH1cblxuICBleHBvcnQgY2xhc3MgTnVsbExpdGVyYWwgZXh0ZW5kcyBMaXRlcmFsTm9kZTxudWxsPiB7XG4gICAgdmFsdWU6IG51bGwgPSBudWxsO1xuICB9XG5cbiAgZXhwb3J0IGNsYXNzIEZ1bmN0aW9uQ2FsbE5vZGUgZXh0ZW5kcyBFeHByZXNzaW9uTm9kZSB7XG4gICAgaXNJbmZpeDogYm9vbGVhbiA9IGZhbHNlO1xuICAgIGZ1bmN0aW9uTm9kZTogRXhwcmVzc2lvbk5vZGU7XG4gICAgYXJndW1lbnRzTm9kZTogRXhwcmVzc2lvbk5vZGVbXTtcbiAgICByZXNvbHZlZEZ1bmN0aW9uVHlwZTogRnVuY3Rpb25UeXBlO1xuICB9XG5cbiAgZXhwb3J0IGNsYXNzIEJpbmFyeUV4cHJlc3Npb25Ob2RlIGV4dGVuZHMgRXhwcmVzc2lvbk5vZGUge1xuICAgIGxoczogRXhwcmVzc2lvbk5vZGU7XG4gICAgcmhzOiBFeHByZXNzaW9uTm9kZTtcbiAgICBvcGVyYXRvcjogc3RyaW5nO1xuICAgIGJpbmFyeU9wZXJhdGlvbjogQmluYXJ5T3BlcmF0aW9uO1xuXG4gICAgZ2V0IHRleHQoKSB7XG4gICAgICBpZiAoIXRoaXMub3BlcmF0b3IpIHRocm93IG5ldyBFcnJvcignQmluYXJ5RXhwcmVzc2lvbk5vZGUgdy9vIG9wZXJhdG9yJyk7XG4gICAgICByZXR1cm4gSlNPTi5zdHJpbmdpZnkodGhpcy5vcGVyYXRvcik7XG4gICAgfVxuICB9XG5cbiAgZXhwb3J0IGNsYXNzIFVuYXJ5RXhwcmVzc2lvbk5vZGUgZXh0ZW5kcyBFeHByZXNzaW9uTm9kZSB7XG4gICAgcmhzOiBFeHByZXNzaW9uTm9kZTtcbiAgICBvcGVyYXRvcjogc3RyaW5nO1xuXG4gICAgZ2V0IHRleHQoKSB7XG4gICAgICByZXR1cm4gSlNPTi5zdHJpbmdpZnkodGhpcy5vcGVyYXRvcik7XG4gICAgfVxuICB9XG5cbiAgZXhwb3J0IGNsYXNzIEJvb2xlYW5OZWdOb2RlIGV4dGVuZHMgRXhwcmVzc2lvbk5vZGUge1xuICAgIGxoczogRXhwcmVzc2lvbk5vZGU7XG4gIH1cblxuICBleHBvcnQgY2xhc3MgTnVtYmVyTmVnTm9kZSBleHRlbmRzIEV4cHJlc3Npb25Ob2RlIHtcbiAgICBsaHM6IEV4cHJlc3Npb25Ob2RlO1xuICB9XG5cbiAgZXhwb3J0IGFic3RyYWN0IGNsYXNzIE1hdGNoZXJOb2RlIGV4dGVuZHMgRXhwcmVzc2lvbk5vZGUge1xuICAgIHJoczogRXhwcmVzc2lvbk5vZGU7XG4gIH1cblxuICBleHBvcnQgY2xhc3MgSWZOb2RlIGV4dGVuZHMgRXhwcmVzc2lvbk5vZGUge1xuICAgIGNvbmRpdGlvbjogRXhwcmVzc2lvbk5vZGU7XG4gICAgdHJ1ZVBhcnQ6IEV4cHJlc3Npb25Ob2RlO1xuICAgIGZhbHNlUGFydDogRXhwcmVzc2lvbk5vZGU7XG4gIH1cblxuICBleHBvcnQgY2xhc3MgTWF0Y2hDb25kaXRpb25Ob2RlIGV4dGVuZHMgTWF0Y2hlck5vZGUge1xuICAgIGRlY2xhcmVkTmFtZTogTmFtZUlkZW50aWZpZXJOb2RlO1xuICAgIGNvbmRpdGlvbjogRXhwcmVzc2lvbk5vZGU7XG4gIH1cblxuICBleHBvcnQgY2xhc3MgTWF0Y2hMaXRlcmFsTm9kZSBleHRlbmRzIE1hdGNoZXJOb2RlIHtcbiAgICBsaXRlcmFsOiBMaXRlcmFsTm9kZTxhbnk+O1xuICB9XG5cbiAgZXhwb3J0IGNsYXNzIE1hdGNoRGVmYXVsdE5vZGUgZXh0ZW5kcyBNYXRjaGVyTm9kZSB7fVxuXG4gIGV4cG9ydCBjbGFzcyBQYXR0ZXJuTWF0Y2hlck5vZGUgZXh0ZW5kcyBFeHByZXNzaW9uTm9kZSB7XG4gICAgbGhzOiBFeHByZXNzaW9uTm9kZTtcbiAgICBtYXRjaGluZ1NldDogTWF0Y2hlck5vZGVbXTtcblxuICAgIC8qKiBsb2NhbCBpbmRleCBpbiB0aGUgZnVuY3Rpb24ncyBzY29wZSAqL1xuICAgIGxvY2FsOiBMb2NhbEdsb2JhbEhlYXBSZWZlcmVuY2U7XG4gIH1cblxuICAvLy8vLy8vIE5vbi1ncmFtbWFyIG5vZGVzXG5cbiAgLyoqIFRoaXMgbm9kZSByZXBsYWNlcyB0aGUgZnVuY3Rpb24gYm9keSAqL1xuICBleHBvcnQgY2xhc3MgVGFpbFJlY0xvb3BOb2RlIGV4dGVuZHMgTm9kZXMuRXhwcmVzc2lvbk5vZGUge1xuICAgIGJvZHk6IE5vZGVzLkV4cHJlc3Npb25Ob2RlO1xuICB9XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgTG9jYWxHbG9iYWxIZWFwUmVmZXJlbmNlIHtcbiAgdHlwZTogVHlwZTtcbiAgbmFtZTogc3RyaW5nO1xuICBkZWNsYXJhdGlvbk5vZGU6IE5vZGVzLk5vZGU7XG59XG5cbmV4cG9ydCBjbGFzcyBHbG9iYWwgaW1wbGVtZW50cyBMb2NhbEdsb2JhbEhlYXBSZWZlcmVuY2Uge1xuICB0eXBlOiBUeXBlO1xuICBjb25zdHJ1Y3RvcihwdWJsaWMgaW5kZXg6IG51bWJlciwgcHVibGljIG5hbWU6IHN0cmluZywgcHVibGljIGRlY2xhcmF0aW9uTm9kZTogTm9kZXMuTm9kZSkge31cbn1cblxuZXhwb3J0IGNsYXNzIExvY2FsIGltcGxlbWVudHMgTG9jYWxHbG9iYWxIZWFwUmVmZXJlbmNlIHtcbiAgdHlwZTogVHlwZTtcbiAgLyoqIGluZGV4IGluIHRoZSBmdW5jdGlvbiAqL1xuICBjb25zdHJ1Y3RvcihwdWJsaWMgaW5kZXg6IG51bWJlciwgcHVibGljIG5hbWU6IHN0cmluZywgcHVibGljIGRlY2xhcmF0aW9uTm9kZTogTm9kZXMuTm9kZSkge31cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGZpbmROb2Rlc0J5VHlwZTxUPihhc3RSb290OiB7IGNoaWxkcmVuOiBhbnlbXSB9LCB0eXBlOiB7IG5ldyAoLi4uYXJncyk6IFQgfSwgbGlzdDogVFtdID0gW10pOiBUW10ge1xuICBpZiAoYXN0Um9vdCBpbnN0YW5jZW9mIHR5cGUpIHtcbiAgICBsaXN0LnB1c2goYXN0Um9vdCk7XG4gIH1cbiAgYXN0Um9vdC5jaGlsZHJlbi5mb3JFYWNoKCQgPT4gZmluZE5vZGVzQnlUeXBlKCQsIHR5cGUsIGxpc3QpKTtcbiAgcmV0dXJuIGxpc3Q7XG59XG4iXX0=