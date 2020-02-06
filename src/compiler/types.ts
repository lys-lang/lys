import { Nodes } from './nodes';
import { isValidType } from './types/typeHelpers';
import { Scope } from './Scope';

export type Valtype = 'i32' | 'i64' | 'f32' | 'f64' | 'u32' | 'label';

export enum NativeTypes {
  i32 = 'i32',
  i64 = 'i64',
  f32 = 'f32',
  f64 = 'f64',

  anyfunc = 'anyfunc',
  func = 'func',
  void = 'void'
}

export abstract class Type {
  nativeType?: NativeTypes;

  get binaryenType(): Valtype | void {
    switch (this.nativeType) {
      case NativeTypes.func:
      case NativeTypes.i32:
        return 'i32';

      case NativeTypes.f32:
        return 'f32';

      case NativeTypes.f64:
        return 'f64';

      case NativeTypes.i64:
        return 'i64';

      case NativeTypes.void:
        return undefined;

      default:
        throw new Error(`Type ${this} (${this.constructor.name}) returned a undefined binaryenType`);
    }
  }

  equals(otherType: Type) {
    if (!otherType) {
      return false;
    }

    return otherType === this;
  }

  canBeAssignedTo(otherType: Type, ctx: Scope): boolean {
    if (this.equals(otherType)) {
      return true;
    }

    if (otherType instanceof TypeAlias) {
      return this.canBeAssignedTo(otherType.of, ctx);
    }

    if (otherType instanceof UnionType) {
      if (otherType.of.some($ => this.canBeAssignedTo($, ctx))) {
        return true;
      }
    }

    if (otherType instanceof IntersectionType) {
      return otherType.of.some($ => this.canBeAssignedTo($, ctx));
    }

    if (otherType instanceof AnyType) {
      return true;
    }

    if (otherType instanceof SelfType) {
      const resolved = ctx.get('Self');
      const type = TypeHelpers.getNodeType(resolved.referencedNode);

      if (type && type instanceof TypeType) {
        return this.canBeAssignedTo(type.of, ctx);
      }
    }

    return false;
  }

  abstract toString(): string;
  abstract inspect(levels: number): string;
  abstract schema(): Record<string, Type>;
  abstract getSchemaValue(name: string, ctx: Scope): any;
}

export function areEqualTypes(typeA: Type | null | void, typeB: Type | null | void): boolean {
  if (!typeA && !typeB) {
    return true;
  }
  if (typeA && typeB && typeA.equals(typeB)) {
    return true;
  }
  return false;
}

export class FunctionSignatureType extends Type {
  readonly nativeType: NativeTypes = NativeTypes.func;
  readonly parameterTypes: Type[] = [];
  readonly parameterNames: string[] = [];
  returnType?: Type;

  canBeAssignedTo(type: Type, ctx: Scope): boolean {
    if (type instanceof FunctionSignatureType) {
      if (this.parameterTypes.length !== type.parameterTypes.length) return false;
      if (
        // can the return type be assigned?
        !this.returnType ||
        !type.returnType ||
        !this.returnType.canBeAssignedTo(type.returnType, ctx)
      ) {
        return false;
      }
      if (
        // can every parameter be assigned?
        this.parameterTypes.some(
          ($, $$) => !$ || !type.parameterTypes[$$] || !$.canBeAssignedTo(type.parameterTypes[$$], ctx)
        )
      ) {
        return false;
      }
      return true;
    }

    if (type instanceof IntersectionType) {
      return type.of.every($ => this.canBeAssignedTo($, ctx));
    }

    return super.canBeAssignedTo(type, ctx);
  }

  equals(type: Type) {
    if (!type) return false;
    if (!(type instanceof FunctionSignatureType)) return false;
    if (this.parameterTypes.length !== type.parameterTypes.length) return false;
    if (!areEqualTypes(this.returnType, type.returnType)) return false;
    if (this.parameterTypes.some(($, $$) => !areEqualTypes($, type.parameterTypes[$$]))) return false;
    return true;
  }

