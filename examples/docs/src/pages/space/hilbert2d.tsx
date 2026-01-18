/**
 * REF: https://www.shadertoy.com/view/3tl3zl
// The MIT License
// Copyright © 2019 J. M.
// Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions: The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software. THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
// Display a Hilbert curve (https://en.wikipedia.org/wiki/Hilbert_curve)
// Skilling's algorithm, https://doi.org/10.1063/1.1751381 and https://doi.org/10.1063/1.1751382
// see also http://www.inference.org.uk/bayesys/test/id2xy.c and compare with https://www.shadertoy.com/view/tlf3zX

vec2 id2xy(in int k, in int s) {
        int bb = 1 << s, b = bb;
        ivec2 t = ivec2(k ^ (k >> 1)), hp = ivec2(0);
        for(int j = s - 1; j >= 0; j--) {
                b >>= 1;
                hp += (t >> ivec2(j + 1, j)) & b;
        }
        for(int p = 2; p < bb; p <<= 1) {
                int q = p - 1;
                if((hp.y & p) != 0) hp.x ^= q;
                else hp ^= (hp.x ^ hp.y) & q;
                if((hp.x & p) != 0) hp.x ^= q;
        }
        return 2.0 * (vec2(hp)/float(bb - 1)) - 1.0;
}

// from Inigo Quilez, https://www.shadertoy.com/view/Xlf3zl
float segment(in vec2 p, in vec2 a, in vec2 b) {
        vec2 pa = p - a, ba = b - a;
        vec2  d = pa - ba * clamp(dot(pa, ba)/dot(ba, ba), 0.0, 1.0);
        return dot(d, d);
}

float sdPointSq(in vec2 p, in vec2 a) {
        vec2 d = p - a;
        return dot(d, d);
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
        float e = 1.0/iResolution.y;
        vec2 aspect = iResolution.xy * e;
        vec2 p = 2.2 * fragCoord.xy * e - 1.1 * aspect;
        vec3 col = vec3(0.992, 0.965, 0.89);
        int s = (int(floor(0.2 * iTime)) % 5) + 1; // stage of Hilbert curve construction
        int NUM = (1 << (2 * s)) - 1;
        vec2 d = vec2(9.0);
        vec2 a = vec2(id2xy(0, s)), b = a;
        for(int i = 0; i < NUM; i++) {
                b = vec2(id2xy(i + 1, s));
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
import { Fn, If, Loop, float, int, iResolution, iTime, position, Scope, vec2, vec3, vec4 } from 'glre/src/node'
import type { Int, Vec2, Vec4 } from 'glre/src/node'

const MAX_STEPS = 10

const rot = (x: Int, y: Int, rx: Int, ry: Int, side: Int) => {
        If(ry.equal(int(0)), () => {
                If(rx.equal(int(1)), () => {
                        const s = side.sub(int(1)).toVar('s')
                        x.assign(s.sub(x))
                        y.assign(s.sub(y))
                })
                const px = x.toVar()
                x.assign(y)
                y.assign(px)
        })
}

const xy2id = Fn(([xIn, yIn, step]: [Int, Int, Int]) => {
        const x = xIn.toVar('x')
        const y = yIn.toVar('y')
        const d = int(0).toVar('d')
        const bit = step.sub(int(1)).toVar('bit')
        const side = int(1).shiftLeft(bit).toVar('side')
        Loop(step, () => {
                const rx = x.shiftRight(bit).bitAnd(int(1)).toVar('rx')
                const ry = y.shiftRight(bit).bitAnd(int(1)).toVar('ry')
                d.addAssign(side.mul(side).mul(rx.mul(int(3)).bitXor(ry)))
                rot(x, y, rx, ry, side)
                side.shiftRightAssign(int(1))
                bit.subAssign(int(1))
        })
        return d
})

const id2xy = Fn(([k, step]: [Int, Int]) => {
        const t = k.toVar('t')
        const x = int(0).toVar('x')
        const y = int(0).toVar('y')
        const side = int(1).toVar('side')
        Loop(step, () => {
                const rx = t.shiftRight(int(1)).bitAnd(int(1)).toVar('rx')
                const ry = t.bitXor(rx).bitAnd(int(1)).toVar('ry')
                rot(x, y, rx, ry, side)
                x.addAssign(side.mul(rx))
                y.addAssign(side.mul(ry))
                t.shiftRightAssign(int(2))
                side.shiftLeftAssign(int(1))
        })
        return vec2(x, y)
})

const segment = Fn(([p, a, b]: [Vec2, Vec2, Vec2]) => {
        const pa = p.sub(a).toVar('pa')
        const ba = b.sub(a).toVar('ba')
        const d = pa.sub(ba.mul(pa.dot(ba).div(ba.dot(ba)).clamp(0, 1))).toVar('d')
        return d.dot(d)
})

export const fragment = Scope<Vec4>(() => {
        const e = float(1).div(iResolution.y).toVar('e')
        const p = position.xy.mul(e).mul(3).sub(iResolution.xy.mul(e).mul(1.5)).toVar('p')
        const stage = int(iTime.mod(MAX_STEPS).add(1)).toVar('stage')
        const n = int(1).shiftLeft(stage).toVar('n')
        const n1 = n.sub(int(1)).toVar('n1')
        const n1f = n1.toFloat().toVar('n1f')
        const grid = p.add(1).mul(0.5).mul(n1f).toVar('grid')
        const maxK = n.mul(n).sub(int(1)).toVar('maxK')
        const gridX = grid.x.add(0.5).floor().toInt().clamp(int(0), n1).toVar('gridX')
        const gridY = grid.y.add(0.5).floor().toInt().clamp(int(0), n1).toVar('gridY')
        const k = xy2id(gridX, gridY, stage).clamp(int(0), maxK).toVar('k')
        const b = vec2(gridX.toFloat(), gridY.toFloat()).div(n1f).mul(2).sub(1).toVar('b')
        const kPrev = k.sub(int(1)).clamp(int(0), maxK)
        const kNext = k.add(int(1)).clamp(int(0), maxK)
        const prev = id2xy(kPrev, stage)
        const next = id2xy(kNext, stage)
        const minDist = segment(p, prev.div(n1f).mul(2).sub(1), b).min(segment(p, b, next.div(n1f).mul(2).sub(1)))
        const t2 = e.mul(1.5).pow(2).toVar('t2')
        const line = t2.smoothstep(t2.mul(2), minDist).oneMinus()
        return vec4(vec3(1, 1, 1).mix(vec3(0, 0, 0), line), 1)
})

export default () => {
        const gl = useGL({ fragment })
        return (
                <Layout noFooter>
                        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%' }}>
                                <canvas ref={gl.ref} />
                        </div>
                </Layout>
        )
}
