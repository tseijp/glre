export const SWIZZLES = ['x', 'y', 'z', 'w', 'r', 'g', 'b', 'a', 's', 't', 'p', 'q'] as const

// Unified order with TYPE_MAPPING array
export const CONVERSIONS = [
        'toBool',
        'toUint',
        'toInt',
        'toFloat',
        'toBvec2',
        'toIvec2',
        'toUvec2',
        'toVec2',
        'toBvec3',
        'toIvec3',
        'toUvec3',
        'toVec3',
        'toBvec4',
        'toIvec4',
        'toUvec4',
        'toVec4',
        'toColor',
        'toMat2',
        'toMat3',
        'toMat4',
] as const

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

export const CONSTANTS = Object.keys(TYPE_MAPPING) as unknown as keyof typeof TYPE_MAPPING

export const OPERATORS = {
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
} as const

export const OPERATOR_KEYS = [...Object.keys(OPERATORS), 'not'] as (keyof typeof OPERATORS | 'not')[]

export const COMPONENT_COUNT_TO_TYPE = {
        1: 'float',
        2: 'vec2',
        3: 'vec3',
        4: 'vec4',
        9: 'mat3',
        16: 'mat4',
} as const

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

export const COMPARISON_OPERATORS = [
        'equal',
        'notEqual',
        'lessThan',
        'lessThanEqual',
        'greaterThan',
        'greaterThanEqual',
] as const

export const LOGICAL_OPERATORS = ['and', 'or'] as const

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
 * 3.1. types.ts BaseNodeProxy
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
 * 3.2. types.ts BaseNodeProxy
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
        'inverseSqrt',
        'log',
        'log2',
        'negate',
        'normalize',
        'oneMinus',
        'radians',
        'reciprocal',
        'round',
        'saturate',
        'sign',
        'sin',
        'sinh',
        'sqrt',
        'tan',
        'tanh',
        'trunc',
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
