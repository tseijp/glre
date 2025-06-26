export const SWIZZLES = ['x', 'y', 'z', 'w', 'r', 'g', 'b', 'a', 's', 't', 'p', 'q'] as const

export const CONSTANTS = [
        'bool',
        'uint',
        'int',
        'float',
        'bvec2',
        'bvec3',
        'bvec4',
        'ivec2',
        'ivec3',
        'ivec4',
        'uvec2',
        'uvec3',
        'uvec4',
        'vec2',
        'vec3',
        'vec4',
        'color',
        'mat2',
        'mat3',
        'mat4',
] as const

export const CONVERSIONS = [
        'toFloat',
        'toInt',
        'toUint',
        'toBool',
        'toVec2',
        'toVec3',
        'toVec4',
        'toIvec2',
        'toIvec3',
        'toIvec4',
        'toUvec2',
        'toUvec3',
        'toUvec4',
        'toBvec2',
        'toBvec3',
        'toBvec4',
        'toMat2',
        'toMat3',
        'toMat4',
        'toColor',
] as const

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

export const OPERATOR_KEYS = Object.keys(OPERATORS) as (keyof typeof OPERATORS)[]

export const SCALAR_RETURN_FUNCTIONS = ['dot', 'distance', 'length', 'lengthSq', 'determinant', 'luminance'] as const

export const BOOL_RETURN_FUNCTIONS = ['all', 'any'] as const

export const PRESERVE_TYPE_FUNCTIONS = [
        'abs',
        'sign',
        'floor',
        'ceil',
        'round',
        'fract',
        'trunc',
        'sin',
        'cos',
        'tan',
        'asin',
        'acos',
        'atan',
        'exp',
        'exp2',
        'log',
        'log2',
        'sqrt',
        'inverseSqrt',
        'normalize',
        'oneMinus',
        'saturate',
        'negate',
        'reciprocal',
        'dFdx',
        'dFdy',
        'fwidth',
] as const

export const VEC3_RETURN_FUNCTIONS = ['cross'] as const

export const FIRST_ARG_TYPE_FUNCTIONS = ['reflect', 'refract'] as const

export const HIGHEST_TYPE_FUNCTIONS = ['min', 'max', 'mix', 'clamp', 'step', 'smoothstep'] as const

export const VEC4_RETURN_FUNCTIONS = ['texture', 'textureLod', 'textureSize', 'cubeTexture'] as const

export const ADDITIONAL_FUNCTIONS = [
        'atan2',
        'degrees',
        'faceforward',
        'bitcast',
        'cbrt',
        'difference',
        'equals',
        'pow',
        'pow2',
        'pow3',
        'pow4',
        'radians',
        'transformDirection',
] as const

export const FUNCTIONS = [
        ...SCALAR_RETURN_FUNCTIONS,
        ...BOOL_RETURN_FUNCTIONS,
        ...PRESERVE_TYPE_FUNCTIONS,
        ...VEC3_RETURN_FUNCTIONS,
        ...FIRST_ARG_TYPE_FUNCTIONS,
        ...HIGHEST_TYPE_FUNCTIONS,
        ...VEC4_RETURN_FUNCTIONS,
        ...ADDITIONAL_FUNCTIONS,
] as const

export const TYPE_MAPPING = {
        float: 'f32',
        int: 'i32',
        uint: 'u32',
        bool: 'bool',
        vec2: 'vec2f',
        vec3: 'vec3f',
        vec4: 'vec4f',
        mat2: 'mat2x2f',
        mat3: 'mat3x3f',
        mat4: 'mat4x4f',
        ivec2: 'vec2i',
        ivec3: 'vec3i',
        ivec4: 'vec4i',
        uvec2: 'vec2u',
        uvec3: 'vec3u',
        uvec4: 'vec4u',
        bvec2: 'vec2<bool>',
        bvec3: 'vec3<bool>',
        bvec4: 'vec4<bool>',
} as const

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
