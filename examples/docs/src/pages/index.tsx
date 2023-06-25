import React from 'react'
import Head from '@docusaurus/Head'
import Layout from '@theme/Layout'
import StatsImpl from 'stats.js'
// import { useControls } from 'leva'
import { range, makePriority } from '../../helpers'
import useBaseUrl from '@docusaurus/useBaseUrl'
// import { useColorMode } from '@docusaurus/theme-common';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext'
import { useGL, useTexture, useFrame, useUniform } from 'glre/react'

const WINDOW_DELAY_MS = 500

export default function Home() {
        const { siteConfig } = useDocusaurusContext()
        return (
                <Layout noFooter>
                        <Head>
                                <title>
                                        {siteConfig.title}{' '}
                                        {siteConfig.titleDelimiter}{' '}
                                        {siteConfig.tagline}
                                </title>
                                <style>
                                        @import
                                        url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');
                                </style>
                        </Head>
                        <Canvas
                                style={{
                                        top: 0,
                                        left: 0,
                                        position: 'fixed',
                                        zIndex: -1,
                                }}
                        />
                </Layout>
        )
}

function useLevaUniform() {
        return useUniform(
                // useControls(
                {
                        imageSize: 0.8,
                        riverBankHeight: 0.01,
                        holeDiameter: 0.1,
                        shaftDiameter: 0.2,
                        spongeScale: 16,
                        windowThreshold: 0.75,
                        blueColorWeight: 0.04,
                        windowShaftWeight: 0.1,
                        reflectionUVWeight: 0.01,
                        reflectionPWeight: 0.1,
                        moonHeight: 2.6,
                        moonRadius: 0.59,
                }
                // )
        )
}

function Canvas() {
        const gl = useGL({ frag })
        console.log({ ...gl })
        setTimeout(() => {
                console.log({ ...gl })
        }, 1000)

        useFrame(() => {
                gl.clear()
                gl.viewport()
                gl.drawArrays()
                return true
        })

        useUniform({
                focal: 5000,
                eye: [0, 0, -100],
                up: [0, -1, 0],
                focus: [0, 0, 0],
                baseColor: [48 / 256, 43 / 256, 49 / 256, 1],
                lightColor: [1, 185 / 255, 0, 1],
                topSkyColor: [5 / 255, 6 / 255, 7 / 255, 1],
                btmSkyColor: [44 / 255, 45 / 255, 47 / 255, 1],
                topSeaColor: [21 / 255, 22 / 255, 27 / 255, 1],
                btmSeaColor: [26 / 255, 31 / 255, 42 / 255, 1],
        })

        useTexture({ GLRE: useBaseUrl('/img/GLRE.webp') })

        // useStats();

        useLevaUniform()

        useFrame(() => {
                range(8).forEach((i) => gl.uniform(`windowLightWeight${i}`, 1))
                const memo = [1, 1, 1, 1, 1, 1, 1]
                const priority = makePriority()
                gl('mousemove', () => {
                        if (Math.abs(gl.mouse[1]) > 0.5) return
                        const i = ((gl.mouse[0] + 1) * 4) << 0 // 0 ~ 7
                        if (memo[i] == 0) return
                        gl.uniform(`windowLightWeight${i}`, (memo[i] = 0))
                        priority.then(async () => {
                                await new Promise((_) =>
                                        setTimeout(_, WINDOW_DELAY_MS)
                                )
                                gl.uniform(`windowLightWeight${i}`, 1)
                                memo[i] = 1
                        }, i)
                })
        })

        return (
                <canvas
                        ref={gl.ref}
                        style={{
                                top: 0,
                                left: 0,
                                position: 'fixed',
                                background: '#212121',
                        }}
                />
        )
}

export function useStats() {
        const stats = React.useMemo(() => new StatsImpl(), [])
        React.useEffect(() => {
                stats.showPanel(0)
                stats.domElement.style.cssText =
                        'position:absolute;bottom:0px;left:0px;'
                document.body.appendChild(stats.dom)
                return () => document.body.removeChild(stats.dom)
        }, [stats])

        useFrame(() => {
                stats.end()
                stats.begin()
                return true
        })
}

