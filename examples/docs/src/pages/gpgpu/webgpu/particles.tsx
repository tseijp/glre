import { useGL } from 'glre/src/react'

const particleCompute = `
@group(0) @binding(0) var<uniform> iTime: f32;
@group(2) @binding(0) var<storage, read_write> positions: array<vec2f>;
@group(2) @binding(1) var<storage, read_write> velocities: array<vec2f>;

struct In {
        @builtin(global_invocation_id) global_invocation_id: vec3u
}

@compute @workgroup_size(32)
fn main(in: In) {
        var index = in.global_invocation_id.x;
        var pos = positions[index];
        var vel = velocities[index];
        pos += vel * 0.01;
        if (pos.x < 0.0 || pos.x > 1.0) {
                vel.x *= -1.0;
                pos.x = clamp(pos.x, 0.0, 1.0);
        }
        if (pos.y < 0.0 || pos.y > 1.0) {
                vel.y *= -1.0;
                pos.y = clamp(pos.y, 0.0, 1.0);
        }
        positions[index] = pos;
        velocities[index] = vel;
}
`

const particleFragment = `
@group(0) @binding(0) var<uniform> iResolution: vec2f;
@group(2) @binding(0) var<storage, read_write> positions: array<vec2f>;

struct In {
        @builtin(position) position: vec4f
}

@fragment
fn main(in: In) -> @location(0) vec4f {
        var uv = in.position.xy / iResolution;
        var particleCount = arrayLength(&positions);
        var intensity = f32(0.0);
        for (var i = 0u; i < particleCount; i++) {
                var pos = positions[i];
                var dist = distance(uv, pos);
                intensity += 1.0 / dist / f32(particleCount);
        }
        var color = vec3f(0.3, 0.2, 0.2) * intensity;
        return vec4f(color, 1.0);
}
`

export default function () {
        const gl = useGL({
                count: 3,
                isWebGL: false,
                cs: particleCompute,
                fs: particleFragment,
        })

        const particleCount = 1024
        const positions = new Float32Array(particleCount * 2)
        const velocities = new Float32Array(particleCount * 2)

        for (let i = 0; i < particleCount; i++) {
                positions[i * 2] = Math.random()
                positions[i * 2 + 1] = Math.random()
                velocities[i * 2] = (Math.random() - 0.5) * 0.5
                velocities[i * 2 + 1] = (Math.random() - 0.5) * 0.5
        }

        gl.storage('positions', positions)
        gl.storage('velocities', velocities)

        return <canvas ref={gl.ref} />
}
