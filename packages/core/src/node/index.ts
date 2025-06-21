import { code } from './code'
import { f, n, node, u } from './node'
import type { NodeConfig, X } from './types'
export * from './code'
export * from './const'
export * from './node'
export * from './scope'
export * from './types'

// Default uniforms
export const iResolution = u('iResolution', [1280, 800])
export const iMouse = u('iMouse', [0, 0])
export const iTime = u('iTime', 0)
export const fragCoord = node('variable', { id: 'fragCoord' })
export const fragment = (x: X, state: NodeConfig) => code(node('fragment', null, x), state)
export const vertex = (x: X, state: NodeConfig) => code(node('vertex', null, x), state)

// Type constructors
export const float = (x: X) => n('float', x)
export const int = (x: X) => n('int', x)
export const uint = (x: X) => n('uint', x)
export const bool = (x: X) => n('bool', x)
export const vec2 = (x?: X, y?: X) => n('vec2', x, y)
export const vec3 = (x?: X, y?: X, z?: X) => n('vec3', x, y, z)
export const vec4 = (x?: X, y?: X, z?: X, w?: X) => n('vec4', x, y, z, w)
export const mat2 = (...args: X[]) => n('mat2', ...args)
export const mat3 = (...args: X[]) => n('mat3', ...args)
export const mat4 = (...args: X[]) => n('mat4', ...args)
export const ivec2 = (x?: X, y?: X) => n('ivec2', x, y)
export const ivec3 = (x?: X, y?: X, z?: X) => n('ivec3', x, y, z)
export const ivec4 = (x?: X, y?: X, z?: X, w?: X) => n('ivec4', x, y, z, w)
export const uvec2 = (x?: X, y?: X) => n('uvec2', x, y)
export const uvec3 = (x?: X, y?: X, z?: X) => n('uvec3', x, y, z)
export const uvec4 = (x?: X, y?: X, z?: X, w?: X) => n('uvec4', x, y, z, w)
export const bvec2 = (x?: X, y?: X) => n('bvec2', x, y)
export const bvec3 = (x?: X, y?: X, z?: X) => n('bvec3', x, y, z)
export const bvec4 = (x?: X, y?: X, z?: X, w?: X) => n('bvec4', x, y, z, w)

// Math Functions
export const abs = (x: X) => f('abs', x) // Return the absolute value of the parameter.
export const acos = (x: X) => f('acos', x) // Return the arccosine of the parameter.
export const all = (x: X) => f('all', x) // Return true if all components of x are true.
export const any = (x: X) => f('any', x) // Return true if any component of x is true.
export const asin = (x: X) => f('asin', x) // Return the arcsine of the parameter.
export const atan = (y: X, x: X) => f('atan', y, x) // Return the arc-tangent of the parameters.
export const bitcast = (x: X, y: X) => f('bitcast', x, y) // Reinterpret the bits of a value as a different type.
export const cbrt = (x: X) => f('cbrt', x) // Return the cube root of the parameter.
export const ceil = (x: X) => f('ceil', x) // Find the nearest integer that is greater than or equal to the parameter.
export const clamp = (x: X, min: X, max: X) => f('clamp', x, min, max) // Constrain a value to lie between two further values.
export const cos = (x: X) => f('cos', x) // Return the cosine of the parameter.
export const cross = (x: X, y: X) => f('cross', x, y) // Calculate the cross product of two vectors.
export const dFdx = (p: X) => f('dFdx', p) // Return the partial derivative of an argument with respect to x.
export const dFdy = (p: X) => f('dFdy', p) // Return the partial derivative of an argument with respect to y.
export const degrees = (radians: X) => f('degrees', radians) // Convert a quantity in radians to degrees.
export const difference = (x: X, y: X) => f('difference', x, y) // Calculate the absolute difference between two values.
export const distance = (x: X, y: X) => f('distance', x, y) // Calculate the distance between two points.
export const dot = (x: X, y: X) => f('dot', x, y) // Calculate the dot product of two vectors.
export const equals = (x: X, y: X) => f('equals', x, y) // Return true if x equals y.
export const exp = (x: X) => f('exp', x) // Return the natural exponentiation of the parameter.
export const exp2 = (x: X) => f('exp2', x) // Return 2 raised to the power of the parameter.
export const faceforward = (N: X, I: X, Nref: X) => f('faceforward', N, I, Nref) // Return a vector pointing in the same direction as another.
export const floor = (x: X) => f('floor', x) // Find the nearest integer less than or equal to the parameter.
export const fract = (x: X) => f('fract', x) // Compute the fractional part of the argument.
export const fwidth = (x: X) => f('fwidth', x) // Return the sum of the absolute derivatives in x and y.
export const inverseSqrt = (x: X) => f('inverseSqrt', x) // Return the inverse of the square root of the parameter.
export const length = (x: X) => f('length', x) // Calculate the length of a vector.
export const lengthSq = (x: X) => f('lengthSq', x) // Calculate the squared length of a vector.
export const log = (x: X) => f('log', x) // Return the natural logarithm of the parameter.
export const log2 = (x: X) => f('log2', x) // Return the base 2 logarithm of the parameter.
export const max = (x: X, y: X) => f('max', x, y) // Return the greater of two values.
export const min = (x: X, y: X) => f('min', x, y) // Return the lesser of two values.
export const mix = (x: X, y: X, a: X) => f('mix', x, y, a) // Linearly interpolate between two values.
export const negate = (x: X) => f('negate', x) // Negate the value of the parameter ( -x ).
export const normalize = (x: X) => f('normalize', x) // Calculate the unit vector in the same direction as the original vector.
export const oneMinus = (x: X) => f('oneMinus', x) // Return 1 minus the parameter.
export const pow = (x: X, y: X) => f('pow', x, y) // Return the value of the first parameter raised to the power of the second.
export const pow2 = (x: X) => f('pow2', x) // Return the square of the parameter.
export const pow3 = (x: X) => f('pow3', x) // Return the cube of the parameter.
export const pow4 = (x: X) => f('pow4', x) // Return the fourth power of the parameter.
export const radians = (degrees: X) => f('radians', degrees) // Convert a quantity in degrees to radians.
export const reciprocal = (x: X) => f('reciprocal', x) // Return the reciprocal of the parameter (1/x).
export const reflect = (I: X, N: X) => f('reflect', I, N) // Calculate the reflection direction for an incident vector.
export const refract = (I: X, N: X, eta: X) => f('refract', I, N, eta) // Calculate the refraction direction for an incident vector.
export const round = (x: X) => f('round', x) // Round the parameter to the nearest integer.
export const saturate = (x: X) => f('saturate', x) // Constrain a value between 0 and 1.
export const sign = (x: X) => f('sign', x) // Extract the sign of the parameter.
export const sin = (x: X) => f('sin', x) // Return the sine of the parameter.
export const smoothstep = (e0: X, e1: X, x: X) => f('smoothstep', e0, e1, x) // Perform Hermite interpolation between two values.
export const sqrt = (x: X) => f('sqrt', x) // Return the square root of the parameter.
export const step = (edge: X, x: X) => f('step', edge, x) // Generate a step function by comparing two values.
export const tan = (x: X) => f('tan', x) // Return the tangent of the parameter.
export const transformDirection = (dir: X, matrix: X) => f('transformDirection', dir, matrix) // Transform the direction of a vector by a matrix and then normalize the result.
export const trunc = (x: X) => f('trunc', x) // Truncate the parameter, removing the fractional part.
