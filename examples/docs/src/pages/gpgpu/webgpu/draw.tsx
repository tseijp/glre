import { useGL } from 'glre/src/react'
import { useDrag } from 'rege/react'

export default function GPGPUDrawApp() {
        const [w, h] = [window.innerWidth, window.innerHeight]
        const gl = useGL({
                particles: [w, h],
                isWebGL: false,
                compute: /* rust */ `
                struct In {
                        @builtin(global_invocation_id) global_invocation_id: vec3u
                }

                @group(0) @binding(3) var<uniform> m0: vec2f;
                @group(0) @binding(4) var<uniform> m1: vec2f;
                @group(2) @binding(0) var<storage, read_write> data: array<f32>;

                fn lineSDF2D(st: vec2f, a: vec2f, b: vec2f) -> f32 {
                        var b_to_a: vec2f = b - a;
                        var to_a: vec2f = st - a;
                        var h: f32 = clamp(dot(to_a, b_to_a) / dot(b_to_a, b_to_a), 0.0, 1.0);
                        return length(to_a - h * b_to_a);
                }

                fn aspect(st: vec2f, s: vec2f) -> vec2f {
                        var result: vec2f = st;
                        result.x = result.x * s.x / s.y;
                        return result;
                }

                @group(0) @binding(0) var<uniform> iResolution: vec2f;
                fn cs(p0: vec3u) {
                        var isDragging: bool = m0.x > 0.0 && m1.x > 0.0;
                        var current: f32 = data[p0.x];
                        if (isDragging) {
                                var index: f32 = f32(p0.x);
                                var x: f32 = index - floor(index / ${w}.0) * ${w}.0;
                                var y: f32 = index / ${w}.0;
                                var uv: vec2f = vec2f(x, y);
                                if (lineSDF2D(aspect(uv, iResolution) / iResolution, aspect(m0, iResolution) / iResolution, aspect(m1, iResolution) / iResolution) < 0.01) {
                                        data[p0.x] = 0.0;
                                }
                        }
                }

                @compute @workgroup_size(32)
                fn main(in: In) {
                        cs(in.global_invocation_id);
                }
                `,
                fragment: /* rust */ `
                struct Out {
                        @builtin(position) position: vec4f
                }
                @group(2) @binding(0) var<storage, read_write> data: array<f32>;

                fn fs(p0: vec2f) -> vec4f {
                        var x: f32 = p0.x * ${w}.0;
                        var y: f32 = floor(p0.y * ${h}.0);
                        var index: u32 = u32(y * ${w}.0 + x);
                        var value: f32 = data[index];
                        return vec4f(vec3f(value), 1.0);
                }

                @group(0) @binding(0) var<uniform> iResolution: vec2f;
                @fragment
                fn main(out: Out) -> @location(0) vec4f {
                        return fs(out.position.xy / iResolution);
                }
                `,
        })

        const drag = useDrag(() => {
                gl.uniform('m1', drag._value)
                if (drag.isDragging) {
                        gl.uniform('m0', drag.value)
                } else gl.uniform('m0', [-1, -1])
        })

        gl.uniform('m0', [-1, -1])
        gl.uniform('m1', [-1, -1])
        gl.storage('data', new Float32Array(w * h).fill(1))

        return (
                <div ref={drag.ref} style={{ position: 'fixed' }}>
                        <canvas ref={gl.ref} />
                </div>
        )
}