  toString() {
    const params = this.parameterTypes.map((type, ix) => {
      const name = this.parameterNames && this.parameterNames[ix];

      return (name ? name + ': ' : '') + (type || '?');
    });

    return `fun(${params.join(', ')}) -> ${this.returnType ? this.returnType : '?'}`;
  }

  inspect(_depth: number) {
    const params = this.parameterTypes.map(type => {
      if (!type) {
        return '(?)';
      } else {
        return type.inspect(0);
      }
    });

    return `(fun (${params.join(' ')}) ${(this.returnType && this.returnType.inspect(0)) || '?'})`;
  }

  schema() {
    return {};
  }

  getSchemaValue(name: string) {
    throw new Error(`Cannot read schema property ${name} of ${this.inspect(10)}`);
  }
}

export class FunctionType extends Type {
  readonly nativeType: NativeTypes = NativeTypes.func;
  readonly signature: FunctionSignatureType = new FunctionSignatureType();

  constructor(public name: Nodes.NameIdentifierNode) {
    super();
  }

  equals(type: Type): boolean {
    if (!type) return false;
    if (!(type instanceof FunctionType)) return false;
    if (this.name !== type.name) return false;
    if (!this.signature.equals(type.signature)) return false;
    return true;
  }

  canBeAssignedTo(type: Type, ctx: Scope): boolean {
    if (type instanceof FunctionType) {
      return this.signature.canBeAssignedTo(type.signature, ctx);
    } else if (type instanceof FunctionSignatureType) {
      return this.signature.canBeAssignedTo(type, ctx);
    }
    return false;
  }

  toString() {
    return this.signature.toString();
  }

  inspect(_depth: number) {
    const params = this.signature.parameterNames.map((_, ix) => {
      const type = this.signature.parameterTypes && this.signature.parameterTypes[ix];
      if (!type) {
        return '(?)';
      } else {
        return type.inspect(0);
      }
    });

    return `(fun ${JSON.stringify(this.name.name)} (${params.join(' ')}) ${(this.signature.returnType &&
      this.signature.returnType.inspect(0)) ||
      '?'})`;
  }

  schema() {
    return {};
  }

  getSchemaValue(name: string) {
    throw new Error(`Cannot read schema property ${name} of ${this.inspect(10)}`);
  }
}

export class StructType extends Type {
  nativeType: NativeTypes = NativeTypes.i64;

  constructor(public parameters: Nodes.ParameterNode[]) {
    super();
  }

  equals(type: Type): boolean {
    return type === this;
  }

  toString() {
    return '%struct';
  }

  canBeAssignedTo(otherType: Type, ctx: Scope) {
    if (super.canBeAssignedTo(otherType, ctx)) {
      return true;
    }

    if (RefType.isRefTypeStrict(otherType)) {
      return true;
    }

    return false;
  }

  typeSimilarity(to: Type, depth: number = 1): number {
    if (this.equals(to)) {
      return 1 / depth;
    }

    return 0;
  }

  inspect(level: number) {
    const types =
      level > 1
        ? this.parameters
            .map($ => {
              const type = $.parameterType && TypeHelpers.getNodeType($.parameterType);
              return ' ' + $.parameterName.name + ': ' + (type ? type.inspect(level - 1) : '(?)');
            })
            .join('')
        : '';
    return `(struct${types})`;
  }

  schema() {
    return {
      byteSize: StackType.of('u32', NativeTypes.i32, 4)
    };
  }

  getSchemaValue(name: string) {
    if (name === 'byteSize') {
      return 8;
    }
    throw new Error(`Cannot read schema property ${name} of ${this.inspect(10)}`);
  }
}

export class StackType extends Type {
  private static nativeTypes = new Map<string, StackType>();
  private constructor(public typeName: string, public nativeType: NativeTypes, public byteSize: number) {
    super();
  }

