// Test implementation of the node system
import { 
    vec3, vec4, float, 
    If, Loop, fragmentMain,
    iResolution, fragCoord,
    fract, normalize
} from './packages/core/src/node/index.ts'

console.log('Testing basic node system functionality...')

try {
    // Test basic variables and toVar
    const result = fragmentMain(() => {
        const v = float(2).toVar('testVar')
        v.assign(v.mul(v))
        
        If(v.greaterThan(5), () => {
            v.assign(float(10))
        }).Else(() => {
            v.assign(float(1))
        })
        
        Loop({ start: 0, end: 3 }, ({ i }) => {
            v.assign(v.add(i))
        })
        
        return vec4(v, 0, 0, 1)
    })
    
    console.log('Generated shader:')
    console.log(result)
    
} catch (error) {
    console.error('Test failed:', error.message)
    console.error(error.stack)
}