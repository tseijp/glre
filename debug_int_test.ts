// Debug int type checking
import { int } from './packages/core/src/node/index'

// Test int type inference
const intValue = int()
const result = intValue.add(1) // This should error but doesn't

// Type information
console.log('Type of intValue:', typeof intValue)