  static of(name: string, nativeType: NativeTypes, byteSize: number): StackType {
    const key = '_' + name + '_' + nativeType + '_' + byteSize;

    let ret = StackType.nativeTypes.get(key);

    if (!ret) {
      ret = new StackType(name, nativeType, byteSize);
      StackType.nativeTypes.set(key, ret);
    }

    return ret;
  }

  equals(other: Type): boolean {
    return other === this;
  }

  canBeAssignedTo(other: Type, ctx: Scope) {
    const otherType = getUnderlyingTypeFromAlias(other);

    if (
      otherType instanceof StackType &&
      otherType.nativeType === this.nativeType &&
      otherType.typeName === this.typeName &&
      otherType.byteSize === this.byteSize
    ) {
      return true;
    }

    return super.canBeAssignedTo(other, ctx);
  }

  toString() {
    return this.typeName;
  }

  inspect() {
    return '(native ' + this.typeName + ')';
  }

  schema() {
    return {
      byteSize: StackType.of('u32', NativeTypes.i32, 4),
      allocationSize: StackType.of('u32', NativeTypes.i32, 4),
      stackSize: StackType.of('u32', NativeTypes.i32, 4)
    };
  }

  getSchemaValue(name: string) {
    if (name === 'byteSize') {
      return this.byteSize;
    } else if (name === 'stackSize') {
      return this.byteSize;
    } else if (name === 'allocationSize') {
      return this.byteSize;
    }
    throw new Error(`Cannot read schema property ${name} of ${this.inspect()}`);
  }
}

const u32 = StackType.of('u32', NativeTypes.i32, 4);
const voidType = StackType.of('void', NativeTypes.void, 0);

export class RefType extends Type {
  static instance: RefType = new RefType();
  nativeType: NativeTypes = NativeTypes.i64;

  readonly byteSize = 8;

  protected constructor() {
    super();
  }

  // returns true when otherType is explicityly RefType.instance
  static isRefTypeStrict(otherType: Type) {
    return getUnderlyingTypeFromAlias(otherType) === RefType.instance;
  }

  toString() {
    return 'ref';
  }

  inspect() {
    return '(ref ?)';
  }

  canBeAssignedTo(otherType: Type, _ctx: Scope): boolean {
    return RefType.isRefTypeStrict(otherType);
  }

  typeSimilarity(to: Type, depth: number = 1): number {
    if (this.equals(to)) {
      return 1 / depth;
    }

    return 0;
  }

  equals(otherType: Type): boolean {
    if (!otherType) return false;
    return RefType.isRefTypeStrict(otherType);
  }

  schema() {
    return {
      byteSize: StackType.of('u32', NativeTypes.i32, 4),
      stackSize: StackType.of('u32', NativeTypes.i32, 4),
      allocationSize: StackType.of('u32', NativeTypes.i32, 4)
    };
  }

  getSchemaValue(name: string) {
    if (name === 'byteSize') {
      return 8;
    } else if (name === 'stackSize') {
      return 8;
    } else if (name === 'allocationSize') {
      return 8;
    }
    throw new Error(`Cannot read schema property ${name} of ${this.inspect()}`);
  }
}

export class IntersectionType extends Type {
  nativeType: NativeTypes = NativeTypes.anyfunc;

  constructor(public of: Type[] = []) {
    super();
  }

  toString() {
    if (this.of.length === 0) return '(empty intersection)';
    return this.of.map($ => ($ || '?').toString()).join(' & ');
  }

  canBeAssignedTo(other: Type, ctx: Scope) {
    if (other instanceof IntersectionType) {
      // intersections can be assigned only if every type of
      // the other intersection can be assigned by some of the types of this intersection
      return other.of.every(otherType => this.of.some(thisType => thisType.canBeAssignedTo(otherType, ctx)));
    }

    if (this.equals(other)) {
      return true;
    }

    return this.of.some($ => $.canBeAssignedTo(other, ctx));
  }

