/**
 * REF: https://www.shadertoy.com/view/3tl3zl
// The MIT License
// Copyright © 2019 J. M.
// Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions: The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software. THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
// Display a Hilbert curve (https://en.wikipedia.org/wiki/Hilbert_curve)
// Skilling's algorithm, https://doi.org/10.1063/1.1751381 and https://doi.org/10.1063/1.1751382
// see also http://www.inference.org.uk/bayesys/test/h2uv.c and compare with https://www.shadertoy.com/view/tlf3zX

vec2 h2uv(in int k, in int s) {
        int bb = 1 << s, b = bb;
        ivec2 t = ivec2(k ^ (k >> 1)), hp = ivec2(0);
        for (int j = s - 1; j >= 0; j--) {
                b >>= 1;
                hp += (t >> ivec2(j + 1, j)) & b;
        }
        for (int p = 2; p < bb; p <<= 1) {
                int q = p - 1;
                if ((hp.y & p) != 0) hp.x ^= q;
                else hp ^= (hp.x ^ hp.y) & q;
                if ((hp.x & p) != 0) hp.x ^= q;
        }
        return 2.0 * (vec2(hp) / float(bb - 1)) - 1.0;
}

// from Inigo Quilez, https://www.shadertoy.com/view/Xlf3zl
float segment(in vec2 p, in vec2 a, in vec2 b) {
        vec2 pa = p - a, ba = b - a;
        vec2  d = pa - ba * clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0);
        return dot(d, d);
}

float sdPointSq(in vec2 p, in vec2 a) {
        vec2 d = p - a;
        return dot(d, d);
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
        float e = 1.0 / iResolution.y;
        vec2 aspect = iResolution.xy * e;
        vec2 p = 2.2 * fragCoord.xy * e - 1.1 * aspect;
        vec3 col = vec3(0.992, 0.965, 0.89);
        int s = (int(floor(0.2 * iTime)) % 5) + 1; // stage of Hilbert curve construction
        int NUM = (1 << (2 * s)) - 1;
        vec2 d = vec2(9.0);
        vec2 a = vec2(h2uv(0, s)), b = a;
        for (int i = 0; i < NUM; i++) {
                b = vec2(h2uv(i + 1, s));
                d = min(d, vec2(segment(p, a, b), sdPointSq(p, a)));
                a = b;
        }
        d.x = sqrt(d.x ); d.y = sqrt(min(d.y, sdPointSq(p, b)));
        col *= 1.0 - 0.04 * smoothstep(-0.05, 0.05, sin(80.0 * d.x)); // constant distance contours
        col = mix(vec3(0.2, 0.2, 0.7), col, min(smoothstep(e, 2.0 * e, d.x), smoothstep(3.5 * e, 4.5 * e, d.y)) );
        col *= 1.0 - 0.4 * length(fragCoord/iResolution.xy - 0.3); // vignetting
        fragColor = vec4(col, 1.0);
}
 */

import Layout from '@theme/Layout'
import { useGL } from 'glre/src/react'
import { Fn, If, Loop, float, int, iMouse, iResolution, ivec2, Scope, uv, vec2, vec3, vec4 } from 'glre/src/node'
import type { IVec2, Int, Vec2, Vec4 } from 'glre/src/node'
const MAX_STEPS = 10

const segment = Fn(([p, a, b]: [Vec2, Vec2, Vec2]) => {
        const q = vec4(p.sub(a), b.sub(a)).toVar()
        const d = q.xy.sub(q.zw.mul(q.xy.dot(q.zw).div(q.zw.dot(q.zw)).clamp(0, 1))).toVar()
        return d.dot(d)
})

const LUT_2D_H2M = [0x10, 0x02, 0x03, 0x21, 0x00, 0x11, 0x13, 0x32, 0x33, 0x22, 0x20, 0x01, 0x23, 0x31, 0x30, 0x12]
const LUT_2D_M2H = [0x10, 0x23, 0x01, 0x02, 0x00, 0x11, 0x33, 0x12, 0x22, 0x03, 0x21, 0x30, 0x32, 0x31, 0x13, 0x20]

const mffff = int(0x0000ffff).constant()
const m00ff = int(0x00ff00ff).constant()
const m0f0f = int(0x0f0f0f0f).constant()
const m3333 = int(0x33333333).constant()
const m5555 = int(0x55555555).constant()

const h2m = Fn(([hilbert, bits]: [Int, Int]): Int => {
        const state = int(0).toVar()
        const output = int(0).toVar()
        const step = int(0).toVar()
        Loop(bits, () => {
                const shift = int(2)
                        .mul(bits.sub(step).sub(int(1)))
                        .toVar()
                const quad = hilbert.shiftRight(shift).bitAnd(int(3)).toVar()
                const idx = state.shiftRight(int(4)).shiftLeft(int(2)).bitOr(quad).toVar()
                const entry = int(LUT_2D_H2M[0]).toVar()
                If(idx.equal(int(0)), () => void entry.assign(int(LUT_2D_H2M[0])))
                for (let j = 1; j < LUT_2D_H2M.length; j++) {
                        If(idx.equal(int(j)), () => void entry.assign(int(LUT_2D_H2M[j])))
                }
                output.assign(output.shiftLeft(int(2)).bitOr(entry.bitAnd(int(3))))
                state.assign(entry.bitAnd(int(~3)))
                step.addAssign(int(1))
        })
        return output
})

