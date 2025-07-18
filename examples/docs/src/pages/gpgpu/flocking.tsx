import { useGL } from 'glre/src/react'

const flockingCompute = `
@group(0) @binding(0) var<uniform> iTime: f32;
@group(2) @binding(0) var<storage, read_write> positions: array<vec2f>;
@group(2) @binding(1) var<storage, read_write> velocities: array<vec2f>;

@compute @workgroup_size(64)
fn main(@builtin(global_invocation_id) global_invocation_id: vec3u) {
        var index = global_invocation_id.x;
        if (index >= arrayLength(&positions)) {
                return;
        }
        var pos = positions[index];
        var vel = velocities[index];
        var separation = vec2f(0.0);
        var alignment = vec2f(0.0);
        var cohesion = vec2f(0.0);
        var separationCount = 0;
        var neighborCount = 0;
        for (var i = 0u; i < arrayLength(&positions); i++) {
                if (i == index) { continue; }
                var otherPos = positions[i];
                var dist = distance(pos, otherPos);
                if (dist < 0.05) {
                        separation += normalize(pos - otherPos) / dist;
                        separationCount++;
                }
                if (dist < 0.1) {
                        alignment += velocities[i];
                        cohesion += otherPos;
                        neighborCount++;
                }
        }
        if (separationCount > 0) {
                separation = separation / f32(separationCount) * 0.5;
        }
        if (neighborCount > 0) {
                alignment = normalize(alignment / f32(neighborCount)) * 0.3;
                cohesion = normalize(cohesion / f32(neighborCount) - pos) * 0.2;
        }
        vel += separation + alignment + cohesion;
        vel = normalize(vel) * 0.3;
        var newPos = pos + vel * 0.016;
        if (newPos.x < 0.0 || newPos.x > 1.0) {
                vel.x *= -1.0;
                newPos.x = clamp(newPos.x, 0.0, 1.0);
        }
        if (newPos.y < 0.0 || newPos.y > 1.0) {
                vel.y *= -1.0;
                newPos.y = clamp(newPos.y, 0.0, 1.0);
        }
        positions[index] = newPos;
        velocities[index] = vel;
}
`

const flockingFragment = `
@group(0) @binding(0) var<uniform> iResolution: vec2f;
@group(2) @binding(0) var<storage, read_write> positions: array<vec2f>;
@group(2) @binding(1) var<storage, read_write> velocities: array<vec2f>;

@fragment
fn main(@builtin(position) position: vec4f) -> @location(0) vec4f {
    var uv = position.xy / iResolution;
    var boidCount = arrayLength(&positions);
    var color = vec3f(0.02, 0.03, 0.05);
    for (var i = 0u; i < boidCount; i++) {
        var boidPos = positions[i];
        var vel = velocities[i];
        var dist = distance(uv, boidPos);
        var intensity = 1.0 / (1.0 + dist * 200.0);
        var speed = length(vel);
        color += vec3f(intensity, intensity * speed * 5.0, intensity * 0.5);
    }
    return vec4f(color, 1.0);
}
`

export default function () {
        const gl = useGL({
                count: 3,
                isWebGL: false,
                cs: flockingCompute,
                fs: flockingFragment,
        })

        const boidCount = 128
        const positions = new Float32Array(boidCount * 2)
        const velocities = new Float32Array(boidCount * 2)

        for (let i = 0; i < boidCount; i++) {
                positions[i * 2] = Math.random() * 0.8 + 0.1
                positions[i * 2 + 1] = Math.random() * 0.8 + 0.1
                velocities[i * 2] = (Math.random() - 0.5) * 0.1
                velocities[i * 2 + 1] = (Math.random() - 0.5) * 0.1
        }

        gl.storage('positions', positions)
        gl.storage('velocities', velocities)

        return <canvas ref={gl.ref} />
}