  inspect(levels: number = 0) {
    return '(intersection ' + this.of.map($ => ($ ? $.inspect(levels - 1) : '(?)')).join(' ') + ')';
  }

  simplify(): Type {
    const newTypes: Type[] = [];

    function collectIntersection($: Type) {
      if ($ instanceof IntersectionType) {
        $.of.forEach($ => {
          collectIntersection($);
        });
      } else {
        if (!newTypes.some($1 => areEqualTypes($, $1))) {
          newTypes.push($);
        }
      }
    }

    this.of.forEach(collectIntersection);

    if (newTypes.length === 1) {
      return newTypes[0];
    } else {
      return new IntersectionType(newTypes);
    }
  }

  equals(other: Type): boolean {
    if (!other) return false;
    return (
      other instanceof IntersectionType &&
      this.of.length === other.of.length &&
      this.of.every(($, ix) => areEqualTypes($, other.of[ix]))
    );
  }

  schema() {
    return {};
  }

  getSchemaValue(name: string) {
    throw new Error(`Cannot read schema property ${name} of ${this.inspect(10)}`);
  }
}

export function getUnderlyingTypeFromAlias(type: Type): Type {
  if (type instanceof TypeAlias) {
    return getUnderlyingTypeFromAlias(type.of);
  } else {
    return type;
  }
}

export class UnionType extends Type {
  get binaryenType(): Valtype {
    const nativeTypes = new Set<Valtype>();

    this.of.forEach($ => {
      if (NeverType.isNeverType($)) return;
      nativeTypes.add($.binaryenType as Valtype);
    });

    if (nativeTypes.size === 0) {
      throw new Error('Cannot find a suitable low level type for ' + this.toString() + ' (0)');
    }

    if (nativeTypes.size === 1) {
      return nativeTypes.values().next().value;
    } else {
      throw new Error('Cannot find a suitable low level type for ' + this.toString());
    }
  }

  constructor(public of: Type[] = [], public readonly simplified = false) {
    super();
  }

  static of(x: Type[] | Type): UnionType {
    if (x instanceof UnionType) {
      return x;
    } else if (x instanceof Type) {
      return new UnionType([x], true);
    } else if (x instanceof Array) {
      return new UnionType(x);
    }
    throw new Error('Cannot create UnionType');
  }

  toString() {
    if (this.of.length === 0) return '(empty union)';
    return this.of.map($ => ($ || '?').toString()).join(' | ');
  }

  inspect(levels: number = 0) {
    if (this.of.length === 0) return `(union EMPTY)`;
    return '(union ' + this.of.map($ => ($ ? $.inspect(levels - 1) : '(?)')).join(' ') + ')';
  }

  canBeAssignedTo(otherType: Type, ctx: Scope) {
    return this.of.every($ => $.canBeAssignedTo(otherType, ctx));
  }

  equals(other: Type): boolean {
    if (!other) return false;

    return (
      other instanceof UnionType &&
      this.of.length === other.of.length &&
      this.of.every(($, ix) => areEqualTypes($, other.of[ix]))
    );
  }

  /**
   * This method expands the union type made by other union types into a single
   * union made of the atoms of every member of the initial union. Recursively.
   */
  expand(ctx: Scope): Type {
    const newSet = new Set<Type>();

    function add(typeToAdd: Type) {
      const candidate = getUnderlyingTypeFromAlias(typeToAdd);

      if (candidate instanceof UnionType) {
        // If it is an union, we must expand it for each atom
        candidate.of.forEach($ => add($));
      } else {
        // finalize if already present
        if (newSet.has(typeToAdd)) {
          return;
        }
        for (let $ of newSet) {
          // finalize if we already have a type A == B && B == A
          if ($.equals(typeToAdd) && typeToAdd.equals($)) {
            return;
          }
        }
        newSet.add(typeToAdd);
      }
    }

    this.of.forEach(add);

    const newTypes = Array.from(newSet.values());

    return new UnionType(newTypes).simplify(ctx);
  }