const m2h = Fn(([morton, bits]: [Int, Int]): Int => {
        const state = int(0).toVar()
        const output = int(0).toVar()
        const step = int(0).toVar()
        Loop(bits, () => {
                const shift = int(2)
                        .mul(bits.sub(step).sub(int(1)))
                        .toVar()
                const quad = morton.shiftRight(shift).bitAnd(int(3)).toVar()
                const idx = state.shiftRight(int(4)).shiftLeft(int(2)).bitOr(quad).toVar()
                const entry = int(LUT_2D_M2H[0]).toVar()
                If(idx.equal(int(0)), () => void entry.assign(int(LUT_2D_M2H[0])))
                for (let j = 1; j < LUT_2D_M2H.length; j++) {
                        If(idx.equal(int(j)), () => void entry.assign(int(LUT_2D_M2H[j])))
                }
                output.assign(output.shiftLeft(int(2)).bitOr(entry.bitAnd(int(3))))
                state.assign(entry.bitAnd(int(~3)))
                step.addAssign(int(1))
        })
        return output
})

/**
 * morton
 */
const uv2m = Fn(([xy]: [IVec2]): Int => {
        const p = xy.toVar()
        p.bitAndAssign(ivec2(mffff))
        p.bitXorAssign(p.shiftLeft(int(8)))
        p.bitAndAssign(ivec2(m00ff))
        p.bitXorAssign(p.shiftLeft(int(4)))
        p.bitAndAssign(ivec2(m0f0f))
        p.bitXorAssign(p.shiftLeft(int(2)))
        p.bitAndAssign(ivec2(m3333))
        p.bitXorAssign(p.shiftLeft(int(1)))
        p.bitAndAssign(ivec2(m5555))
        return p.y.shiftLeft(int(1)).add(p.x)
})

const m2uv = Fn(([c]: [Int]): IVec2 => {
        const p = ivec2(c, c.shiftRight(int(1))).toVar()
        p.bitAndAssign(ivec2(m5555))
        p.bitXorAssign(p.shiftRight(int(1)))
        p.bitAndAssign(ivec2(m3333))
        p.bitXorAssign(p.shiftRight(int(2)))
        p.bitAndAssign(ivec2(m0f0f))
        p.bitXorAssign(p.shiftRight(int(4)))
        p.bitAndAssign(ivec2(m00ff))
        p.bitXorAssign(p.shiftRight(int(8)))
        p.bitAndAssign(ivec2(mffff))
        return p
})

/**
 * hilbert
 */
const uv2h = Fn(([ij, step]: [Vec2, Int]): Int => {
        const morton = uv2m(ivec2(ij.x.toInt(), ij.y.toInt()))
        return m2h(morton, step)
})

const h2uv = Fn(([id, step]: [Int, Int]): Vec2 => {
        return vec2(m2uv(h2m(id, step)))
})

/**
 * main
 */
const fragment = Scope((): Vec4 => {
        const step = int(iMouse.x.mul(MAX_STEPS).mod(MAX_STEPS).add(1)).toVar()
        const num = int(1).shiftLeft(step).toVar()
        const n1f = num.sub(int(1)).toFloat().toVar()
        const max = num.mul(num).sub(int(1)).toVar()
        const pos = uv.sub(0.5).mul(2).mul(iResolution.div(iResolution.y)).toVar()
        const ij = pos.add(1).mul(0.5).mul(n1f).add(0.5).floor().clamp(0, n1f).toVar()
        const id = uv2h(ij, step).clamp(int(0), max).toIVec2().add(ivec2(-1, 1)).clamp(int(0), max).toVar()
        const scale = (p: Vec2): Vec2 => p.div(n1f).mul(2).sub(1)
        const a = scale(h2uv(id.x, step)).toVar()
        const b = scale(ij).toVar()
        const c = scale(h2uv(id.y, step)).toVar()
        const d = segment(pos, a, b).min(segment(pos, b, c)).toVar()
        const t = float(1).div(iResolution.y).mul(1.5).pow(2).toVar()
        const idf = id.toFloat().div(max.toFloat()).toVar()
        const grad = vec3(0, 1, 1).mix(vec3(1, 1, 0), idf).toVar()
        const col = t.mul(2).smoothstep(t, d).mul(grad).oneMinus().toVar()
        return vec4(col, 1)
})

export default () => (
        <Layout noFooter>
                <div style={{ position: 'fixed', top: 60, left: 0, width: '100%', height: 'calc(100% - 60px)' }}>
                        <canvas ref={useGL({ fragment }).ref} />
                </div>
        </Layout>
)
