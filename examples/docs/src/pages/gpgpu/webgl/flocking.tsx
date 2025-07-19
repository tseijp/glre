import { useGL } from 'glre/src/react'
import { useEffect } from 'react'

const flockingCompute = `
#version 300 es
precision highp float;
uniform float iTime;
out vec4 fragColor;

void main() {
        ivec2 coord = ivec2(gl_FragCoord.xy);
        vec2 texSize = vec2(32.0, 32.0);
        if (coord.x >= int(texSize.x) || coord.y >= int(texSize.y)) {
                discard;
        }
        
        int index = coord.y * int(texSize.x) + coord.x;
        int totalBoids = 256;
        if (index >= totalBoids * 2) {
                discard;
        }
        
        bool isVelocity = (index % 2) == 1;
        int boidIndex = index / 2;
        
        if (isVelocity) {
                float angle = float(boidIndex) * 0.1 + iTime * 0.5;
                vec2 vel = vec2(cos(angle), sin(angle)) * 0.1;
                fragColor = vec4(vel, 0.0, 1.0);
        } else {
                float x = 0.5 + sin(float(boidIndex) * 0.1 + iTime) * 0.3;
                float y = 0.5 + cos(float(boidIndex) * 0.1 + iTime) * 0.3;
                fragColor = vec4(x, y, 0.0, 1.0);
        }
}
`

const flockingFragment = `
#version 300 es
precision highp float;
uniform vec2 iResolution;
uniform sampler2D positions;
uniform sampler2D velocities;
out vec4 fragColor;

void main() {
        vec2 uv = gl_FragCoord.xy / iResolution;
        int boidCount = 256;
        vec3 color = vec3(0.02, 0.03, 0.05);
        
        for (int i = 0; i < boidCount; i++) {
                int y = i / 32;
                int x = i - y * 32;
                ivec2 posCoord = ivec2(x * 2, y);
                ivec2 velCoord = ivec2(x * 2 + 1, y);
                
                vec2 boidPos = texelFetch(positions, posCoord, 0).xy;
                vec2 vel = texelFetch(velocities, velCoord, 0).xy;
                
                float dist = distance(uv, boidPos);
                float intensity = 1.0 / (1.0 + dist * 2000.0);
                float speed = length(vel);
                color += vec3(intensity, intensity * speed * 5.0, intensity * 0.5);
        }
        
        fragColor = vec4(color, 1.0);
}
`

export default function () {
        const gl = useGL({
                count: 3,
                isWebGL: true,
                cs: flockingCompute,
                fs: flockingFragment,
        })

        useEffect(() => {
                const boidCount = 256
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
        }, [])

        return <canvas ref={gl.ref} />
}