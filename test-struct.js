// Simple test for struct implementation
const { struct, vec3, vec4 } = require('./packages/core/src/node/index.ts')

try {
    // Create a struct definition
    const MyStruct = struct({
        position: vec3(),
        color: vec4(),
        normal: vec3()
    })
    
    console.log('✓ struct creation successful')
    console.log('struct type:', MyStruct.type)
    console.log('struct props:', MyStruct.props)
    
    // Try member access
    if (MyStruct.props.fields) {
        console.log('✓ struct fields defined:', Object.keys(MyStruct.props.fields))
    }
    
    console.log('✓ All tests passed!')
    
} catch (error) {
    console.error('✗ Test failed:', error.message)
    console.error(error.stack)
}