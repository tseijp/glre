import { createGL } from '../packages/core/src/index.ts'

const canvas = document.createElement('canvas')
document.body.appendChild(canvas)

const redTriangleVertices = [
        -0.5, -0.5,
         0.5, -0.5,
         0.0,  0.5
]

const blueQuadVertices = [
        -0.8,  0.8,
        -0.2,  0.8,
        -0.2,  0.2,
        -0.8,  0.2
]

const redShader = {
        vertex: `
        struct VertexOut {
                @builtin(position) position: vec4f,
        }
        
        @vertex
        fn main(@location(0) position: vec2f) -> VertexOut {
                var out: VertexOut;
                out.position = vec4f(position, 0.0, 1.0);
                return out;
        }`,
        fragment: `
        @fragment
        fn main() -> @location(0) vec4f {
                return vec4f(1.0, 0.0, 0.0, 1.0);
        }`
}

const blueShader = {
        vertex: `
        struct VertexOut {
                @builtin(position) position: vec4f,
        }
        
        @vertex 
        fn main(@location(0) position: vec2f) -> VertexOut {
                var out: VertexOut;
                out.position = vec4f(position, 0.0, 1.0);
                return out;
        }`,
        fragment: `
        @fragment
        fn main() -> @location(0) vec4f {
                return vec4f(0.0, 0.0, 1.0, 1.0);
        }`
}

const setupMultiPipelineDemo = async () => {
        const gl = createGL({ 
                el: canvas, 
                width: 800, 
                height: 600,
                isWebGL: false
        })
        
        await gl.mount()
        
        const redTriangleId = gl.pipeline('red-triangle', redShader.vertex, redShader.fragment)
        gl.pipelineAttribute(redTriangleId, 'position', redTriangleVertices)
        
        const blueQuadId = gl.pipeline('blue-quad', blueShader.vertex, blueShader.fragment)  
        gl.pipelineAttribute(blueQuadId, 'position', blueQuadVertices)
        
        console.log('Multi-pipeline demo initialized with WebGPU:', { redTriangleId, blueQuadId })
}

const setupWebGLDemo = async () => {
        const gl = createGL({ 
                el: canvas, 
                width: 800, 
                height: 600,
                isWebGL: true
        })
        
        await gl.mount()
        
        const webglRedShader = {
                vertex: `#version 300 es
                in vec2 position;
                void main() {
                        gl_Position = vec4(position, 0.0, 1.0);
                }`,
                fragment: `#version 300 es
                precision mediump float;
                out vec4 fragColor;
                void main() {
                        fragColor = vec4(1.0, 0.0, 0.0, 1.0);
                }`
        }
        
        const webglBlueShader = {
                vertex: `#version 300 es
                in vec2 position;
                void main() {
                        gl_Position = vec4(position, 0.0, 1.0);
                }`,
                fragment: `#version 300 es
                precision mediump float;
                out vec4 fragColor;
                void main() {
                        fragColor = vec4(0.0, 0.0, 1.0, 1.0);
                }`
        }
        
        const redTriangleId = gl.pipeline('red-triangle', webglRedShader.vertex, webglRedShader.fragment)
        gl.pipelineAttribute(redTriangleId, 'position', redTriangleVertices)
        
        const blueQuadId = gl.pipeline('blue-quad', webglBlueShader.vertex, webglBlueShader.fragment)  
        gl.pipelineAttribute(blueQuadId, 'position', blueQuadVertices)
        
        console.log('Multi-pipeline demo initialized with WebGL2:', { redTriangleId, blueQuadId })
}

const hasWebGPU = 'gpu' in navigator
console.log('WebGPU supported:', hasWebGPU)

if (hasWebGPU) {
        setupMultiPipelineDemo().catch(e => {
                console.warn('WebGPU failed, falling back to WebGL2:', e)
                setupWebGLDemo().catch(console.error)
        })
} else {
        setupWebGLDemo().catch(console.error)
}