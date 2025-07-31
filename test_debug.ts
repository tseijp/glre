// Test the new ValidateOperator type
import { vec2, vec3, float, int } from './packages/core/src/node/index'

// Valid combination - should work
const valid1 = float(1).mul(vec2()) // float * vec2 -> vec2 (valid)
const valid2 = vec2().mul(1) // float * vec2 -> vec2 (valid)

// Invalid combination - should show error in argument
const invalid1 = int().mul(1) // int * float -> invalid
const invalid2 = vec2().mul(vec3()) // vec2 * vec3 -> invalid  
const invalid3 = float(1.0).mul(int(1)) // float * int -> invalid
