import { useGL, isServer } from 'glre/src/react'
import { useDrag } from 'rege/react'

export default function GPGPUDrawApp() {
        const [w, h] = isServer() ? [1280, 800] : [window.innerWidth, window.innerHeight]

        const gl = useGL({
                particleCount: [w, h],
                isWebGL: true,
                compute: /* c */ `
                #version 300 es
                precision mediump float;
                uniform vec2 m0;
                uniform vec2 m1;
                uniform sampler2D data;
                layout(location = 0) out vec4 _data;

                float lineSDF2D(vec2 st, vec2 a, vec2 b) {
                        vec2 b_to_a = b - a;
                        vec2 to_a = st - a;
                        float h = clamp(dot(to_a, b_to_a) / dot(b_to_a, b_to_a), 0.0, 1.0);
                        return length(to_a - h * b_to_a);
                }

                vec2 aspect(vec2 st, vec2 s) {
                        vec2 result = st;
                        result.x = result.x * s.x / s.y;
                        return result;
                }

                uniform vec2 iResolution;
                void cs(uvec3 p0) {
                        bool isDragging = m0.x > 0.0 && m1.x > 0.0;
                        float current = texelFetch(data, ivec2(int(p0.x) % ${w}, int(p0.x) / ${w}), 0).x;
                        if (isDragging) {
                                float index = float(p0.x);
                                float x = index - floor(index / ${w}.0) * ${w}.0;
                                float y = index / ${w}.0;
                                vec2 uv = vec2(x, y);
                                if (lineSDF2D(aspect(uv, iResolution) / iResolution, aspect(m0, iResolution) / iResolution, aspect(m1, iResolution) / iResolution) < 0.01) {
                                        _data = vec4(0.0, 0.0, 0.0, 1.0);
                                        return;
                                }
                        }
                        _data = vec4(current, 0.0, 0.0, 1.0);
                }

                void main() {
                        cs(uvec3(uint(gl_FragCoord.y) * uint(${w}) + uint(gl_FragCoord.x), 0u, 0u));
                }
                `,
                fragment: /* c */ `
                #version 300 es
                precision mediump float;
                out vec4 fragColor;
                uniform sampler2D data;

                vec4 fs(vec2 p0) {
                        float x = p0.x * ${w}.0;
                        float y = floor(p0.y * ${h}.0);
                        uint index = uint(-(y - ${h}.0) * ${w}.0 + x);
                        float value = texelFetch(data, ivec2(int(index) % ${w}, int(index) / ${w}), 0).x;
                        return vec4(vec3(value), 1.0);
                }

                uniform vec2 iResolution;
                void main() {
                        fragColor = fs(gl_FragCoord.xy / iResolution);
                }
                `,
        })

        const drag = useDrag(() => {
                gl.uniform('m1', drag._value)
                if (drag.isDragging) {
                        gl.uniform('m0', drag.value)
                } else gl.uniform('m0', [-1, -1])
        })

        gl.storage('data', new Float32Array(w * h).fill(1))

        return (
                <div ref={drag.ref} style={{ position: 'fixed' }}>
                        <canvas ref={gl.ref} />
                </div>
        )
}
