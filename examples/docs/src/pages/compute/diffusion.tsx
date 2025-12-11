/**
 * ref: https://www.shadertoy.com/view/tsXGW4
float box(in vec2 p, in vec2 center, in vec2 dim, in float a) {
        mat2 r = mat2(cos(a), sin(a), -sin(a), cos(a));
        vec2 e = (p - vec2(0.5)) * r + vec2(0.5);
        return step(1.1, step(center.x-dim.x*0.5, e.x) - step(center.x+dim.x*0.5, e.x) + step(center.y-dim.y*0.5, e.y) - step(center.y+dim.y*0.5, e.y));
}

vec4 init(in vec2 uv) {
        float box1 = box(uv, vec2(0.5, 0.5), vec2(0.5, 0.5), -0.4);
        float box2 = box(uv, vec2(0.6, 0.3), vec2(0.4, 0.5), -1.0);
        float box3 = box(uv, vec2(0.4, 0.7), vec2(0.5, 0.4), -2.0);
        return vec4(1.0, step(1.0, -box1+box2+box3), 0.0, 1.0);
}

const float kern[9] = float[9](
        0.05, 0.2, 0.05,
        0.2, -1.0, 0.2,
        0.05, 0.2, 0.05
);

const vec2 offset[9] = vec2[9](
        vec2(-1.0, -1.0), vec2(0.0, -1.0), vec2(1.0, -1.0),
        vec2(-1.0, 0.0), vec2(0.0, 0.0), vec2(1.0, 0.0),
        vec2(-1.0, 1.0), vec2(0.0, 1.0), vec2(1.0, 1.0)
);

const float da = 1.0;
const float db = 0.5;
const float f = 0.055;
const float k = 0.062;

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
        vec2 uv = fragCoord / iResolution.xy;
        vec2 s = 1.0 / iResolution.xy;
        vec2 L = vec2(0.0);
        int i = 0;
        for (i = 0; i < 9; ++i) {
                L += kern[i] * texture(iChannel0, fract(uv + offset[i] * s)).rg;
        }
        vec2 c = texture(iChannel0, fract(uv)).rg;
        if (iFrame < 1) {
                fragColor = init(uv);
        } else {
                float AB2 = c.r * c.g * c.g * 1.0;
                float A = c.r + (da * L.r - AB2 + f*(1.0 - c.r)) * 1.0;
                float B = c.g + (db * L.g + AB2 - (k + f) * c.g) * 1.0;
                fragColor = vec4(A, B, 0.0, 1.0);
        }
}

void mainImage( out vec4 fragColor, in vec2 fragCoord) {
        vec2 uv = fragCoord/iResolution.xy;
        vec4 t = texture(iChannel0, uv);
        float dx = dFdx(t.r);
        float dy = dFdy(t.r);
        vec3 n = vec3(dx, dy, sqrt(1.0 - dx*dx - dy*dy));
        vec3 light = vec3(0.5 + 1.0 * sin(iTime*0.3), 0.5 + 1.0 * cos(iTime*0.3), 0.7);
        vec3 li = normalize(light - vec3(uv, 0.0));
        float a = clamp(dot(li, n), 0.0, 1.0);
        fragColor = vec4(a, a*a, 0.4, 1.0);
}
*/
import { Float, Fn, id, storage, uv, UVec3, vec3, Vec2, vec4, vec2, uniform, float, If, Return } from 'glre/src/node'
import { useGL, isServer } from 'glre/src/react'
import { useDrag } from 'rege/react'

export default function ReactionDiffusionApp() {
        const [w, h] = isServer() ? [0, 0] : [window.innerWidth, window.innerHeight]
        const particleCount = w * h
        const data = storage(vec2(), 'data')
        const mousePos = uniform(vec2(-1, -1))
        const isDragging = uniform(float(0))

        const idx2uv = (idx: Float) => {
                return vec2(idx.mod(w).div(w), idx.div(w).floor().div(h))
        }

        const uv2idx = (uv: Vec2, dx = 0, dy = 0) => {
                const x = uv.x.mul(w).add(dx).floor()
                const y = uv.y.mul(h).add(dy).floor()
                return y.mul(w).add(x)
        }

        const idx2cell = (idx: Float) => data.element(idx.toUInt())

        const uv2cell = (uv: Vec2, dx = 0, dy = 0) => idx2cell(uv2idx(uv, dx, dy))

        const cs = Fn(([id]: [UVec3]) => {
                const idx = id.x.toFloat().toVar('idx')
                const uv = idx2uv(idx).toVar('uv')
                If(isDragging.greaterThan(0), () => {
                        const dist = uv.sub(mousePos).length().toVar()
                        If(dist.lessThan(0.05), () => {
                                data.element(id.x).assign(vec2(0, 1))
                                Return()
                        })
                })
                const conv = (dx: number, dy: number, c: number) => {
                        return uv2cell(uv, dx, dy).mul(c)
                }
                // prettier-ignore
                const L = conv(-1, -1,  0.05).add(conv(-1, 0, 0.2)).add(conv(-1, 1, 0.05))
                     .add(conv( 0, -1,  0.2)).add(conv( 0, 0,  -1)).add(conv( 0, 1, 0.2))
                     .add(conv( 1, -1, 0.05)).add(conv( 1, 0, 0.2)).add(conv( 1, 1, 0.05))
                const current = idx2cell(id.x).toVar()
                const diffusion = vec2(1, 0.5)
                const feed = vec2(0.055, 0)
                const kill = vec2(0, 0.055 + 0.062)
                const AB2 = current.y.pow(2).mul(current.x)
                const reaction = vec2(AB2.negate(), AB2)
                let result = L.mul(diffusion).add(reaction).add(kill.oneMinus().mul(current)).add(current.oneMinus().mul(feed)).clamp(vec2(0, 0), vec2(1, 1)).toVar()

                data.element(id.x).assign(result)
        })

        const fs = Fn(([uv]: [Vec2]) => {
                const t = uv2cell(uv)
                const dx = t.x.dFdx()
                const dy = t.x.dFdy()
                const dz = dx.pow(2).add(dy.pow(2)).oneMinus()
                const n = vec3(dx, dy, dz)
                const li = mousePos.sub(uv)
                return vec4(vec3(li, 1).normalize().dot(n).pow(2).toVec3(), 1)
        })

        const gl = useGL({
                particleCount: [w, h],
                isWebGL: false,
                isDebug: true,
                cs: cs(id),
                fs: fs(uv),
                mount() {
                        const initData = new Float32Array(particleCount * 2)
                        for (let i = 0; i < particleCount; i++) {
                                initData[i * 2] = 1 // A component (chemical A)
                                initData[i * 2 + 1] = 0 // B component (chemical B) - start empty
                        }
                        gl.storage(data.props.id!, initData)
                },
        })

        const drag = useDrag(() => {
                mousePos.value = [drag.value[0] / w, drag.value[1] / h]
                isDragging.value = drag.isDragging ? 1 : 0
        })

        return (
                <div ref={drag.ref} style={{ position: 'fixed', width: '100%', height: '100%', cursor: 'crosshair' }}>
                        <canvas ref={gl.ref} />
                </div>
        )
}
