/**
#version 300 es
precision mediump float;

out vec4 fragColor;

uniform vec2 iResolution;
uniform float iTime;
uniform float WIDF;
uniform float WID;
uniform float LEN;
uniform float LENF;

const int maxDepth = int(6561.0);
const int depth = int(8.0);
const int branches = int(3.0);

mat3 matRotate(float a) {
        float c = cos(a);
        float s = sin(a);
        return mat3(
                c, s, 0.0,
                -s, c, 0.0,
                0.0, 0.0, 1.0
        );
}

mat3 matTranslate(float x, float y) {
        return mat3(
                1.0, 0.0, 0.0,
                0.0, 1.0, 0.0,
                -x, -y, 1.0
        );
}

float x2(vec2 p0, float p1, float p2) {
        float h = clamp(p0.y / p2, 0.0, 1.0);
        return length(p0 - vec2(0.0, p2 * h)) - mix(p1, p1 * WIDF, h);
}

mat3 _getBranchTransform(vec4 factor, float l) {
        float angle = sin(iTime + factor.x) * factor.y + factor.z;
        return matRotate(angle) * matTranslate(0.0, (l / LENF) * factor.w);
}

mat3 getBranchTransform(int path, float l) {
        if (path == int(0.0)) {
                return _getBranchTransform(vec4(-1.0, 0.25, 0.75, 0.3), l);
        }
        if (path == int(1.0)) {
                return _getBranchTransform(vec4(0.0, 0.21, -0.6, 0.6), l);
        }
        return _getBranchTransform(vec4(1.0, 0.23, 0.0, 1.0), l);
}

float map(vec2 pos) {
        float d = x2(pos, WID, LEN);
        int c = int(0.0);

        for (int x7 = 0; x7 < maxDepth; x7 += 1) {
                vec2 pt = pos;
                float l = LEN;
                float w = WID;
                int off = maxDepth;

                for (int x8 = 0; x8 < depth; x8 += 1) {
                        l *= LENF;
                        w *= WIDF;
                        off /= branches;

                        int dec = c / off;
                        int path = dec - branches * (dec / branches);

                        pt = (getBranchTransform(path, l) * vec3(pt, 1.0)).xy;

                        if (length(vec2(0.0, l) - pt) - (l * 1.4) > 0.0) {
                                c += off;
                                c -= int(1.0);
                                break;
                        }

                        d = min(x2(pt, w, l), d);
                }

                c += int(1.0);
                if (c > maxDepth) {
                        break;
                }
        }

        return d;
}

vec4 fragment(vec4 pos) {
        float px = float(8.0) / iResolution.y;
        vec2 uv = (pos.xy - iResolution / 2.0) * px;
        float color = smoothstep(0.0, px, map(uv + vec2(0.0, 4.0)));
        return vec4(vec3(color), 1.0);
}

void main() {
        fragColor = fragment(gl_FragCoord);
}
 */

import {
        Break,
        Fn,
        Float,
        If,
        Loop,
        Vec2,
        Vec4,
        float,
        iResolution,
        int,
        Int,
        iTime,
        mat3,
        position,
        smoothstep,
        uniform,
        vec2,
        vec3,
        vec4,
} from 'glre/src/node'
import { useGL } from 'glre/src/react'
import { useControls } from 'leva'

const LEN = uniform(float(), 'LEN')
const WID = uniform(float(), 'WID')
const LENF = uniform(float(), 'LENF')
const WIDF = uniform(float(), 'WIDF')
const depth = int(8).constant('depth')
const branches = int(3).constant('branches')
const maxDepth = int(Math.pow(3, 8)).constant('maxDepth') // maxDepth = branches ^ depth

const matRotate = Fn(([a]: [Float]) => {
        const c = a.cos().toVar('c')
        const s = a.sin().toVar('s')
        return mat3(c, s, 0, s.negate(), c, 0, 0, 0, 1)
}).setLayout({
        name: 'matRotate',
        type: 'mat3',
        inputs: [{ type: 'float', name: 'a' }],
})