  /**
   * This method removes an element from the union
   * @param type type to subtract
   */
  subtract(type: Type | null, ctx: Scope): Type {
    if (!type) return this;
    const removingRefType = RefType.isRefTypeStrict(type);

    if (!this.simplified) {
      return UnionType.of(this.expand(ctx)).subtract(type, ctx);
    }

    const newSet = new Set<Type>();

    for (let $ of this.of) {
      if ((!removingRefType && RefType.isRefTypeStrict($)) || !$.canBeAssignedTo(type, ctx)) {
        newSet.add($);
      }
    }

    if (newSet.size === 0) {
      return InjectableTypes.never;
    }

    const newTypes = Array.from(newSet.values());

    if (newTypes.length === 1) {
      return newTypes[0];
    }

    return new UnionType(newTypes);
  }

  /**
   * This method simplifies the union type. e.g:
   *
   *   type T0 = A | A | A | B
   *   type T0Simplified = A | B
   *
   * It removes types present in unions
   *
   *   type T1 = T0Simplified | B | C | A
   *   type T1Simplified = T0Simplified | C
   *
   *
   */
  simplify(ctx: Scope) {
    if (this.of.length === 1) {
      return this.of[0];
    }

    let newTypes: Type[] = [];

    this.of.forEach($ => {
      if (NeverType.isNeverType($)) return;

      if (!newTypes.some($1 => areEqualTypes($1, $)) && $) {
        newTypes.push($);
      }
    });

    if (newTypes.length === 0) {
      return InjectableTypes.never;
    }

    let unions: UnionType[] = [];

    function collectUnion($: Type) {
      const candidate = getUnderlyingTypeFromAlias($);

      if (candidate instanceof UnionType) {
        if (!unions.includes(candidate)) {
          unions.push(candidate);
          candidate.of.forEach($ => {
            collectUnion($);
          });
        }
      }
    }

    // Collect unions
    newTypes.forEach(collectUnion);

    // This are the unions that generate some conflict with other unions,
    // therefore we need to expand those unions to the atoms
    const blackListedUnionAtoms: Type[] = [];
    const unionsToRemove: UnionType[] = [];

    // Find the conflictive atoms
    unions.forEach((union, ix) => {
      const expanded = UnionType.of(union.expand(ctx));

      const hasConflict = expanded.of.some(atom => unions.some(($, $$) => $$ !== ix && atom.canBeAssignedTo($, ctx)));
      if (hasConflict) {
        blackListedUnionAtoms.push(...expanded.of);

        // we are removing the union, it might have elements not present in the
        // newTypes, we add them
        expanded.of.forEach($ => {
          if (!newTypes.some($1 => $1.equals($))) {
            newTypes.push($);
          }
        });
        unionsToRemove.push(union);
      }
    });

    unions = unions.filter($ => !unionsToRemove.includes($));

    // Eliminate types present in unions
    newTypes.forEach((newType, i) => {
      const candidate = getUnderlyingTypeFromAlias(newType);

      if (unionsToRemove.includes(candidate as any)) {
        (newTypes as any)[i] = null;
        return;
      }

      if (RefType.isRefTypeStrict(candidate) || blackListedUnionAtoms.some(x => candidate.canBeAssignedTo(x, ctx))) {
        return;
      }

      if (unions.some(union => !union.equals(candidate) && candidate.canBeAssignedTo(union, ctx))) {
        (newTypes as any)[i] = null;
      }
    });

    // Remove eliminated types
    newTypes = newTypes.filter($ => !!$);

    if (newTypes.length === 1) {
      return newTypes[0];
    } else {
      return new UnionType(newTypes, true);
    }
  }

  schema() {
    return {
      byteSize: u32,
      stackSize: u32
    };
  }