// ref: https://qiita.com/aa_debdeb/items/bffe5b7a33f5bf65d25b
const de = `
vec3 trans(vec3 p, float scale) { return 1. - scale * abs(mod(p, holeDiameter * 2.) - holeDiameter); }
float boxSDF(vec3 p, float scale) { return length(max(abs(p) - vec3(scale), 0.)); }
float crossSDF(vec3 p, float width) {
        p = abs(p);
        float dxy = max(p.x, p.y);
        float dyz = max(p.y, p.z);
        float dxz = max(p.x, p.z);
        return min(dxy, min(dyz, dxz)) - width;
}

float de(vec3 p, vec4 color, float building, float scale, float width) {
        float d = boxSDF(p, scale);
        vec3 r = trans(p, scale);
        float c = crossSDF(r, width) / scale;
        return max(d, max(c, min(building, 1. - length(color))));
}
`

// Building skyline ref: https://www.shadertoy.com/view/tt3GRN
const buildings = `
float buildings(vec2 uv) {
        float b =         .1 * F(cos(uv.x * 4. + 1.7), 1.);
        b += (b + .3)  * 0.3 * F(cos(uv.x * 4. - .1 ), 2.);
        b += (b - .01) * 0.1 * F(cos(uv.x * 12.     ), 4.);
        b += (b - .05) * 0.3 * F(cos(uv.x * 24.     ), 1.);
        return C((uv.y + b - .1) * 100.);
}
`

// Array and textureless GLSL 2D/3D/4D simplex noise functions by Ian McEwan, Ashima Arts.
const fbm = `
vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 permute(vec4 x) { return mod289(((x * 34.0) + 10.0) * x); }
vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

float snoise(vec3 v) {
        const vec2 C = vec2(1.0 / 6.0, 1.0 / 3.0);
        const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);

        // First corner
        vec3 i = floor(v + dot(v, C.yyy));
        vec3 x0 = v - i + dot(i, C.xxx);

        // Other corners
        vec3 g = step(x0.yzx, x0.xyz);
        vec3 l = 1.0 - g;
        vec3 i1 = min(g.xyz, l.zxy);
        vec3 i2 = max(g.xyz, l.zxy);

        vec3 x1 = x0 - i1 + C.xxx;
        vec3 x2 = x0 - i2 + C.yyy; // 2.0*C.x = 1/3 = C.y
        vec3 x3 = x0 - D.yyy;      // -1.0+3.0*C.x = -0.5 = -D.y

        // Permutations
        i = mod289(i);
        vec4 p = permute(permute(permute(i.z + vec4(0.0, i1.z, i2.z, 1.0))
                + i.y + vec4(0.0, i1.y, i2.y, 1.0))
                + i.x + vec4(0.0, i1.x, i2.x, 1.0));

        // Gradients: 7x7 points over a square, mapped onto an octahedron.
        // The ring size 17*17 = 289 is close to a multiple of 49 (49*6 = 294)
        float n_ = 0.142857142857; // 1.0/7.0
        vec3 ns = n_ * D.wyz - D.xzx;

        vec4 j = p - 49.0 * floor(p * ns.z * ns.z);  //  mod(p,7*7)

        vec4 x_ = floor(j * ns.z);
        vec4 y_ = floor(j - 7.0 * x_);    // mod(j,N)

        vec4 x = x_ * ns.x + ns.yyyy;
        vec4 y = y_ * ns.x + ns.yyyy;
        vec4 h = 1.0 - abs(x) - abs(y);

        vec4 b0 = vec4(x.xy, y.xy);
        vec4 b1 = vec4(x.zw, y.zw);

        vec4 s0 = floor(b0) * 2.0 + 1.0;
        vec4 s1 = floor(b1) * 2.0 + 1.0;
        vec4 sh = -step(h, vec4(0.0));

        vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
        vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;

        vec3 p0 = vec3(a0.xy, h.x);
        vec3 p1 = vec3(a0.zw, h.y);
        vec3 p2 = vec3(a1.xy, h.z);
        vec3 p3 = vec3(a1.zw, h.w);

        //Normalise gradients
        vec4 norm = taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
        p0 *= norm.x;
        p1 *= norm.y;
        p2 *= norm.z;
        p3 *= norm.w;

        // Mix final noise value
        vec4 m = max(0.5 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);
        m = m * m;
        return 105.0 * dot(m * m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));
}

float snoise01(vec3 v) { return 0.5 * (1.0 + snoise(v)); }

float fbm(vec2 st) {
        float v = 0.0, a = 0.65;
        for(int i = 0; i < NUM_OCTAVES; i++) {
                v += a * snoise01(vec3(st.x, st.y, 0.1 * iTime));
                st = st * 2.0;
                a *= 0.5;
        }
        return v;
}
`

