import { useGL } from 'glre/src/react'

const computeShader = `
@group(0) @binding(0) var<uniform> iTime: f32;
@group(2) @binding(0) var<storage, read_write> data: array<f32>;

@compute @workgroup_size(64)
fn main(@builtin(global_invocation_id) global_invocation_id: vec3u) {
        var index = global_invocation_id.x;
        var t = iTime + f32(index) * 0.1;
        data[index] = sin(t) * 0.5 + 0.5;
}
`

const fragmentShader = `
@group(0) @binding(0) var<uniform> iResolution: vec2f;
@group(2) @binding(0) var<storage, read_write> data: array<f32>;

@fragment
fn main(@builtin(position) position: vec4f) -> @location(0) vec4f {
    var uv = position.xy / iResolution;
    var index = u32(uv.x * 1024.0) % u32(1024);
    var value = data[index];
    return vec4f(value, value * 0.5, 1.0 - value, 1.0);
}
`

export default function () {
        const gl = useGL({
                count: 3,
                isWebGL: false,
                cs: computeShader,
                fs: fragmentShader,
        })

        gl.storage('data', new Float32Array(1024))

        return <canvas ref={gl.ref} />
}