const matTranslate = Fn(([x, y]: [Float, Float]) => {
        return mat3(1, 0, 0, 0, 1, 0, x.negate(), y.negate(), 1)
}).setLayout({
        name: 'matTranslate',
        type: 'mat3',
        inputs: [
                { type: 'float', name: 'x' },
                { type: 'float', name: 'y' },
        ],
})

const sdBranch = Fn(([p, w, l]: [Vec2, Float, Float]) => {
        const h = p.y.div(l).clamp(0, 1).toVar('h')
        return p
                .sub(vec2(0, l.mul(h)))
                .length()
                .sub(w.mix(w.mul(WIDF), h))
})

const _getBranchTransform = Fn(([factor, l]: [Vec4, Float]) => {
        const angle = iTime.add(factor.x).sin().mul(factor.y).add(factor.z).toVar('angle')
        return matRotate(angle).mul(matTranslate(float(0), l.div(LENF).mul(factor.w)))
}).setLayout({
        name: '_getBranchTransform',
        type: 'mat3',
        inputs: [
                { type: 'vec4', name: 'factor' },
                { type: 'float', name: 'l' },
        ],
})

const getBranchTransform = Fn(([path, l]: [Int, Float]) => {
        If(path.equal(int(0)), () => {
                return _getBranchTransform(vec4(-1, 0.25, 0.75, 0.3), l)
        })
        If(path.equal(int(1)), () => {
                return _getBranchTransform(vec4(0, 0.21, -0.6, 0.6), l)
        })
        return _getBranchTransform(vec4(1, 0.23, 0, 1), l)
}).setLayout({
        name: 'getBranchTransform',
        type: 'mat3',
        inputs: [
                { type: 'int', name: 'path' },
                { type: 'float', name: 'l' },
        ],
})

const map = Fn(([pos]: [Vec2]) => {
        const d = sdBranch(pos, WID, LEN).toVar('d')
        const c = int(0).toVar('c')
        Loop(maxDepth, () => {
                const pt = pos.toVar('pt')
                const l = LEN.toVar('l')
                const w = WID.toVar('w')
                const m = maxDepth.toVar('off')
                Loop(depth, () => {
                        l.mulAssign(LENF)
                        w.mulAssign(WIDF)
                        m.divAssign(branches)
                        const dec = c.div(m).toVar('dec')
                        const path = dec.sub(branches.mul(dec.div(branches))).toVar('path')
                        pt.assign(getBranchTransform(path, l).mul(vec3(pt, 1)).xy)
                        If(vec2(0, l).sub(pt).length().sub(l.mul(1.4)).greaterThan(0), () => {
                                c.addAssign(m)
                                c.subAssign(int(1))
                                Break()
                        })
                        d.assign(sdBranch(pt, w, l).min(d))
                })
                c.addAssign(int(1))
                If(c.greaterThan(maxDepth), () => {
                        Break()
                })
        })
        return d
}).setLayout({
        name: 'map',
        type: 'float',
        inputs: [{ type: 'vec2', name: 'pos' }],
})

const fragment = Fn(([pos]: [Vec4]) => {
        const px = float(8).div(iResolution.y).toVar('px')
        const uv = pos.xy.sub(iResolution.div(2)).mul(px).toVar('uv')
        const color = smoothstep(0, px, map(uv.add(vec2(0, 4)))).toVar('color')
        return vec4(vec3(color), 1)
}).setLayout({
        name: 'fragment',
        type: 'vec4',
        inputs: [{ type: 'vec4', name: 'pos' }],
})

export default function App() {
        const gl = useGL({ frag: fragment(position) })
        gl.uniform(
                useControls({
                        LEN: { value: 3.5, min: 0, max: 4 },
                        WID: { value: 0.2, min: 0, max: 1 },
                        LENF: { value: 0.6, min: 0.01, max: 1 },
                        WIDF: { value: 0.4, min: 0, max: 1 },
                })
        )
        return <canvas ref={gl.ref} />
}
