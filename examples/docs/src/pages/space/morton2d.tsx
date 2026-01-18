/**
 * ref: https://www.shadertoy.com/view/dtsczl
// Switch between methods of converting float -> uint
#define USE_NEW_MAPPING 0
uint Part1By1(uint x) {
        x &= 0x0000ffffu;                  // x = ---- ---- ---- ---- fedc ba98 7654 3210
        x = (x ^ (x <<  8)) & 0x00ff00ffu; // x = ---- ---- fedc ba98 ---- ---- 7654 3210
        x = (x ^ (x <<  4)) & 0x0f0f0f0fu; // x = ---- fedc ---- ba98 ---- 7654 ---- 3210
        x = (x ^ (x <<  2)) & 0x33333333u; // x = --fe --dc --ba --98 --76 --54 --32 --10
        x = (x ^ (x <<  1)) & 0x55555555u; // x = -f-e -d-c -b-a -9-8 -7-6 -5-4 -3-2 -1-0
        return x;
}
uint MortonCodeEncode2D(uint x, uint y) {
        return (Part1By1(y) << 1) + Part1By1(x);
}
uvec3 Float3ToUint3(vec3 v) {
        // Reinterpret value as uint
        uvec3 value_as_uint = uvec3(floatBitsToUint(v.x), floatBitsToUint(v.y), floatBitsToUint(v.z));
        // Invert sign bit of positives and whole of  to anegativesllow comparison as unsigned ints
        value_as_uint.x ^= (1u + ~(value_as_uint.x >> 31u) | 0x80000000u);
        value_as_uint.y ^= (1u + ~(value_as_uint.y >> 31u) | 0x80000000u);
        value_as_uint.z ^= (1u + ~(value_as_uint.z >> 31u) | 0x80000000u);
        return value_as_uint;
}
void mainImage(out vec4 fragColor, in vec2 fragCoord) {
        vec2 uv = fragCoord/iResolution.xy;
        //uv.x /= iResolution.y/iResolution.x;
        // Grid resolution to display
        const uint res = 1u << 5u;
        const uint res2 = res * res;
        const float fres = float(res);
        // Scaled uv
        vec3 vuv = vec3(uv * fres, 0.0);
        // Map floats to unsigned integers
        #if USE_NEW_MAPPING
        uvec3 uuv = Float3ToUint3(vuv);
        #else
        uvec3 uuv = uvec3(vuv);
        #endif
        // Find index on curve of pixel
        uint curveIndex = MortonCodeEncode2D(uuv.x, uuv.y) % res2;
        vec3 col = vec3(float(curveIndex) / float(res2));
        // Color one pixel so we can see the Z-order nature of the curve
        if (curveIndex == uint(iTime*3.) % res2)
        col = vec3(1.0, 0.0, 0.0);
        // Output to screen
        fragColor = vec4(col,1.0);
}
 */
import Layout from '@theme/Layout'
import { useGL } from 'glre/src/react'
import { Fn, Loop, Scope, float, int, iResolution, iTime, ivec2, uv, vec2, vec3, vec4 } from 'glre/src/node'
import type { Int, Vec2, Vec4 } from 'glre/src/node'

const MAX_LEVEL = 4

const mffff = int(0x0000ffff).constant()
const m00ff = int(0x00ff00ff).constant()
const m0f0f = int(0x0f0f0f0f).constant()
const m3333 = int(0x33333333).constant()
const m5555 = int(0x55555555).constant()

const ij2id = Fn(([ij]: [Vec2]): Int => {
        const p = ij.toIVec2().toVar()
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

const id2ij = Fn(([c]: [Int]): Vec2 => {
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
        return vec2(p)
})

const segment = Fn(([p, a, b]: [Vec2, Vec2, Vec2]) => {
        const q = vec4(p.sub(a), b.sub(a)).toVar()
        const d = q.xy.sub(q.zw.mul(q.xy.dot(q.zw).div(q.zw.dot(q.zw)).clamp(0, 1))).toVar()
        return d.dot(d)
})

export const fragment = Scope<Vec4>(() => {
        const level = int(iTime.mod(MAX_LEVEL).add(1)).toVar()
        const res = int(1).shiftLeft(level).toVar()
        const resm1f = res.sub(int(1)).toFloat().toVar()
        const max = ij2id(vec2(resm1f, resm1f)).toVar()
        const aspect = iResolution.x.div(iResolution.y).toVar()
        const p = uv.sub(0.5).mul(vec2(aspect, 1)).mul(2).toVar()
        const d = float(1e6).toVar()
        Loop(max, ({ i }) => {
                const a = id2ij(i).div(resm1f).mul(2).sub(1).toVar()
                const b = id2ij(int(1).add(i)).div(resm1f).mul(2).sub(1).toVar()
                d.assign(d.min(segment(p, a, b)))
        })
        const t = float(1).div(iResolution.y).mul(1.5).pow(2).toVar()
        const col = vec3(t.mul(2).smoothstep(t, d).oneMinus()).toVar()
        return vec4(col, 1)
})

export default () => (
        <Layout noFooter>
                <div style={{ position: 'fixed', top: 60, left: 0, width: '100%', height: 'calc(100% - 60px)' }}>
                        <canvas ref={useGL({ fragment }).ref} />
                </div>
        </Layout>
)