const frag = `
precision mediump float;

// Uniforms
uniform float focal;
uniform float iTime;
uniform vec2 iMouse;
uniform vec2 iResolution;
uniform vec3 up;
uniform vec3 eye;
uniform vec3 focus;
uniform vec4 topSkyColor;
uniform vec4 btmSkyColor;
uniform vec4 topSeaColor;
uniform vec4 btmSeaColor;
uniform sampler2D FBM;
uniform sampler2D GLRE;
uniform float windowLightWeight0;
uniform float windowLightWeight1;
uniform float windowLightWeight2;
uniform float windowLightWeight3;
uniform float windowLightWeight4;
uniform float windowLightWeight5;
uniform float windowLightWeight6;
uniform float windowLightWeight7;

// Uniforms from leva
uniform float holeDiameter;
uniform float spongeScale;
uniform float shaftDiameter;
uniform float imageSize;
uniform float windowThreshold;
uniform float riverBankHeight;
uniform float blueColorWeight;
uniform float windowShaftWeight;
uniform float reflectionUVWeight;
uniform float reflectionPWeight;
uniform float moonHeight;
uniform float moonRadius;
uniform vec4 baseColor;
uniform vec4 lightColor;

// Helper macros
#define ITERATIONS 8
#define NUM_OCTAVES 4
#define C(x) clamp(x, 0., 1.)
#define F(x, f) floor(x * f) / f
#define S(a, b, x) smoothstep(a, b, x)

${buildings}
${fbm}
${de}

float moon(vec3 p, vec3 pos, float r) {
        return min(length(p - pos) - r, length(p + pos) - r);
}

void main() {
        // Setup ray
        vec3 look = normalize(focus - eye);
        vec3 right = normalize(cross(look, up));
        vec2 scr = gl_FragCoord.xy - 0.5 * iResolution; // -X ~ X
        vec3 dir = normalize(focal * look + scr.x * right + scr.y * up);

        // Ray marching
        vec3 p = eye + dir;
        vec3 e = vec3(0.0005, 0., 0.);
        float d = de(p, vec4(1.), 1., spongeScale, shaftDiameter);

        // GLRE text
        vec2 uv = 2. * scr / max(iResolution.y, iResolution.x); // -1 ~ 1
        float noise = fbm(uv * 0.5 + 1.);
        vec2 textureUV = uv / imageSize + 0.5;
        vec4 textureColor = texture2D(GLRE, textureUV);

        // River bank
        if (abs(uv.y) < riverBankHeight) {
                gl_FragColor = mix(btmSkyColor, topSeaColor, 1. - (uv.y + riverBankHeight));
                return;
        }

        // Reflection
        vec2 deltaRay = vec2(cos(uv.y * 192. - iTime), sin(uv.y * 96. + iTime));
        if (uv.y < 0.) {
                uv += deltaRay * reflectionUVWeight * uv.y / noise;
                p.xy += deltaRay * reflectionPWeight * uv.y / noise;
        }

        // Buildings
        vec2 buildingsUV = vec2(uv.x, abs(uv.y));
        float building = buildings(buildingsUV);

        float diameter = shaftDiameter * windowShaftWeight * noise;
        float windowLightWeight = 0.;
             if (uv.x < -3. / 4.) windowLightWeight = windowLightWeight0;
        else if (uv.x < -2. / 4.) windowLightWeight = windowLightWeight1;
        else if (uv.x < -1. / 4.) windowLightWeight = windowLightWeight2;
        else if (uv.x <  0. / 4.) windowLightWeight = windowLightWeight3;
        else if (uv.x <  1. / 4.) windowLightWeight = windowLightWeight4;
        else if (uv.x <  2. / 4.) windowLightWeight = windowLightWeight5;
        else if (uv.x <  3. / 4.) windowLightWeight = windowLightWeight6;
        else if (uv.x <  4. / 4.) windowLightWeight = windowLightWeight7;

        for (int i = 0; i < ITERATIONS; i++) {
                p = p + d * dir;
                d = de(p, textureColor, building, spongeScale, shaftDiameter);
                if(d <= e.x) {
                        gl_FragColor = max(baseColor, textureColor) * windowLightWeight;
                        return;
                }
        }

        for (int i = 0; i < ITERATIONS; i++) {
                p = p + d * dir;
                d = de(p, textureColor, building, spongeScale, diameter);
                if(d <= e.x) {
                        gl_FragColor = max(lightColor * noise, textureColor) * windowLightWeight;
                        return;
                }
        }

        for (int i = 0; i < ITERATIONS; i++) {
                p = p + d * dir;
                d = de(p, textureColor, building, spongeScale, diameter);
                if(d <= e.x) {
                        gl_FragColor = max(lightColor * noise, textureColor) * windowLightWeight;
                        return;
                }
        }

        p = eye + dir;
        d = de(p, vec4(1.), 1., spongeScale, shaftDiameter);
        vec3 moonPos = vec3(0., moonHeight, 0.);
        vec3 lightPos = vec3(-iMouse.x * eye.z, 0., 1.);
        if (uv.y < 0.) {
                p.xy += deltaRay * reflectionPWeight * uv.y / noise;
        }

        if (building > 0.)
                for (int i = 0; i < ITERATIONS; i++) {
                        p = p + d * dir;
                        d = moon(p, moonPos, moonRadius);
                        if(d <= e.x) {
                                vec3 norm = normalize(vec3(
                                        moon(p + e.xyy, moonPos, moonRadius) - d,
                                        moon(p + e.yxx, moonPos, moonRadius) - d,
                                        moon(p + e.yyx, moonPos, moonRadius) - d
                                ));
                                float lighting = dot(normalize(eye + lightPos), norm);
                                gl_FragColor = lightColor * lighting / noise;
                                return;
                        }
                }

        // Sky color
        if (uv.y < 0.) {
                gl_FragColor = mix(topSkyColor, btmSkyColor, -uv.y);
                gl_FragColor += vec4(vec3(pow(noise, 4.)) * 0.05, 1.);
        } else {
                gl_FragColor = mix(topSeaColor, btmSeaColor, uv.y);
                gl_FragColor += vec4(vec3(pow(noise, 4.)) * 0.25, 1.);
        }
        gl_FragColor.b += abs(uv.y) * blueColorWeight;
}
`.trim()

const _G = `
_ _ # # # # #
_ # # _ _ _ _
# # _ _ _ _ _
# # _ _ # # #
# # _ _ _ # #
_ # # _ _ # #
_ _ # # # # #
`

const _L = `
# # _ _ _ _ _
# # _ _ _ _ _
# # _ _ _ _ _
# # _ _ _ _ _
# # _ _ _ _ _
# # _ _ _ _ _
# # # # # # #
`

const _R = `
# # # # # # _
# # _ _ _ # #
# # _ _ _ # #
# # _ _ # # #
# # # # # _ _
# # _ # # # _
# # _ _ # # #
`
const _E = `
# # # # # # #
# # _ _ _ _ _
# # _ _ _ _ _
# # # # # # _
# # _ _ _ _ _
# # _ _ _ _ _
# # # # # # #
`

console.log(_G)
console.log(_L)
console.log(_R)
console.log(_E)
