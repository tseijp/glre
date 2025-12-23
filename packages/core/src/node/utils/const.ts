export const SWIZZLES = ['x', 'y', 'z', 'w', 'r', 'g', 'b', 'a', 's', 't', 'p', 'q'] as const

// Unified order with TYPE_MAPPING array
export const CONVERSIONS = ['toBool', 'toUInt', 'toInt', 'toFloat', 'toBVec2', 'toIVec2', 'toUVec2', 'toVec2', 'toBVec3', 'toIVec3', 'toUVec3', 'toVec3', 'toBVec4', 'toIVec4', 'toUVec4', 'toVec4', 'toColor', 'toMat2', 'toMat3', 'toMat4'] as const

// Unified order with CONVERSIONS array
export const TYPE_MAPPING = {
        bool: 'bool',
        uint: 'u32',
        int: 'i32',
        float: 'f32',
        bvec2: 'vec2<bool>',
        ivec2: 'vec2i',
        uvec2: 'vec2u',
        vec2: 'vec2f',
        bvec3: 'vec3<bool>',
        ivec3: 'vec3i',
        uvec3: 'vec3u',
        vec3: 'vec3f',
        bvec4: 'vec4<bool>',
        ivec4: 'vec4i',
        uvec4: 'vec4u',
        vec4: 'vec4f',
        color: 'color',
        mat2: 'mat2x2f',
        mat3: 'mat3x3f',
        mat4: 'mat4x4f',
        texture: 'texture_2d<f32>',
        sampler2D: 'sampler',
        struct: 'struct',
} as const

export const SWIZZLE_BASE_MAP = {
        float: 'float',
        vec2: 'float',
        vec3: 'float',
        vec4: 'float',
        int: 'int',
        ivec2: 'int',
        ivec3: 'int',
        ivec4: 'int',
        uint: 'uint',
        uvec2: 'uint',
        uvec3: 'uint',
        uvec4: 'uint',
        bool: 'bool',
        bvec2: 'bool',
        bvec3: 'bool',
        bvec4: 'bool',
} as const

export const SWIZZLE_RESULT_MAP = {
        float: { 1: 'float', 2: 'vec2', 3: 'vec3', 4: 'vec4', 9: 'mat3', 16: 'mat4' } as const,
        int: { 1: 'int', 2: 'ivec2', 3: 'ivec3', 4: 'ivec4' } as const,
        uint: { 1: 'uint', 2: 'uvec2', 3: 'uvec3', 4: 'uvec4' } as const,
        bool: { 1: 'bool', 2: 'bvec2', 3: 'bvec3', 4: 'bvec4' } as const,
}

export const CONSTANTS = Object.keys(TYPE_MAPPING) as (keyof typeof TYPE_MAPPING)[]

export const OPERATORS = {
        not: '', // IGNORED
        add: '+',
        sub: '-',
        mul: '*',
        div: '/',
        mod: '%',
        equal: '==',
        notEqual: '!=',
        lessThan: '<',
        lessThanEqual: '<=',
        greaterThan: '>',
        greaterThanEqual: '>=',
        and: '&&',
        or: '||',
        bitAnd: '&',
        bitOr: '|',
        bitXor: '^',
        shiftLeft: '<<',
        shiftRight: '>>',
        addAssign: '+=',
        subAssign: '-=',
        mulAssign: '*=',
        divAssign: '/=',
        modAssign: '%=',
        bitAndAssign: '&=',
        bitOrAssign: '|=',
        bitXorAssign: '^=',
        shiftLeftAssign: '<<=',
        shiftRightAssign: '>>=',
} as const

export const OPERATOR_KEYS = Object.keys(OPERATORS) as (keyof typeof OPERATORS)[]

export const BUILTIN_TYPES = {
        // WGSL builtin variables
        position: 'vec4',
        vertex_index: 'uint',
        instance_index: 'uint',
        front_facing: 'bool',
        frag_depth: 'float',
        sample_index: 'uint',
        sample_mask: 'uint',
        point_coord: 'vec2',
        global_invocation_id: 'uvec3',

        // TSL compatible variables
        positionLocal: 'vec3',
        positionWorld: 'vec3',
        positionView: 'vec3',
        normalLocal: 'vec3',
        normalWorld: 'vec3',
        normalView: 'vec3',
        screenCoordinate: 'vec2',
        screenUV: 'vec2',

        // Legacy GLSL variables (for backward compatibility)
        gl_FragCoord: 'vec4',
        gl_VertexID: 'uint',
        gl_InstanceID: 'uint',
        gl_FrontFacing: 'bool',
        gl_FragDepth: 'float',
        gl_SampleID: 'uint',
        gl_SampleMask: 'uint',
        gl_PointCoord: 'vec2',

        // Common variables
        normal: 'vec3',
        uv: 'vec2',
        color: 'vec4',
} as const

