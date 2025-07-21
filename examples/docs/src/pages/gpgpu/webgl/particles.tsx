import { useGL } from 'glre/src/react'

const particleCompute = `
#version 300 es
precision highp float;
uniform float iTime;
uniform sampler2D positions;
uniform sampler2D velocities;

layout(location = 0) out vec4 outPositions;
layout(location = 1) out vec4 outVelocities;

void main() {
        ivec2 coord = ivec2(gl_FragCoord.xy);
        vec2 texSize = vec2(textureSize(positions, 0));
        if (coord.x >= int(texSize.x) || coord.y >= int(texSize.y)) {
                discard;
        }
        vec2 pos = texelFetch(positions, coord, 0).xy;
        vec2 vel = texelFetch(velocities, coord, 0).xy;
        pos += vel * 0.01;
        if (pos.x < 0.0 || pos.x > 1.0) {
                vel.x *= -1.0;
                pos.x = clamp(pos.x, 0.0, 1.0);
        }
        if (pos.y < 0.0 || pos.y > 1.0) {
                vel.y *= -1.0;
                pos.y = clamp(pos.y, 0.0, 1.0);
        }
        outPositions = vec4(pos, 0.0, 1.0);
        outVelocities = vec4(vel, 0.0, 1.0);
}
`

const particleFragment = `
#version 300 es
precision highp float;
uniform vec2 iResolution;
uniform sampler2D positions;
out vec4 fragColor;

void main() {
        vec2 uv = gl_FragCoord.xy / iResolution;
        vec2 texSize = vec2(textureSize(positions, 0));
        int particleCount = int(texSize.x * texSize.y);
        float intensity = 0.0;
        for (int i = 0; i < particleCount; i++) {
                int y = i / int(texSize.x);
                int x = i % int(texSize.x);
                ivec2 coord = ivec2(x, y);
                vec2 pos = texelFetch(positions, coord, 0).xy;
                float dist = distance(uv, pos);
                intensity += 1.0 / dist / float(particleCount);
        }
        vec3 color = vec3(0.3, 0.2, 0.2) * intensity;
        fragColor = vec4(color, 1.0);
}
`

export default function () {
        const gl = useGL({
                isWebGL: true,
                cs: particleCompute,
                fs: particleFragment,
                loop() {
                        const t = Date.now() / 1000
                        gl.uniform('iTime', t)
                },
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
