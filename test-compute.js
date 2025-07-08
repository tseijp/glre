import {
        compute,
        storageBuffer,
        workgroupMemory,
        globalInvocationId,
        localInvocationId,
        atomicAdd,
        workgroupBarrier,
        float,
        vec4,
        Fn,
} from './packages/core/src/node/index.ts'

// Test compute shader creation
console.log('Testing Compute Shader Generation...')

// Create storage buffers
const inputBuffer = storageBuffer(vec4(), 'read', 'input')
const outputBuffer = storageBuffer(vec4(), 'write', 'output')
const sharedMemory = workgroupMemory(float(), 256, 'shared')

// Simple compute shader that doubles input values
const computeShader = Fn(() => {
        const id = globalInvocationId.x
        const localId = localInvocationId.x
        
        // Read from input
        const inputValue = inputBuffer.element(id)
        
        // Store in shared memory
        sharedMemory.element(localId).assign(inputValue.x)
        
        // Synchronize workgroup
        workgroupBarrier()
        
        // Write doubled value to output
        outputBuffer.element(id).assign(inputValue.mul(2.0))
})

// Test WGSL generation
console.log('\n=== WGSL Compute Shader ===')
const wgslResult = compute(computeShader(), [64, 1, 1], { isWebGL: false })
console.log(wgslResult)

// Test GLSL generation
console.log('\n=== GLSL Compute Shader ===')
const glslResult = compute(computeShader(), [64, 1, 1], { isWebGL: true })
console.log(glslResult)

console.log('\nCompute shader generation test completed!')