export const COMPARISON_OPERATORS = ['equal', 'notEqual', 'lessThan', 'lessThanEqual', 'greaterThan', 'greaterThanEqual'] as const

export const LOGICAL_OPERATORS = ['and', 'or'] as const

// Operator type rules [L, R, Result] format (no duplicates, same-type handled by logic)
export const OPERATOR_TYPE_RULES = [
        // Scalar broadcast operations (result follows vector type)
        ['float', 'vec2', 'vec2'],
        ['float', 'vec3', 'vec3'],
        ['float', 'vec4', 'vec4'],
        ['int', 'ivec2', 'ivec2'],
        ['int', 'ivec3', 'ivec3'],
        ['int', 'ivec4', 'ivec4'],
        ['uint', 'uvec2', 'uvec2'],
        ['uint', 'uvec3', 'uvec3'],
        ['uint', 'uvec4', 'uvec4'],
        // Matrix-vector operations (mat * vec → vec)
        ['mat2', 'vec2', 'vec2'],
        ['mat3', 'vec3', 'vec3'],
        ['mat4', 'vec4', 'vec4'],
        // Vector-matrix operations (vec * mat → vec)
        ['vec2', 'mat2', 'vec2'],
        ['vec3', 'mat3', 'vec3'],
        ['vec4', 'mat4', 'vec4'],
] as const

export const WGSL_TO_GLSL_BUILTIN = {
        position: 'gl_FragCoord',
        vertex_index: 'gl_VertexID',
        instance_index: 'gl_InstanceID',
        front_facing: 'gl_FrontFacing',
        frag_depth: 'gl_FragDepth',
        sample_index: 'gl_SampleID',
        sample_mask: 'gl_SampleMask',
        point_coord: 'gl_PointCoord',
        uv: 'gl_FragCoord.xy',
} as const

/**
 * 2.1. unified with:
 * 1.1. index.ts functions and
 * 3.1. types.ts _N
 */
// Function return type mapping for method chaining
export const FUNCTION_RETURN_TYPES = {
        // 0. Always return bool
        all: 'bool',
        any: 'bool',
        // 2. Always return float
        determinant: 'float',
        distance: 'float',
        dot: 'float',
        length: 'float',
        lengthSq: 'float',
        luminance: 'float',
        // 3. Always return vec3
        cross: 'vec3',
        // 4. Always return vec4
        cubeTexture: 'vec4',
        texture: 'vec4',
        texelFetch: 'vec4',
        textureLod: 'vec4',
} as const

/**
 * 2.2. unified with:
 * 1.2. index.ts functions and
 * 3.2. types.ts _N
 */
// All shader functions (type inference now handled by inferFrom)
export const FUNCTIONS = [
        ...(Object.keys(FUNCTION_RETURN_TYPES) as (keyof typeof FUNCTION_RETURN_TYPES)[]),
        // 0. Component-wise functions
        'abs',
        'acos',
        'acosh',
        'asin',
        'asinh',
        'atan',
        'atanh',
        'ceil',
        'cos',
        'cosh',
        'dFdx',
        'dFdy',
        'degrees',
        'exp',
        'exp2',
        'floor',
        'fract',
        'fwidth',
        'inverse',
        'inverseSqrt',
        'log',
        'log2',
        'negate',
        'normalize',
        'oneMinus',
        'radians',
        'reciprocal',
        'round',
        'sign',
        'sin',
        'sinh',
        'sqrt',
        'tan',
        'tanh',
        'trunc',
        'saturate',
        // 1. Functions where first argument determines return type
        'atan2',
        'clamp',
        'max',
        'min',
        'mix',
        'pow',
        'reflect',
        'refract',
        // 2. Functions where not first argument determines return type
        'smoothstep',
        'step',
        // @NOTE: mod is operator
] as const

// Check if two types are the same (for same-type operations)
const isSameType = (L: string, R: string): boolean => L === R

// Check if combination exists in rules (handles bidirectional matching)
const isValidCombination = (L: string, R: string): boolean => {
        return OPERATOR_TYPE_RULES.some(([left, right, _]) => (left === L && right === R) || (left === R && right === L))
}

// Type constraint validation for operators ([L, R, Result] format)
export const validateOperatorTypes = (L: string, R: string, op: string): boolean => {
        if (COMPARISON_OPERATORS.includes(op as any) || LOGICAL_OPERATORS.includes(op as any)) return isSameType(L, R)
        if (isSameType(L, R)) return true
        return isValidCombination(L, R)
}

// Get result type for operator (used by inferOperator)
export const getOperatorResultType = (L: string, R: string, op: string): string => {
        if (COMPARISON_OPERATORS.includes(op as any) || LOGICAL_OPERATORS.includes(op as any)) return 'bool'
        // Same type operations return the same type
        if (isSameType(L, R)) return L
        const rule = OPERATOR_TYPE_RULES.find(([left, right, _]) => (left === L && right === R) || (left === R && right === L))
        return rule ? rule[2] : L
}
