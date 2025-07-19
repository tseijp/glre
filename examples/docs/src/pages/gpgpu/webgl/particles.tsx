import { useGL } from 'glre/src/react'

const particleCompute = `
#version 300 es
precision highp float;
uniform float iTime;
out vec4 fragColor;

void main() {
        ivec2 coord = ivec2(gl_FragCoord.xy);
        vec2 texSize = vec2(64.0, 64.0);
        if (coord.x >= int(texSize.x) || coord.y >= int(texSize.y)) {
                discard;
        }
        
        int index = coord.y * int(texSize.x) + coord.x;
        int totalParticles = 2048;
        if (index >= totalParticles * 2) {
                discard;
        }
        
        bool isVelocity = (index % 2) == 1;
        int particleIndex = index / 2;
        
        if (isVelocity) {
                float angle = float(particleIndex) * 0.01 + iTime * 2.0;
                vec2 vel = vec2(cos(angle), sin(angle)) * 0.2;
                fragColor = vec4(vel, 0.0, 1.0);
        } else {
                float x = 0.5 + sin(float(particleIndex) * 0.01 + iTime) * 0.4;
                float y = 0.5 + cos(float(particleIndex) * 0.01 + iTime) * 0.4;
                x = clamp(x, 0.0, 1.0);
                y = clamp(y, 0.0, 1.0);
                fragColor = vec4(x, y, 0.0, 1.0);
        }
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
        int particleCount = 2048;
        vec3 color = vec3(0.0);
        
        for (int i = 0; i < particleCount; i++) {
                int y = i / 32;
                int x = (i - y * 32) * 2;
                ivec2 posCoord = ivec2(x, y);
                
                vec2 pos = texelFetch(positions, posCoord, 0).xy;
                float dist = distance(uv, pos);
                float intensity = 1.0 / (1.0 + dist * float(particleCount));
                color += vec3(intensity, intensity * 0.5, intensity * 0.8) * 0.5;
        }
        
        fragColor = vec4(color, 1.0);
}
`

export default function () {
        const gl = useGL({
                count: 3,
                isWebGL: true,
                cs: particleCompute,
                fs: particleFragment,
                loop() {
                        const t = Date.now() / 1000
                        gl.uniform('iTime', t)
                },
        })

        const particleCount = 2048
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