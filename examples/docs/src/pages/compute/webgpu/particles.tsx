import { useGL } from 'glre/src/react'

const particleCompute = /* rust */ `
@group(0) @binding(0) var<uniform> iTime: f32;
// storage
@group(2) @binding(0) var<storage, read_write> positions: array<vec2f>;
@group(2) @binding(1) var<storage, read_write> velocities: array<vec2f>;

struct In {
        @builtin(global_invocation_id) global_invocation_id: vec3u
}

@compute @workgroup_size(32)
fn main(in: In) {
        // texel fetch
        var index: u32 = in.global_invocation_id.x;
        var pos: vec2f = positions[index];
        var vel: vec2f = velocities[index];
        pos += vel * 0.01;
        if (pos.x < 0.0 || pos.x > 1.0) {
                vel.x *= -1.0;
                pos.x = clamp(pos.x, 0.0, 1.0);
        }
        if (pos.y < 0.0 || pos.y > 1.0) {
                vel.y *= -1.0;
                pos.y = clamp(pos.y, 0.0, 1.0);
        }
        // texel output
        positions[index] = pos;
        velocities[index] = vel;
}
`

const particleFragment = /* rust */ `
@group(0) @binding(0) var<uniform> iResolution: vec2f;
@group(2) @binding(0) var<storage, read_write> positions: array<vec2f>;

struct In {
        @builtin(position) position: vec4f
}

@fragment
fn main(in: In) -> @location(0) vec4f {
        var uv: vec2f = in.position.xy / iResolution;
        // array length
        var length: u32 = arrayLength(&positions);
        // color
        var intensity: f32 = f32(0.0);
        for (var i = 0u; i < length; i++) {
                // texel fetch2
                var pos: vec2f = positions[i];
                // color
                var dist: f32 = distance(uv, pos);
                intensity += 1.0 / dist / f32(length);
        }
        var color: vec3f = vec3f(0.3, 0.2, 0.2) * intensity;
        return vec4f(color, 1.0);
}
`

const particles = 1024

export default function () {
        const gl = useGL({
                particles,
                isWebGL: false,
                cs: particleCompute,
                fs: particleFragment,
                mount() {
                        const positions = [] as number[]
                        const velocities = [] as number[]

                        for (let i = 0; i < particles; i++) {
                                positions[i * 2] = Math.random()
                                positions[i * 2 + 1] = Math.random()
                                velocities[i * 2] = (Math.random() - 0.5) * 0.5
                                velocities[i * 2 + 1] = (Math.random() - 0.5) * 0.5
                        }

                        gl.storage('positions', positions)
                        gl.storage('velocities', velocities)
                },
        })

        return <canvas ref={gl.ref} />
}