  getSchemaValue(name: string, ctx: Scope) {
    if (name === 'byteSize') {
      const nativeTypes = new Set<number>();

      this.of.forEach($ => {
        if (NeverType.isNeverType($)) return;
        nativeTypes.add($.getSchemaValue('byteSize', ctx));
      });

      if (nativeTypes.size === 0) {
        throw new Error('Cannot find a consistent byteSize in ' + this.inspect(100) + ' (0)');
      }

      if (nativeTypes.size === 1) {
        return nativeTypes.values().next().value;
      } else {
        throw new Error('Cannot find a consistent byteSize in ' + this.inspect(100));
      }
    } else if (name === 'allocationSize') {
      return 8;
    } else if (name === 'stackSize') {
      return 8;
    }
    throw new Error(`Cannot read schema property ${name} of ${this.inspect(10)}`);
  }
}

function mapAinB<X, Y>(a: Map<X, Y>, b: Map<X, Y>) {
  for (let [key, value] of a) {
    if (!b.has(key)) return false;
    if (b.get(key) !== value) return false;
  }
  return true;
}

function areMapsEqual<X, Y>(a: Map<X, Y>, b: Map<X, Y>): boolean {
  if (a.size !== b.size) return false;

  if (!mapAinB(a, b)) return false;
  if (!mapAinB(b, a)) return false;

  return true;
}

export class TypeAlias extends Type {
  get binaryenType() {
    return this.of.binaryenType;
  }

  get nativeType(): NativeTypes {
    return this.of.nativeType as NativeTypes;
  }

  discriminant: number | null = null;
  traits: Map<Nodes.ImplDirective, TraitType> = new Map();

  constructor(public name: Nodes.NameIdentifierNode, public readonly of: Type) {
    super();
  }

  canBeAssignedTo(other: Type, ctx: Scope): boolean {
    // | if (other instanceof TraitType) {
    // |   for (let [, trait] of this.traits) {
    // |     if (trait.equals(other)) {
    // |       return true;
    // |     }
    // |   }
    // | }

    if (other instanceof SelfType) {
      const resolved = ctx.get('Self');
      const type = TypeHelpers.getNodeType(resolved.referencedNode);

      if (type && type instanceof TypeType) {
        return this.canBeAssignedTo(type.of, ctx);
      }
    }

    return this.of.canBeAssignedTo(other, ctx);
  }

  equals(other: Type): boolean {
    if (!(other instanceof TypeAlias)) return false;
    if (other.name !== this.name) return false;
    if (other.discriminant !== this.discriminant) return false;

    if (!areMapsEqual(this.traits, other.traits)) {
      return false;
    }

    if (!areEqualTypes(this.of, other.of)) return false;

    return true;
  }

  toString(): string {
    return this.name.name;
  }

  inspect(levels: number = 0) {
    const ofString = levels > 0 ? ' ' + (this.of ? this.of.inspect(levels - 1) : '(?)') : '';
    return `(alias ${this.name.name}${ofString})`;
  }

  schema() {
    const result: Record<string, Type> = {
      ...this.of.schema(),
      discriminant: u32
    };

    const baseType = getUnderlyingTypeFromAlias(this);

    if (baseType instanceof StructType) {
      result['allocationSize'] = u32;
      result['stackSize'] = u32;

      const properties = this.getOrderedProperties();

      properties.forEach(prop => {
        result[`property$${prop.index}_offset`] = u32;
        result[`property$${prop.index}_allocationSize`] = u32;
      });
    }

    return result;
  }

