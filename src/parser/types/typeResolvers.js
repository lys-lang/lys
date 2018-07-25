"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const TypeGraph_1 = require("./TypeGraph");
const TypePropagator_1 = require("./TypePropagator");
const types_1 = require("../types");
const annotations_1 = require("../annotations");
const nodes_1 = require("../nodes");
const TypeGraphBuilder_1 = require("./TypeGraphBuilder");
const languageOperations_1 = require("../../compiler/languageOperations");
const helpers_1 = require("../helpers");
const NodeError_1 = require("../NodeError");
const INVALID_TYPE = types_1.InvalidType.instance;
exports.EdgeLabels = {
    CONDITION: 'CONDITION',
    TRUE_PART: 'TRUE_PART',
    FALSE_PART: 'FALSE_PART',
    BLOCK: 'BLOCK',
    PARAMETER: 'PARAMETER',
    PATTERN_EXPRESSION: 'PATTERN_EXPRESSION',
    MATCH_EXPRESSION: 'MATCH_EXPRESSION',
    CASE_EXPRESSION: 'CASE_EXPRESSION',
    LHS: 'LHS',
    RHS: 'RHS',
    STATEMENTS: 'STATEMENTS',
    PATTERN_MATCHING_VALUE: 'PATTERN_MATCHING_VALUE'
};
function getTypeResolver(astNode) {
    if (astNode instanceof nodes_1.Nodes.IntegerLiteral) {
        return new TypeGraph_1.LiteralTypeResolver(new types_1.i32());
    }
    else if (astNode instanceof nodes_1.Nodes.FloatLiteral) {
        return new TypeGraph_1.LiteralTypeResolver(new types_1.f32());
    }
    else if (astNode instanceof nodes_1.Nodes.BooleanLiteral) {
        return new TypeGraph_1.LiteralTypeResolver(new types_1.bool());
    }
    else if (astNode instanceof nodes_1.Nodes.IfNode) {
        return new IfElseTypeResolver();
    }
    else if (astNode instanceof nodes_1.Nodes.DocumentNode) {
        return new UnknownTypeResolver();
    }
    else if (astNode instanceof nodes_1.Nodes.NameIdentifierNode) {
        return new PassThroughTypeResolver();
    }
    else if (astNode instanceof nodes_1.Nodes.FunDirectiveNode) {
        return new PassThroughTypeResolver();
    }
    else if (astNode instanceof nodes_1.Nodes.VarDeclarationNode) {
        return new TypeGraph_1.LiteralTypeResolver(types_1.VoidType.instance);
    }
    else if (astNode instanceof nodes_1.Nodes.OverloadedFunctionNode) {
        return new OverloadedFunctionTypeResolver();
    }
    else if (astNode instanceof nodes_1.Nodes.FunctionNode) {
        return new FunctionTypeResolver();
    }
    else if (astNode instanceof nodes_1.Nodes.VariableReferenceNode) {
        return new VariableReferenceResolver();
    }
    else if (astNode instanceof nodes_1.Nodes.TypeReferenceNode) {
        return new TypeReferenceResolver();
    }
    else if (astNode instanceof nodes_1.Nodes.BinaryExpressionNode) {
        return new BinaryOpTypeResolver();
    }
    else if (astNode instanceof nodes_1.Nodes.BlockNode) {
        return new BlockTypeResolver();
    }
    else if (astNode instanceof nodes_1.Nodes.FunctionCallNode) {
        return new FunctionCallResolver();
    }
    else if (astNode instanceof nodes_1.Nodes.PatternMatcherNode) {
        return new PatternMatcherTypeResolver();
    }
    else if (astNode instanceof nodes_1.Nodes.MatchDefaultNode) {
        return new MatchDefaultTypeResolver();
    }
    else if (astNode instanceof nodes_1.Nodes.MatchLiteralNode) {
        return new MatchLiteralTypeResolver();
    }
    else if (astNode instanceof nodes_1.Nodes.AssignmentNode) {
        return new AssignmentNodeTypeResolver();
    }
    console.log(`Node ${astNode.nodeName} has no type resolver`);
    return new UnknownTypeResolver();
}
exports.getTypeResolver = getTypeResolver;
class UnknownTypeResolver extends TypeGraph_1.TypeResolver {
    execute(_node, _ctx) {
        return null;
    }
}
exports.UnknownTypeResolver = UnknownTypeResolver;
class PassThroughTypeResolver extends TypeGraph_1.TypeResolver {
    execute(node, ctx) {
        const x = node.incomingEdges();
        if (x.length != 1) {
            if (ctx.currentParsingContext) {
                throw new Error(`PassThrough resolver only works with nodes with one edge but found '${node.incomingEdges().length}' with node ${node.astNode.nodeName}`);
            }
            else {
                return null;
            }
        }
        return x[0].incomingType();
    }
}
exports.PassThroughTypeResolver = PassThroughTypeResolver;
class AssignmentNodeTypeResolver extends TypeGraph_1.TypeResolver {
    execute(node, ctx) {
        const assignmentNode = node.astNode;
        const lhs = node.incomingEdgesByName(exports.EdgeLabels.LHS)[0];
        const rhs = node.incomingEdgesByName(exports.EdgeLabels.RHS)[0];
        if (!rhs.incomingType().canBeAssignedTo(lhs.incomingType())) {
            ctx.parsingContext.error(new NodeError_1.TypeMismatch(rhs.incomingType(), lhs.incomingType(), assignmentNode.value));
        }
        if (rhs.incomingType().equals(types_1.VoidType.instance)) {
            ctx.parsingContext.error('The expression returns a void value, which cannot be assigned to any variable', assignmentNode.value);
        }
        return lhs.incomingType();
    }
}
exports.AssignmentNodeTypeResolver = AssignmentNodeTypeResolver;
class IfElseTypeResolver extends TypeGraph_1.TypeResolver {
    execute(node, _ctx) {
        const conditionEdge = node.incomingEdgesByName(exports.EdgeLabels.CONDITION)[0];
        const ifEdge = node.incomingEdgesByName(exports.EdgeLabels.TRUE_PART)[0];
        const elseEdge = node.incomingEdgesByName(exports.EdgeLabels.FALSE_PART)[0];
        if (ifEdge.incomingTypeDefined() || elseEdge.incomingTypeDefined()) {
            const ifNode = node.astNode;
            const condition = conditionEdge.incomingType();
            if (!condition.canBeAssignedTo(types_1.bool.instance)) {
                _ctx.parsingContext.error(new NodeError_1.TypeMismatch(condition, types_1.bool.instance, ifNode.condition));
            }
            if (node.astNode.hasAnnotation(annotations_1.annotations.IsValueNode)) {
                const ifExpr = ifEdge.incomingTypeDefined() ? ifEdge.incomingType() : types_1.VoidType.instance;
                if (!elseEdge) {
                    _ctx.parsingContext.error('A ternary operation requires an else branch', node.astNode);
                    return INVALID_TYPE;
                }
                const elseExpr = elseEdge.incomingTypeDefined() ? elseEdge.incomingType() : types_1.VoidType.instance;
                const type = new types_1.UnionType();
                type.of = [ifExpr, elseExpr];
                return type.simplify();
            }
            else {
                return types_1.VoidType.instance;
            }
        }
    }
}
exports.IfElseTypeResolver = IfElseTypeResolver;
class UnifiedTypeResolver extends TypeGraph_1.TypeResolver {
    execute(node, _ctx) {
        const type = new types_1.UnionType();
        type.of = node.incomingEdges().map($ => $.incomingType());
        return type.simplify();
    }
}
exports.UnifiedTypeResolver = UnifiedTypeResolver;
class PatternMatcherTypeResolver extends TypeGraph_1.TypeResolver {
    execute(node, _ctx) {
        const type = new types_1.UnionType();
        type.of = node
            .incomingEdges()
            .filter($ => $.incomingTypeDefined())
            .map($ => $.incomingType());
        return type.simplify();
    }
    supportsPartialResolution() {
        return true;
    }
}
exports.PatternMatcherTypeResolver = PatternMatcherTypeResolver;
class OverloadedFunctionTypeResolver extends TypeGraph_1.TypeResolver {
    execute(node, ctx) {
        const incomingTypes = node.incomingEdges().map(_ => _.incomingType());
        const incomingFunctionTypes = new Array();
        // TODO: verify similar overloads
        for (let incomingType of incomingTypes) {
            if (incomingType instanceof types_1.FunctionType) {
                incomingFunctionTypes.push(incomingType);
            }
            else {
                ctx.parsingContext.error(`All members of an overloaded function should be functions, but found ${incomingType}`, node.astNode);
            }
        }
        const ret = new types_1.IntersectionType();
        ret.of = incomingFunctionTypes;
        return ret.simplify();
    }
}
exports.OverloadedFunctionTypeResolver = OverloadedFunctionTypeResolver;
class BinaryOpTypeResolver extends TypeGraph_1.TypeResolver {
    execute(node, ctx) {
        const opNode = node.astNode;
        try {
            const ret = languageOperations_1.findBuiltInTypedBinaryOperation(opNode.operator, node.incomingEdgesByName(exports.EdgeLabels.LHS)[0].incomingType(), node.incomingEdgesByName(exports.EdgeLabels.RHS)[0].incomingType());
            const binaryOp = node.astNode;
            binaryOp.binaryOperation = ret;
            return ret.outputType;
        }
        catch (e) {
            ctx.currentParsingContext.error(e.toString(), node.astNode);
        }
        return null;
    }
}
exports.BinaryOpTypeResolver = BinaryOpTypeResolver;
class BlockTypeResolver extends TypeGraph_1.TypeResolver {
    execute(node, _) {
        if (node.astNode.hasAnnotation(annotations_1.annotations.IsValueNode)) {
            const edges = node.incomingEdgesByName(exports.EdgeLabels.STATEMENTS);
            if (edges.length == 0) {
                return types_1.VoidType.instance;
            }
            return helpers_1.last(edges).incomingType();
        }
        else {
            return types_1.VoidType.instance;
        }
    }
}
exports.BlockTypeResolver = BlockTypeResolver;
class MatchLiteralTypeResolver extends TypeGraph_1.TypeResolver {
    execute(node, ctx) {
        const matched = node.incomingEdgesByName(exports.EdgeLabels.PATTERN_MATCHING_VALUE)[0];
        const literal = node.incomingEdgesByName(exports.EdgeLabels.LHS)[0];
        const result = node.incomingEdgesByName(exports.EdgeLabels.RHS)[0];
        if (!literal.incomingType().canBeAssignedTo(matched.incomingType())) {
            const astNode = node.astNode;
            ctx.currentParsingContext.error(new NodeError_1.TypeMismatch(literal.incomingType(), matched.incomingType(), astNode.literal));
        }
        if (node.astNode.hasAnnotation(annotations_1.annotations.IsValueNode)) {
            return result.incomingType();
        }
        else {
            return types_1.VoidType.instance;
        }
    }
}
exports.MatchLiteralTypeResolver = MatchLiteralTypeResolver;
class MatchDefaultTypeResolver extends TypeGraph_1.TypeResolver {
    execute(node, _) {
        const result = node.incomingEdgesByName(exports.EdgeLabels.RHS)[0];
        if (node.astNode.hasAnnotation(annotations_1.annotations.IsValueNode)) {
            return result.incomingType();
        }
        else {
            return types_1.VoidType.instance;
        }
    }
}
exports.MatchDefaultTypeResolver = MatchDefaultTypeResolver;
class FunctionTypeResolver extends TypeGraph_1.TypeResolver {
    execute(node, ctx) {
        const functionNode = node.astNode;
        const fnType = new types_1.FunctionType(functionNode.internalIdentifier);
        fnType.parameterTypes = functionNode.parameters
            .map($ => {
            return node.incomingEdgesByName($.parameterName.name)[0].incomingType();
        })
            .map($ => types_1.toConcreteType($, ctx));
        fnType.parameterNames = functionNode.parameters.map($ => $.parameterName.name);
        fnType.parameterTypes.forEach(($, $$) => {
            functionNode.localsByIndex[$$].type = $;
        });
        if (functionNode.functionReturnType) {
            fnType.returnType = types_1.toConcreteType(TypeGraphBuilder_1.fromTypeNode(functionNode.functionReturnType), ctx);
        }
        const inferedReturnType = TypePropagator_1.resolveReturnType(node.parentGraph, functionNode, fnType.parameterTypes, ctx);
        if (!inferedReturnType) {
            if (!fnType.returnType) {
                ctx.parsingContext.error(`Cannot infer return type`, functionNode.body);
                fnType.returnType = INVALID_TYPE;
            }
            debugger;
            TypePropagator_1.resolveReturnType(node.parentGraph, functionNode, fnType.parameterTypes, ctx);
            return fnType;
        }
        else {
            if (!fnType.returnType) {
                fnType.returnType = inferedReturnType;
            }
            else {
                if (!inferedReturnType.canBeAssignedTo(fnType.returnType)) {
                    ctx.parsingContext.error(new NodeError_1.TypeMismatch(inferedReturnType, fnType.returnType, functionNode.functionReturnType));
                }
            }
        }
        return fnType;
    }
}
exports.FunctionTypeResolver = FunctionTypeResolver;
class VariableReferenceResolver extends TypeGraph_1.TypeResolver {
    execute(node, ctx) {
        const varReference = node.astNode;
        const reference = varReference.closure.get(varReference.variable.name);
        if (!reference) {
            throw new Error('This should never happen');
        }
        const typeNode = ctx.currentGraph.findNode(reference.referencedNode);
        return typeNode.resultType();
    }
}
exports.VariableReferenceResolver = VariableReferenceResolver;
class TypeReferenceResolver extends TypeGraph_1.TypeResolver {
    execute(node, ctx) {
        const type = node.resultType();
        return types_1.toConcreteType(type, ctx);
    }
}
exports.TypeReferenceResolver = TypeReferenceResolver;
class FunctionCallResolver extends TypeGraph_1.TypeResolver {
    execute(node, ctx) {
        const functionCallNode = node.astNode;
        const incommingType = node.incomingEdges()[0].incomingType();
        const argTypes = node.incomingEdgesByName(exports.EdgeLabels.PARAMETER).map($ => $.incomingType());
        if (incommingType instanceof types_1.IntersectionType) {
            for (let fun of incommingType.of) {
                if (fun instanceof types_1.FunctionType) {
                    if (fun.acceptsTypes(argTypes)) {
                        functionCallNode.resolvedFunctionType = fun;
                        return fun.returnType;
                    }
                }
                else {
                    ctx.parsingContext.error(new NodeError_1.NotAFunction(fun, functionCallNode.functionNode));
                    return INVALID_TYPE;
                }
            }
            ctx.parsingContext.error(new NodeError_1.InvalidOverload(incommingType, argTypes, functionCallNode.functionNode));
            return null;
        }
        else if (incommingType instanceof types_1.FunctionType) {
            if (incommingType.acceptsTypes(argTypes)) {
                functionCallNode.resolvedFunctionType = incommingType;
                return incommingType.returnType;
            }
        }
        else {
            ctx.parsingContext.error(new NodeError_1.NotAFunction(incommingType, functionCallNode.functionNode));
            return INVALID_TYPE;
        }
        return INVALID_TYPE;
    }
}
exports.FunctionCallResolver = FunctionCallResolver;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHlwZVJlc29sdmVycy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbInR5cGVSZXNvbHZlcnMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSwyQ0FBZ0Y7QUFDaEYscURBQTRFO0FBQzVFLG9DQVdrQjtBQUNsQixnREFBNkM7QUFDN0Msb0NBQWlDO0FBQ2pDLHlEQUFrRDtBQUNsRCwwRUFBb0Y7QUFDcEYsd0NBQWtDO0FBQ2xDLDRDQUEyRTtBQUkzRSxNQUFNLFlBQVksR0FBRyxtQkFBVyxDQUFDLFFBQVEsQ0FBQztBQUU3QixRQUFBLFVBQVUsR0FBRztJQUN4QixTQUFTLEVBQUUsV0FBVztJQUN0QixTQUFTLEVBQUUsV0FBVztJQUN0QixVQUFVLEVBQUUsWUFBWTtJQUN4QixLQUFLLEVBQUUsT0FBTztJQUNkLFNBQVMsRUFBRSxXQUFXO0lBQ3RCLGtCQUFrQixFQUFFLG9CQUFvQjtJQUN4QyxnQkFBZ0IsRUFBRSxrQkFBa0I7SUFDcEMsZUFBZSxFQUFFLGlCQUFpQjtJQUNsQyxHQUFHLEVBQUUsS0FBSztJQUNWLEdBQUcsRUFBRSxLQUFLO0lBQ1YsVUFBVSxFQUFFLFlBQVk7SUFDeEIsc0JBQXNCLEVBQUUsd0JBQXdCO0NBQ2pELENBQUM7QUFFRix5QkFBZ0MsT0FBbUI7SUFDakQsSUFBSSxPQUFPLFlBQVksYUFBSyxDQUFDLGNBQWMsRUFBRTtRQUMzQyxPQUFPLElBQUksK0JBQW1CLENBQUMsSUFBSSxXQUFHLEVBQUUsQ0FBQyxDQUFDO0tBQzNDO1NBQU0sSUFBSSxPQUFPLFlBQVksYUFBSyxDQUFDLFlBQVksRUFBRTtRQUNoRCxPQUFPLElBQUksK0JBQW1CLENBQUMsSUFBSSxXQUFHLEVBQUUsQ0FBQyxDQUFDO0tBQzNDO1NBQU0sSUFBSSxPQUFPLFlBQVksYUFBSyxDQUFDLGNBQWMsRUFBRTtRQUNsRCxPQUFPLElBQUksK0JBQW1CLENBQUMsSUFBSSxZQUFJLEVBQUUsQ0FBQyxDQUFDO0tBQzVDO1NBQU0sSUFBSSxPQUFPLFlBQVks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LElBQUksd0JBQVksQ0FBQyxHQUFHLEVBQUUsZ0JBQWdCLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQztvQkFDL0UsT0FBTyxZQUFZLENBQUM7aUJBQ3JCO2FBQ0Y7WUFFRCxHQUFHLENBQUMsY0FBYyxDQUFDLEtBQUssQ0FBQyxJQUFJLDJCQUFlLENBQUMsYUFBYSxFQUFFLFFBQVEsRUFBRSxnQkFBZ0IsQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDO1lBQ3RHLE9BQU8sSUFBSSxDQUFDO1NBQ2I7YUFBTSxJQUFJLGFBQWEsWUFBWSxvQkFBWSxFQUFFO1lBQ2hELElBQUksYUFBYSxDQUFDLFlBQVksQ0FBQyxRQUFRLENBQUMsRUFBRTtnQkFDeEMsZ0JBQWdCLENBQUMsb0JBQW9CLEdBQUcsYUFBYSxDQUFDO2dCQUN0RCxPQUFPLGFBQWEsQ0FBQyxVQUFVLENBQUM7YUFDakM7U0FDRjthQUFNO1lBQ0wsR0FBRyxDQUFDLGNBQWMsQ0FBQyxLQUFLLENBQUMsSUFBSSx3QkFBWSxDQUFDLGFBQWEsRUFBRSxnQkFBZ0IsQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDO1lBQ3pGLE9BQU8sWUFBWSxDQUFDO1NBQ3JCO1FBRUQsT0FBTyxZQUFZLENBQUM7SUFDdEIsQ0FBQztDQUNGO0FBakNELG9EQWlDQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IFR5cGVSZXNvbHZlciwgVHlwZU5vZGUsIEVkZ2UsIExpdGVyYWxUeXBlUmVzb2x2ZXIgfSBmcm9tICcuL1R5cGVHcmFwaCc7XG5pbXBvcnQgeyBUeXBlUmVzb2x1dGlvbkNvbnRleHQsIHJlc29sdmVSZXR1cm5UeXBlIH0gZnJvbSAnLi9UeXBlUHJvcGFnYXRvcic7XG5pbXBvcnQge1xuICBWb2lkVHlwZSxcbiAgVW5pb25UeXBlLFxuICBpMzIsXG4gIGYzMixcbiAgRnVuY3Rpb25UeXBlLFxuICBUeXBlLFxuICBJbnRlcnNlY3Rpb25UeXBlLFxuICBib29sLFxuICB0b0NvbmNyZXRlVHlwZSxcbiAgSW52YWxpZFR5cGVcbn0gZnJvbSAnLi4vdHlwZXMnO1xuaW1wb3J0IHsgYW5ub3RhdGlvbnMgfSBmcm9tICcuLi9hbm5vdGF0aW9ucyc7XG5pbXBvcnQgeyBOb2RlcyB9IGZyb20gJy4uL25vZGVzJztcbmltcG9ydCB7IGZyb21UeXBlTm9kZSB9IGZyb20gJy4vVHlwZUdyYXBoQnVpbGRlcic7XG5pbXBvcnQgeyBmaW5kQnVpbHRJblR5cGVkQmluYXJ5T3BlcmF0aW9uIH0gZnJvbSAnLi4vLi4vY29tcGlsZXIvbGFuZ3VhZ2VPcGVyYXRpb25zJztcbmltcG9ydCB7IGxhc3QgfSBmcm9tICcuLi9oZWxwZXJzJztcbmltcG9ydCB7IFR5cGVNaXNtYXRjaCwgSW52YWxpZE92ZXJsb2FkLCBOb3RBRnVuY3Rpb24gfSBmcm9tICcuLi9Ob2RlRXJyb3InO1xuXG5kZWNsYXJlIHZhciBjb25zb2xlO1xuXG5jb25zdCBJTlZBTElEX1RZUEUgPSBJbnZhbGlkVHlwZS5pbnN0YW5jZTtcblxuZXhwb3J0IGNvbnN0IEVkZ2VMYWJlbHMgPSB7XG4gIENPTkRJVElPTjogJ0NPTkRJVElPTicsXG4gIFRSVUVfUEFSVDogJ1RSVUVfUEFSVCcsXG4gIEZBTFNFX1BBUlQ6ICdGQUxTRV9QQVJUJyxcbiAgQkxPQ0s6ICdCTE9DSycsXG4gIFBBUkFNRVRFUjogJ1BBUkFNRVRFUicsXG4gIFBBVFRFUk5fRVhQUkVTU0lPTjogJ1BBVFRFUk5fRVhQUkVTU0lPTicsXG4gIE1BVENIX0VYUFJFU1NJT046ICdNQVRDSF9FWFBSRVNTSU9OJyxcbiAgQ0FTRV9FWFBSRVNTSU9OOiAnQ0FTRV9FWFBSRVNTSU9OJyxcbiAgTEhTOiAnTEhTJyxcbiAgUkhTOiAnUkhTJyxcbiAgU1RBVEVNRU5UUzogJ1NUQVRFTUVOVFMnLFxuICBQQVRURVJOX01BVENISU5HX1ZBTFVFOiAnUEFUVEVSTl9NQVRDSElOR19WQUxVRSdcbn07XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRUeXBlUmVzb2x2ZXIoYXN0Tm9kZTogTm9kZXMuTm9kZSk6IFR5cGVSZXNvbHZlciB7XG4gIGlmIChhc3ROb2RlIGluc3RhbmNlb2YgTm9kZXMuSW50ZWdlckxpdGVyYWwpIHtcbiAgICByZXR1cm4gbmV3IExpdGVyYWxUeXBlUmVzb2x2ZXIobmV3IGkzMigpKTtcbiAgfSBlbHNlIGlmIChhc3ROb2RlIGluc3RhbmNlb2YgTm9kZXMuRmxvYXRMaXRlcmFsKSB7XG4gICAgcmV0dXJuIG5ldyBMaXRlcmFsVHlwZVJlc29sdmVyKG5ldyBmMzIoKSk7XG4gIH0gZWxzZSBpZiAoYXN0Tm9kZSBpbnN0YW5jZW9mIE5vZGVzLkJvb2xlYW5MaXRlcmFsKSB7XG4gICAgcmV0dXJuIG5ldyBMaXRlcmFsVHlwZVJlc29sdmVyKG5ldyBib29sKCkpO1xuICB9IGVsc2UgaWYgKGFzdE5vZGUgaW5zdGFuY2VvZiBOb2Rlcy5JZk5vZGUpIHtcbiAgICByZXR1cm4gbmV3IElmRWxzZVR5cGVSZXNvbHZlcigpO1xuICB9IGVsc2UgaWYgKGFzdE5vZGUgaW5zdGFuY2VvZiBOb2Rlcy5Eb2N1bWVudE5vZGUpIHtcbiAgICByZXR1cm4gbmV3IFVua25vd25UeXBlUmVzb2x2ZXIoKTtcbiAgfSBlbHNlIGlmIChhc3ROb2RlIGluc3RhbmNlb2YgTm9kZXMuTmFtZUlkZW50aWZpZXJOb2RlKSB7XG4gICAgcmV0dXJuIG5ldyBQYXNzVGhyb3VnaFR5cGVSZXNvbHZlcigpO1xuICB9IGVsc2UgaWYgKGFzdE5vZGUgaW5zdGFuY2VvZiBOb2Rlcy5GdW5EaXJlY3RpdmVOb2RlKSB7XG4gICAgcmV0dXJuIG5ldyBQYXNzVGhyb3VnaFR5cGVSZXNvbHZlcigpO1xuICB9IGVsc2UgaWYgKGFzdE5vZGUgaW5zdGFuY2VvZiBOb2Rlcy5WYXJEZWNsYXJhdGlvbk5vZGUpIHtcbiAgICByZXR1cm4gbmV3IExpdGVyYWxUeXBlUmVzb2x2ZXIoVm9pZFR5cGUuaW5zdGFuY2UpO1xuICB9IGVsc2UgaWYgKGFzdE5vZGUgaW5zdGFuY2VvZiBOb2Rlcy5PdmVybG9hZGVkRnVuY3Rpb25Ob2RlKSB7XG4gICAgcmV0dXJuIG5ldyBPdmVybG9hZGVkRnVuY3Rpb25UeXBlUmVzb2x2ZXIoKTtcbiAgfSBlbHNlIGlmIChhc3ROb2RlIGluc3RhbmNlb2YgTm9kZXMuRnVuY3Rpb25Ob2RlKSB7XG4gICAgcmV0dXJuIG5ldyBGdW5jdGlvblR5cGVSZXNvbHZlcigpO1xuICB9IGVsc2UgaWYgKGFzdE5vZGUgaW5zdGFuY2VvZiBOb2Rlcy5WYXJpYWJsZVJlZmVyZW5jZU5vZGUpIHtcbiAgICByZXR1cm4gbmV3IFZhcmlhYmxlUmVmZXJlbmNlUmVzb2x2ZXIoKTtcbiAgfSBlbHNlIGlmIChhc3ROb2RlIGluc3RhbmNlb2YgTm9kZXMuVHlwZVJlZmVyZW5jZU5vZGUpIHtcbiAgICByZXR1cm4gbmV3IFR5cGVSZWZlcmVuY2VSZXNvbHZlcigpO1xuICB9IGVsc2UgaWYgKGFzdE5vZGUgaW5zdGFuY2VvZiBOb2Rlcy5CaW5hcnlFeHByZXNzaW9uTm9kZSkge1xuICAgIHJldHVybiBuZXcgQmluYXJ5T3BUeXBlUmVzb2x2ZXIoKTtcbiAgfSBlbHNlIGlmIChhc3ROb2RlIGluc3RhbmNlb2YgTm9kZXMuQmxvY2tOb2RlKSB7XG4gICAgcmV0dXJuIG5ldyBCbG9ja1R5cGVSZXNvbHZlcigpO1xuICB9IGVsc2UgaWYgKGFzdE5vZGUgaW5zdGFuY2VvZiBOb2Rlcy5GdW5jdGlvbkNhbGxOb2RlKSB7XG4gICAgcmV0dXJuIG5ldyBGdW5jdGlvbkNhbGxSZXNvbHZlcigpO1xuICB9IGVsc2UgaWYgKGFzdE5vZGUgaW5zdGFuY2VvZiBOb2Rlcy5QYXR0ZXJuTWF0Y2hlck5vZGUpIHtcbiAgICByZXR1cm4gbmV3IFBhdHRlcm5NYXRjaGVyVHlwZVJlc29sdmVyKCk7XG4gIH0gZWxzZSBpZiAoYXN0Tm9kZSBpbnN0YW5jZW9mIE5vZGVzLk1hdGNoRGVmYXVsdE5vZGUpIHtcbiAgICByZXR1cm4gbmV3IE1hdGNoRGVmYXVsdFR5cGVSZXNvbHZlcigpO1xuICB9IGVsc2UgaWYgKGFzdE5vZGUgaW5zdGFuY2VvZiBOb2Rlcy5NYXRjaExpdGVyYWxOb2RlKSB7XG4gICAgcmV0dXJuIG5ldyBNYXRjaExpdGVyYWxUeXBlUmVzb2x2ZXIoKTtcbiAgfSBlbHNlIGlmIChhc3ROb2RlIGluc3RhbmNlb2YgTm9kZXMuQXNzaWdubWVudE5vZGUpIHtcbiAgICByZXR1cm4gbmV3IEFzc2lnbm1lbnROb2RlVHlwZVJlc29sdmVyKCk7XG4gIH1cblxuICBjb25zb2xlLmxvZyhgTm9kZSAke2FzdE5vZGUubm9kZU5hbWV9IGhhcyBubyB0eXBlIHJlc29sdmVyYCk7XG5cbiAgcmV0dXJuIG5ldyBVbmtub3duVHlwZVJlc29sdmVyKCk7XG59XG5cbmV4cG9ydCBjbGFzcyBVbmtub3duVHlwZVJlc29sdmVyIGV4dGVuZHMgVHlwZVJlc29sdmVyIHtcbiAgZXhlY3V0ZShfbm9kZTogVHlwZU5vZGUsIF9jdHg6IFR5cGVSZXNvbHV0aW9uQ29udGV4dCkge1xuICAgIHJldHVybiBudWxsO1xuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBQYXNzVGhyb3VnaFR5cGVSZXNvbHZlciBleHRlbmRzIFR5cGVSZXNvbHZlciB7XG4gIGV4ZWN1dGUobm9kZTogVHlwZU5vZGUsIGN0eDogVHlwZVJlc29sdXRpb25Db250ZXh0KSB7XG4gICAgY29uc3QgeCA9IG5vZGUuaW5jb21pbmdFZGdlcygpO1xuXG4gICAgaWYgKHgubGVuZ3RoICE9IDEpIHtcbiAgICAgIGlmIChjdHguY3VycmVudFBhcnNpbmdDb250ZXh0KSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgICBgUGFzc1Rocm91Z2ggcmVzb2x2ZXIgb25seSB3b3JrcyB3aXRoIG5vZGVzIHdpdGggb25lIGVkZ2UgYnV0IGZvdW5kICcke1xuICAgICAgICAgICAgbm9kZS5pbmNvbWluZ0VkZ2VzKCkubGVuZ3RoXG4gICAgICAgICAgfScgd2l0aCBub2RlICR7bm9kZS5hc3ROb2RlLm5vZGVOYW1lfWBcbiAgICAgICAgKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiB4WzBdLmluY29taW5nVHlwZSgpO1xuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBBc3NpZ25tZW50Tm9kZVR5cGVSZXNvbHZlciBleHRlbmRzIFR5cGVSZXNvbHZlciB7XG4gIGV4ZWN1dGUobm9kZTogVHlwZU5vZGUsIGN0eDogVHlwZVJlc29sdXRpb25Db250ZXh0KSB7XG4gICAgY29uc3QgYXNzaWdubWVudE5vZGUgPSBub2RlLmFzdE5vZGUgYXMgTm9kZXMuQXNzaWdubWVudE5vZGU7XG5cbiAgICBjb25zdCBsaHMgPSBub2RlLmluY29taW5nRWRnZXNCeU5hbWUoRWRnZUxhYmVscy5MSFMpWzBdO1xuICAgIGNvbnN0IHJocyA9IG5vZGUuaW5jb21pbmdFZGdlc0J5TmFtZShFZGdlTGFiZWxzLlJIUylbMF07XG5cbiAgICBpZiAoIXJocy5pbmNvbWluZ1R5cGUoKS5jYW5CZUFzc2lnbmVkVG8obGhzLmluY29taW5nVHlwZSgpKSkge1xuICAgICAgY3R4LnBhcnNpbmdDb250ZXh0LmVycm9yKG5ldyBUeXBlTWlzbWF0Y2gocmhzLmluY29taW5nVHlwZSgpLCBsaHMuaW5jb21pbmdUeXBlKCksIGFzc2lnbm1lbnROb2RlLnZhbHVlKSk7XG4gICAgfVxuXG4gICAgaWYgKHJocy5pbmNvbWluZ1R5cGUoKS5lcXVhbHMoVm9pZFR5cGUuaW5zdGFuY2UpKSB7XG4gICAgICBjdHgucGFyc2luZ0NvbnRleHQuZXJyb3IoXG4gICAgICAgICdUaGUgZXhwcmVzc2lvbiByZXR1cm5zIGEgdm9pZCB2YWx1ZSwgd2hpY2ggY2Fubm90IGJlIGFzc2lnbmVkIHRvIGFueSB2YXJpYWJsZScsXG4gICAgICAgIGFzc2lnbm1lbnROb2RlLnZhbHVlXG4gICAgICApO1xuICAgIH1cblxuICAgIHJldHVybiBsaHMuaW5jb21pbmdUeXBlKCk7XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIElmRWxzZVR5cGVSZXNvbHZlciBleHRlbmRzIFR5cGVSZXNvbHZlciB7XG4gIGV4ZWN1dGUobm9kZTogVHlwZU5vZGUsIF9jdHg6IFR5cGVSZXNvbHV0aW9uQ29udGV4dCkge1xuICAgIGNvbnN0IGNvbmRpdGlvbkVkZ2U6IEVkZ2UgPSBub2RlLmluY29taW5nRWRnZXNCeU5hbWUoRWRnZUxhYmVscy5DT05ESVRJT04pWzBdO1xuICAgIGNvbnN0IGlmRWRnZTogRWRnZSA9IG5vZGUuaW5jb21pbmdFZGdlc0J5TmFtZShFZGdlTGFiZWxzLlRSVUVfUEFSVClbMF07XG4gICAgY29uc3QgZWxzZUVkZ2U6IEVkZ2UgPSBub2RlLmluY29taW5nRWRnZXNCeU5hbWUoRWRnZUxhYmVscy5GQUxTRV9QQVJUKVswXTtcbiAgICBpZiAoaWZFZGdlLmluY29taW5nVHlwZURlZmluZWQoKSB8fCBlbHNlRWRnZS5pbmNvbWluZ1R5cGVEZWZpbmVkKCkpIHtcbiAgICAgIGNvbnN0IGlmTm9kZSA9IG5vZGUuYXN0Tm9kZSBhcyBOb2Rlcy5JZk5vZGU7XG5cbiAgICAgIGNvbnN0IGNvbmRpdGlvbiA9IGNvbmRpdGlvbkVkZ2UuaW5jb21pbmdUeXBlKCk7XG5cbiAgICAgIGlmICghY29uZGl0aW9uLmNhbkJlQXNzaWduZWRUbyhib29sLmluc3RhbmNlKSkge1xuICAgICAgICBfY3R4LnBhcnNpbmdDb250ZXh0LmVycm9yKG5ldyBUeXBlTWlzbWF0Y2goY29uZGl0aW9uLCBib29sLmluc3RhbmNlLCBpZk5vZGUuY29uZGl0aW9uKSk7XG4gICAgICB9XG5cbiAgICAgIGlmIChub2RlLmFzdE5vZGUuaGFzQW5ub3RhdGlvbihhbm5vdGF0aW9ucy5Jc1ZhbHVlTm9kZSkpIHtcbiAgICAgICAgY29uc3QgaWZFeHByID0gaWZFZGdlLmluY29taW5nVHlwZURlZmluZWQoKSA/IGlmRWRnZS5pbmNvbWluZ1R5cGUoKSA6IFZvaWRUeXBlLmluc3RhbmNlO1xuXG4gICAgICAgIGlmICghZWxzZUVkZ2UpIHtcbiAgICAgICAgICBfY3R4LnBhcnNpbmdDb250ZXh0LmVycm9yKCdBIHRlcm5hcnkgb3BlcmF0aW9uIHJlcXVpcmVzIGFuIGVsc2UgYnJhbmNoJywgbm9kZS5hc3ROb2RlKTtcbiAgICAgICAgICByZXR1cm4gSU5WQUxJRF9UWVBFO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgZWxzZUV4cHIgPSBlbHNlRWRnZS5pbmNvbWluZ1R5cGVEZWZpbmVkKCkgPyBlbHNlRWRnZS5pbmNvbWluZ1R5cGUoKSA6IFZvaWRUeXBlLmluc3RhbmNlO1xuICAgICAgICBjb25zdCB0eXBlID0gbmV3IFVuaW9uVHlwZSgpO1xuICAgICAgICB0eXBlLm9mID0gW2lmRXhwciwgZWxzZUV4cHJdO1xuICAgICAgICByZXR1cm4gdHlwZS5zaW1wbGlmeSgpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIFZvaWRUeXBlLmluc3RhbmNlO1xuICAgICAgfVxuICAgIH1cbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgVW5pZmllZFR5cGVSZXNvbHZlciBleHRlbmRzIFR5cGVSZXNvbHZlciB7XG4gIGV4ZWN1dGUobm9kZTogVHlwZU5vZGUsIF9jdHg6IFR5cGVSZXNvbHV0aW9uQ29udGV4dCkge1xuICAgIGNvbnN0IHR5cGUgPSBuZXcgVW5pb25UeXBlKCk7XG4gICAgdHlwZS5vZiA9IG5vZGUuaW5jb21pbmdFZGdlcygpLm1hcCgkID0+ICQuaW5jb21pbmdUeXBlKCkpO1xuICAgIHJldHVybiB0eXBlLnNpbXBsaWZ5KCk7XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIFBhdHRlcm5NYXRjaGVyVHlwZVJlc29sdmVyIGV4dGVuZHMgVHlwZVJlc29sdmVyIHtcbiAgZXhlY3V0ZShub2RlOiBUeXBlTm9kZSwgX2N0eDogVHlwZVJlc29sdXRpb25Db250ZXh0KSB7XG4gICAgY29uc3QgdHlwZSA9IG5ldyBVbmlvblR5cGUoKTtcbiAgICB0eXBlLm9mID0gbm9kZVxuICAgICAgLmluY29taW5nRWRnZXMoKVxuICAgICAgLmZpbHRlcigkID0+ICQuaW5jb21pbmdUeXBlRGVmaW5lZCgpKVxuICAgICAgLm1hcCgkID0+ICQuaW5jb21pbmdUeXBlKCkpO1xuICAgIHJldHVybiB0eXBlLnNpbXBsaWZ5KCk7XG4gIH1cblxuICBzdXBwb3J0c1BhcnRpYWxSZXNvbHV0aW9uKCkge1xuICAgIHJldHVybiB0cnVlO1xuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBPdmVybG9hZGVkRnVuY3Rpb25UeXBlUmVzb2x2ZXIgZXh0ZW5kcyBUeXBlUmVzb2x2ZXIge1xuICBleGVjdXRlKG5vZGU6IFR5cGVOb2RlLCBjdHg6IFR5cGVSZXNvbHV0aW9uQ29udGV4dCk6IFR5cGUgfCBudWxsIHtcbiAgICBjb25zdCBpbmNvbWluZ1R5cGVzID0gbm9kZS5pbmNvbWluZ0VkZ2VzKCkubWFwKF8gPT4gXy5pbmNvbWluZ1R5cGUoKSk7XG4gICAgY29uc3QgaW5jb21pbmdGdW5jdGlvblR5cGVzID0gbmV3IEFycmF5PEZ1bmN0aW9uVHlwZT4oKTtcblxuICAgIC8vIFRPRE86IHZlcmlmeSBzaW1pbGFyIG92ZXJsb2Fkc1xuXG4gICAgZm9yIChsZXQgaW5jb21pbmdUeXBlIG9mIGluY29taW5nVHlwZXMpIHtcbiAgICAgIGlmIChpbmNvbWluZ1R5cGUgaW5zdGFuY2VvZiBGdW5jdGlvblR5cGUpIHtcbiAgICAgICAgaW5jb21pbmdGdW5jdGlvblR5cGVzLnB1c2goaW5jb21pbmdUeXBlKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGN0eC5wYXJzaW5nQ29udGV4dC5lcnJvcihcbiAgICAgICAgICBgQWxsIG1lbWJlcnMgb2YgYW4gb3ZlcmxvYWRlZCBmdW5jdGlvbiBzaG91bGQgYmUgZnVuY3Rpb25zLCBidXQgZm91bmQgJHtpbmNvbWluZ1R5cGV9YCxcbiAgICAgICAgICBub2RlLmFzdE5vZGVcbiAgICAgICAgKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBjb25zdCByZXQgPSBuZXcgSW50ZXJzZWN0aW9uVHlwZSgpO1xuXG4gICAgcmV0Lm9mID0gaW5jb21pbmdGdW5jdGlvblR5cGVzO1xuXG4gICAgcmV0dXJuIHJldC5zaW1wbGlmeSgpO1xuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBCaW5hcnlPcFR5cGVSZXNvbHZlciBleHRlbmRzIFR5cGVSZXNvbHZlciB7XG4gIGV4ZWN1dGUobm9kZTogVHlwZU5vZGUsIGN0eDogVHlwZVJlc29sdXRpb25Db250ZXh0KTogVHlwZSB7XG4gICAgY29uc3Qgb3BOb2RlID0gbm9kZS5hc3ROb2RlIGFzIE5vZGVzLkJpbmFyeUV4cHJlc3Npb25Ob2RlO1xuXG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IHJldCA9IGZpbmRCdWlsdEluVHlwZWRCaW5hcnlPcGVyYXRpb24oXG4gICAgICAgIG9wTm9kZS5vcGVyYXRvcixcbiAgICAgICAgbm9kZS5pbmNvbWluZ0VkZ2VzQnlOYW1lKEVkZ2VMYWJlbHMuTEhTKVswXS5pbmNvbWluZ1R5cGUoKSxcbiAgICAgICAgbm9kZS5pbmNvbWluZ0VkZ2VzQnlOYW1lKEVkZ2VMYWJlbHMuUkhTKVswXS5pbmNvbWluZ1R5cGUoKVxuICAgICAgKTtcblxuICAgICAgY29uc3QgYmluYXJ5T3AgPSBub2RlLmFzdE5vZGUgYXMgTm9kZXMuQmluYXJ5RXhwcmVzc2lvbk5vZGU7XG4gICAgICBiaW5hcnlPcC5iaW5hcnlPcGVyYXRpb24gPSByZXQ7XG5cbiAgICAgIHJldHVybiByZXQub3V0cHV0VHlwZTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICBjdHguY3VycmVudFBhcnNpbmdDb250ZXh0LmVycm9yKGUudG9TdHJpbmcoKSwgbm9kZS5hc3ROb2RlKTtcbiAgICB9XG5cbiAgICByZXR1cm4gbnVsbDtcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgQmxvY2tUeXBlUmVzb2x2ZXIgZXh0ZW5kcyBUeXBlUmVzb2x2ZXIge1xuICBleGVjdXRlKG5vZGU6IFR5cGVOb2RlLCBfOiBUeXBlUmVzb2x1dGlvbkNvbnRleHQpOiBUeXBlIHtcbiAgICBpZiAobm9kZS5hc3ROb2RlLmhhc0Fubm90YXRpb24oYW5ub3RhdGlvbnMuSXNWYWx1ZU5vZGUpKSB7XG4gICAgICBjb25zdCBlZGdlcyA9IG5vZGUuaW5jb21pbmdFZGdlc0J5TmFtZShFZGdlTGFiZWxzLlNUQVRFTUVOVFMpO1xuICAgICAgaWYgKGVkZ2VzLmxlbmd0aCA9PSAwKSB7XG4gICAgICAgIHJldHVybiBWb2lkVHlwZS5pbnN0YW5jZTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIGxhc3QoZWRnZXMpLmluY29taW5nVHlwZSgpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gVm9pZFR5cGUuaW5zdGFuY2U7XG4gICAgfVxuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBNYXRjaExpdGVyYWxUeXBlUmVzb2x2ZXIgZXh0ZW5kcyBUeXBlUmVzb2x2ZXIge1xuICBleGVjdXRlKG5vZGU6IFR5cGVOb2RlLCBjdHg6IFR5cGVSZXNvbHV0aW9uQ29udGV4dCk6IFR5cGUge1xuICAgIGNvbnN0IG1hdGNoZWQgPSBub2RlLmluY29taW5nRWRnZXNCeU5hbWUoRWRnZUxhYmVscy5QQVRURVJOX01BVENISU5HX1ZBTFVFKVswXTtcbiAgICBjb25zdCBsaXRlcmFsID0gbm9kZS5pbmNvbWluZ0VkZ2VzQnlOYW1lKEVkZ2VMYWJlbHMuTEhTKVswXTtcbiAgICBjb25zdCByZXN1bHQgPSBub2RlLmluY29taW5nRWRnZXNCeU5hbWUoRWRnZUxhYmVscy5SSFMpWzBdO1xuXG4gICAgaWYgKCFsaXRlcmFsLmluY29taW5nVHlwZSgpLmNhbkJlQXNzaWduZWRUbyhtYXRjaGVkLmluY29taW5nVHlwZSgpKSkge1xuICAgICAgY29uc3QgYXN0Tm9kZSA9IG5vZGUuYXN0Tm9kZSBhcyBOb2Rlcy5NYXRjaExpdGVyYWxOb2RlO1xuICAgICAgY3R4LmN1cnJlbnRQYXJzaW5nQ29udGV4dC5lcnJvcihcbiAgICAgICAgbmV3IFR5cGVNaXNtYXRjaChsaXRlcmFsLmluY29taW5nVHlwZSgpLCBtYXRjaGVkLmluY29taW5nVHlwZSgpLCBhc3ROb2RlLmxpdGVyYWwpXG4gICAgICApO1xuICAgIH1cblxuICAgIGlmIChub2RlLmFzdE5vZGUuaGFzQW5ub3RhdGlvbihhbm5vdGF0aW9ucy5Jc1ZhbHVlTm9kZSkpIHtcbiAgICAgIHJldHVybiByZXN1bHQuaW5jb21pbmdUeXBlKCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBWb2lkVHlwZS5pbnN0YW5jZTtcbiAgICB9XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIE1hdGNoRGVmYXVsdFR5cGVSZXNvbHZlciBleHRlbmRzIFR5cGVSZXNvbHZlciB7XG4gIGV4ZWN1dGUobm9kZTogVHlwZU5vZGUsIF86IFR5cGVSZXNvbHV0aW9uQ29udGV4dCk6IFR5cGUge1xuICAgIGNvbnN0IHJlc3VsdCA9IG5vZGUuaW5jb21pbmdFZGdlc0J5TmFtZShFZGdlTGFiZWxzLlJIUylbMF07XG5cbiAgICBpZiAobm9kZS5hc3ROb2RlLmhhc0Fubm90YXRpb24oYW5ub3RhdGlvbnMuSXNWYWx1ZU5vZGUpKSB7XG4gICAgICByZXR1cm4gcmVzdWx0LmluY29taW5nVHlwZSgpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gVm9pZFR5cGUuaW5zdGFuY2U7XG4gICAgfVxuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBGdW5jdGlvblR5cGVSZXNvbHZlciBleHRlbmRzIFR5cGVSZXNvbHZlciB7XG4gIGV4ZWN1dGUobm9kZTogVHlwZU5vZGUsIGN0eDogVHlwZVJlc29sdXRpb25Db250ZXh0KTogVHlwZSB7XG4gICAgY29uc3QgZnVuY3Rpb25Ob2RlOiBOb2Rlcy5GdW5jdGlvbk5vZGUgPSBub2RlLmFzdE5vZGUgYXMgTm9kZXMuRnVuY3Rpb25Ob2RlO1xuICAgIGNvbnN0IGZuVHlwZSA9IG5ldyBGdW5jdGlvblR5cGUoZnVuY3Rpb25Ob2RlLmludGVybmFsSWRlbnRpZmllcik7XG5cbiAgICBmblR5cGUucGFyYW1ldGVyVHlwZXMgPSBmdW5jdGlvbk5vZGUucGFyYW1ldGVyc1xuICAgICAgLm1hcCgkID0+IHtcbiAgICAgICAgcmV0dXJuIG5vZGUuaW5jb21pbmdFZGdlc0J5TmFtZSgkLnBhcmFtZXRlck5hbWUubmFtZSlbMF0uaW5jb21pbmdUeXBlKCk7XG4gICAgICB9KVxuICAgICAgLm1hcCgkID0+IHRvQ29uY3JldGVUeXBlKCQsIGN0eCkpO1xuICAgIGZuVHlwZS5wYXJhbWV0ZXJOYW1lcyA9IGZ1bmN0aW9uTm9kZS5wYXJhbWV0ZXJzLm1hcCgkID0+ICQucGFyYW1ldGVyTmFtZS5uYW1lKTtcblxuICAgIGZuVHlwZS5wYXJhbWV0ZXJUeXBlcy5mb3JFYWNoKCgkLCAkJCkgPT4ge1xuICAgICAgZnVuY3Rpb25Ob2RlLmxvY2Fsc0J5SW5kZXhbJCRdLnR5cGUgPSAkO1xuICAgIH0pO1xuXG4gICAgaWYgKGZ1bmN0aW9uTm9kZS5mdW5jdGlvblJldHVyblR5cGUpIHtcbiAgICAgIGZuVHlwZS5yZXR1cm5UeXBlID0gdG9Db25jcmV0ZVR5cGUoZnJvbVR5cGVOb2RlKGZ1bmN0aW9uTm9kZS5mdW5jdGlvblJldHVyblR5cGUpLCBjdHgpO1xuICAgIH1cblxuICAgIGNvbnN0IGluZmVyZWRSZXR1cm5UeXBlID0gcmVzb2x2ZVJldHVyblR5cGUobm9kZS5wYXJlbnRHcmFwaCwgZnVuY3Rpb25Ob2RlLCBmblR5cGUucGFyYW1ldGVyVHlwZXMsIGN0eCk7XG5cbiAgICBpZiAoIWluZmVyZWRSZXR1cm5UeXBlKSB7XG4gICAgICBpZiAoIWZuVHlwZS5yZXR1cm5UeXBlKSB7XG4gICAgICAgIGN0eC5wYXJzaW5nQ29udGV4dC5lcnJvcihgQ2Fubm90IGluZmVyIHJldHVybiB0eXBlYCwgZnVuY3Rpb25Ob2RlLmJvZHkpO1xuICAgICAgICBmblR5cGUucmV0dXJuVHlwZSA9IElOVkFMSURfVFlQRTtcbiAgICAgIH1cblxuICAgICAgZGVidWdnZXI7XG5cbiAgICAgIHJlc29sdmVSZXR1cm5UeXBlKG5vZGUucGFyZW50R3JhcGgsIGZ1bmN0aW9uTm9kZSwgZm5UeXBlLnBhcmFtZXRlclR5cGVzLCBjdHgpO1xuXG4gICAgICByZXR1cm4gZm5UeXBlO1xuICAgIH0gZWxzZSB7XG4gICAgICBpZiAoIWZuVHlwZS5yZXR1cm5UeXBlKSB7XG4gICAgICAgIGZuVHlwZS5yZXR1cm5UeXBlID0gaW5mZXJlZFJldHVyblR5cGU7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBpZiAoIWluZmVyZWRSZXR1cm5UeXBlLmNhbkJlQXNzaWduZWRUbyhmblR5cGUucmV0dXJuVHlwZSkpIHtcbiAgICAgICAgICBjdHgucGFyc2luZ0NvbnRleHQuZXJyb3IoXG4gICAgICAgICAgICBuZXcgVHlwZU1pc21hdGNoKGluZmVyZWRSZXR1cm5UeXBlLCBmblR5cGUucmV0dXJuVHlwZSwgZnVuY3Rpb25Ob2RlLmZ1bmN0aW9uUmV0dXJuVHlwZSlcbiAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIGZuVHlwZTtcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgVmFyaWFibGVSZWZlcmVuY2VSZXNvbHZlciBleHRlbmRzIFR5cGVSZXNvbHZlciB7XG4gIGV4ZWN1dGUobm9kZTogVHlwZU5vZGUsIGN0eDogVHlwZVJlc29sdXRpb25Db250ZXh0KTogVHlwZSB7XG4gICAgY29uc3QgdmFyUmVmZXJlbmNlID0gbm9kZS5hc3ROb2RlIGFzIE5vZGVzLlZhcmlhYmxlUmVmZXJlbmNlTm9kZTtcbiAgICBjb25zdCByZWZlcmVuY2UgPSB2YXJSZWZlcmVuY2UuY2xvc3VyZS5nZXQodmFyUmVmZXJlbmNlLnZhcmlhYmxlLm5hbWUpO1xuICAgIGlmICghcmVmZXJlbmNlKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ1RoaXMgc2hvdWxkIG5ldmVyIGhhcHBlbicpO1xuICAgIH1cbiAgICBjb25zdCB0eXBlTm9kZSA9IGN0eC5jdXJyZW50R3JhcGguZmluZE5vZGUocmVmZXJlbmNlLnJlZmVyZW5jZWROb2RlKTtcbiAgICByZXR1cm4gdHlwZU5vZGUucmVzdWx0VHlwZSgpO1xuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBUeXBlUmVmZXJlbmNlUmVzb2x2ZXIgZXh0ZW5kcyBUeXBlUmVzb2x2ZXIge1xuICBleGVjdXRlKG5vZGU6IFR5cGVOb2RlLCBjdHg6IFR5cGVSZXNvbHV0aW9uQ29udGV4dCk6IFR5cGUge1xuICAgIGNvbnN0IHR5cGUgPSBub2RlLnJlc3VsdFR5cGUoKTtcbiAgICByZXR1cm4gdG9Db25jcmV0ZVR5cGUodHlwZSwgY3R4KTtcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgRnVuY3Rpb25DYWxsUmVzb2x2ZXIgZXh0ZW5kcyBUeXBlUmVzb2x2ZXIge1xuICBleGVjdXRlKG5vZGU6IFR5cGVOb2RlLCBjdHg6IFR5cGVSZXNvbHV0aW9uQ29udGV4dCk6IFR5cGUge1xuICAgIGNvbnN0IGZ1bmN0aW9uQ2FsbE5vZGUgPSBub2RlLmFzdE5vZGUgYXMgTm9kZXMuRnVuY3Rpb25DYWxsTm9kZTtcbiAgICBjb25zdCBpbmNvbW1pbmdUeXBlID0gbm9kZS5pbmNvbWluZ0VkZ2VzKClbMF0uaW5jb21pbmdUeXBlKCk7XG4gICAgY29uc3QgYXJnVHlwZXMgPSBub2RlLmluY29taW5nRWRnZXNCeU5hbWUoRWRnZUxhYmVscy5QQVJBTUVURVIpLm1hcCgkID0+ICQuaW5jb21pbmdUeXBlKCkpO1xuXG4gICAgaWYgKGluY29tbWluZ1R5cGUgaW5zdGFuY2VvZiBJbnRlcnNlY3Rpb25UeXBlKSB7XG4gICAgICBmb3IgKGxldCBmdW4gb2YgaW5jb21taW5nVHlwZS5vZikge1xuICAgICAgICBpZiAoZnVuIGluc3RhbmNlb2YgRnVuY3Rpb25UeXBlKSB7XG4gICAgICAgICAgaWYgKGZ1bi5hY2NlcHRzVHlwZXMoYXJnVHlwZXMpKSB7XG4gICAgICAgICAgICBmdW5jdGlvbkNhbGxOb2RlLnJlc29sdmVkRnVuY3Rpb25UeXBlID0gZnVuO1xuICAgICAgICAgICAgcmV0dXJuIGZ1bi5yZXR1cm5UeXBlO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBjdHgucGFyc2luZ0NvbnRleHQuZXJyb3IobmV3IE5vdEFGdW5jdGlvbihmdW4sIGZ1bmN0aW9uQ2FsbE5vZGUuZnVuY3Rpb25Ob2RlKSk7XG4gICAgICAgICAgcmV0dXJuIElOVkFMSURfVFlQRTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBjdHgucGFyc2luZ0NvbnRleHQuZXJyb3IobmV3IEludmFsaWRPdmVybG9hZChpbmNvbW1pbmdUeXBlLCBhcmdUeXBlcywgZnVuY3Rpb25DYWxsTm9kZS5mdW5jdGlvbk5vZGUpKTtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH0gZWxzZSBpZiAoaW5jb21taW5nVHlwZSBpbnN0YW5jZW9mIEZ1bmN0aW9uVHlwZSkge1xuICAgICAgaWYgKGluY29tbWluZ1R5cGUuYWNjZXB0c1R5cGVzKGFyZ1R5cGVzKSkge1xuICAgICAgICBmdW5jdGlvbkNhbGxOb2RlLnJlc29sdmVkRnVuY3Rpb25UeXBlID0gaW5jb21taW5nVHlwZTtcbiAgICAgICAgcmV0dXJuIGluY29tbWluZ1R5cGUucmV0dXJuVHlwZTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgY3R4LnBhcnNpbmdDb250ZXh0LmVycm9yKG5ldyBOb3RBRnVuY3Rpb24oaW5jb21taW5nVHlwZSwgZnVuY3Rpb25DYWxsTm9kZS5mdW5jdGlvbk5vZGUpKTtcbiAgICAgIHJldHVybiBJTlZBTElEX1RZUEU7XG4gICAgfVxuXG4gICAgcmV0dXJuIElOVkFMSURfVFlQRTtcbiAgfVxufVxuIl19