  getSchemaValue(name: string, ctx: Scope) {
    if (name === 'discriminant') {
      if (this.discriminant === null) {
        throw new Error('empty discriminant');
      }
      return this.discriminant;
    } else {
      const baseType = getUnderlyingTypeFromAlias(this);
      if (baseType instanceof StructType) {
        if (name === 'stackSize') {
          return 8;
        } else if (name === 'allocationSize') {
          const properties = this.getOrderedProperties();

          let offset = 0;

          for (let prop of properties) {
            const fn = getNonVoidFunction(TypeHelpers.getNodeType(prop.name) as IntersectionType, ctx);
            offset += fn!.signature.returnType!.getSchemaValue('byteSize', ctx);
          }

          return offset;
        } else if (name.startsWith('property$')) {
          const properties = this.getOrderedProperties();
          const index = parseInt(name.substr('property$'.length), 10);
          const property = properties.find($ => $.index === index);

          if (!property) {
            throw new Error('cannot find property index ' + index);
          }

          if (name.endsWith('_offset')) {
            let offset = 0;

            for (let prop of properties) {
              if (prop.index === index) {
                break;
              }
              const fn = getNonVoidFunction(TypeHelpers.getNodeType(prop.name) as IntersectionType, ctx);
              offset += fn!.signature.returnType!.getSchemaValue('stackSize', ctx);
            }

            return offset;
          } else if (name.endsWith('_allocationSize')) {
            const fn = getNonVoidFunction(TypeHelpers.getNodeType(property.name) as IntersectionType, ctx);
            return fn!.signature.returnType!.getSchemaValue('allocationSize', ctx);
          }
        }
      }
    }
    return this.of.getSchemaValue(name, ctx);
  }

  getTypeMember(name: string, getType: (node: Nodes.Node) => Type | null): [Nodes.NameIdentifierNode, Type][] {
    const ret: [Nodes.NameIdentifierNode, Type][] = [];

    for (let impl of this.name.impls) {
      const resolvedName = impl.namespaceNames.get(name);

      if (resolvedName) {
        const memberType = getType(resolvedName);

        if (!isValidType(memberType)) {
          return [];
        }

        ret.push([resolvedName, memberType]);
      }
    }

    if (this.of instanceof TypeAlias) {
      ret.push(...this.of.getTypeMember(name, getType));
    }

    return ret;
  }

  private getOrderedProperties() {
    const properties: Array<{ index: number; name: Nodes.NameIdentifierNode }> = [];

    // TODO: review this.
    for (let impl of this.name.impls) {
      for (let [name, nameIdentifierNode] of impl.namespaceNames) {
        if (name.startsWith('property$')) {
          const index = parseInt(name.substr('property$'.length), 10);
          properties.push({ index, name: nameIdentifierNode });
        }
      }
    }

    properties.sort((a, b) => {
      if (a.index > b.index) {
        return 1;
      } else {
        return -1;
      }
    });

    return properties;
  }
}

export class TraitType extends Type {
  get binaryenType() {
    return undefined;
  }

  get nativeType(): NativeTypes {
    return NativeTypes.void;
  }

  constructor(public traitNode: Nodes.TraitDirectiveNode) {
    super();
  }

  canBeAssignedTo(other: Type, _ctx: Scope): boolean {
    return this === other;
  }

  equals(other: Type): boolean {
    return other === this;
  }

  toString(): string {
    return this.traitNode.traitName.name;
  }

  inspect(levels: number = 0) {
    const subtypes: string[] = [];

    if (levels > 1) {
      this.traitNode.namespaceNames.forEach((value, key) => {
        const t = TypeHelpers.getNodeType(value);
        subtypes.push('[' + key + ': ' + (t ? t.inspect(levels - 1) : 'null') + ']');
      });
    }

    return `(trait ${this.traitNode.traitName.name}${subtypes.map($ => ' ' + $).join('')})`;
  }

  getSignatureOf(name: string): Type | null {
    const declName = this.traitNode.namespaceNames.get(name);
    if (!declName) return null;
    return TypeHelpers.getNodeType(declName);
  }

  schema() {
    const result: Record<string, Type> = {};

    return result;
  }

  getSchemaValue(name: string) {
    throw new Error(`Cannot read schema property ${name} of ${this.inspect()}`);
  }
}

function getNonVoidFunction(type: IntersectionType, ctx: Scope): FunctionType | null {
  const functions = type.of as FunctionType[];
  for (let fn of functions) {
    if (fn.signature.returnType && !voidType.canBeAssignedTo(fn.signature.returnType, ctx)) {
      return fn;
    }
  }
  return null;
}

export class TypeType extends Type {
  static memMap = new WeakMap<Type, TypeType>();
  private constructor(public readonly of: Type) {
    super();
  }

  static of(of: Type) {
    let ret = this.memMap.get(of);
    if (!ret) {
      ret = new TypeType(of);
      this.memMap.set(of, ret);
    }
    return ret;
  }

  canBeAssignedTo(other: Type, ctx: Scope): boolean {
    const otherType = getUnderlyingTypeFromAlias(other);
    if (otherType instanceof TypeType) {
      return this.of.canBeAssignedTo(otherType.of, ctx);
    }
    return false;
  }

  equals(other: Type): boolean {
    if (!other) return false;
    return other instanceof TypeType && areEqualTypes(other.of, this.of);
  }

  inspect(levels: number = 0) {
    return `(type ${this.of.inspect(levels - 1)})`;
  }

  toString() {
    return `Type<${this.of}>`;
  }

  schema() {
    return this.of.schema();
  }

  getSchemaValue(name: string, ctx: Scope) {
    return this.of.getSchemaValue(name, ctx);
  }
}

// https://en.wikipedia.org/wiki/Bottom_type
// https://en.wikipedia.org/wiki/Fail-stop
export class NeverType extends Type {
  static isNeverType(otherType: Type) {
    return getUnderlyingTypeFromAlias(otherType) instanceof NeverType;
  }

  get nativeType() {
    return NativeTypes.void;
  }

  toString(): string {
    return 'never';
  }

  inspect(): string {
    return '(never)';
  }

  equals(other: Type) {
    if (NeverType.isNeverType(other)) {
      return true;
    }
    if (other instanceof UnionType) {
      if (other.of.length === 0) {
        return true;
      }
      if (other.of.length === 1 && this.equals(other.of[0])) {
        return true;
      }
    }
    return super.equals(other);
  }

  canBeAssignedTo(_: Type, _ctx: Scope) {
    return true;
  }

  schema() {
    return {};
  }

  getSchemaValue(name: string) {
    throw new Error(`Cannot read schema property ${name} of ${this.inspect()}`);
  }
}

export class SelfType extends Type {
  get nativeType() {
    return NativeTypes.anyfunc;
  }

  constructor(public traitType: TraitType) {
    super();
  }

  toString(): string {
    return 'Self';
  }

  inspect(): string {
    return `(self ${this.traitType.inspect(0)})`;
  }

  canBeAssignedTo(_: Type, _ctx: Scope) {
    console.log(_ctx.inspect(true), _.inspect(1));
    return false;
  }

  schema() {
    return {};
  }

  getSchemaValue(name: string) {
    throw new Error(`Cannot read schema property ${name} of ${this.inspect()}`);
  }
}

// https://en.wikipedia.org/wiki/Top_type
export class AnyType extends Type {
  get nativeType() {
    return NativeTypes.anyfunc;
  }

  toString(): string {
    return 'any';
  }

  inspect(): string {
    return '(any)';
  }

  canBeAssignedTo(_: Type, _ctx: Scope) {
    return false;
  }

  schema() {
    return {};
  }
  getSchemaValue(name: string) {
    throw new Error(`Cannot read schema property ${name} of ${this.inspect()}`);
  }
}

export const InjectableTypes = Object.assign(Object.create(null) as unknown, {
  void: voidType,
  ref: RefType.instance,
  never: new NeverType(),
  AnyType: TypeType.of(new AnyType()),
  Any: new AnyType()
});

export const UNRESOLVED_TYPE = new NeverType();

export namespace TypeHelpers {
  const ofTypeSymbol = Symbol('ofType');

  export function getNodeType(node: Nodes.Node): Type | null {
    if (!node) return null;
    return (node as any)[ofTypeSymbol] || null;
  }

  export function setNodeType(node: Nodes.Node, type: Type | null): void {
    (node as any)[ofTypeSymbol] = type;

    node.isTypeResolved = isValidType(type);
  }
}
