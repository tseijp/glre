import React from 'react'
import Head from '@docusaurus/Head'
import Layout from '@theme/Layout'
import { useGL, useFrame, useUniform } from '@glre/react'
import { useColorMode } from '@docusaurus/theme-common';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext'

export default function Home() {
        const { siteConfig } = useDocusaurusContext();
        return (
          <Layout noFooter>
            <Head>
              <title>
                {siteConfig.title} {siteConfig.titleDelimiter} {siteConfig.tagline}
              </title>
              <style>
                @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');
              </style>
            </Head>
            <main style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: "'Press Start 2P', cursive"
            }}>
              <Canvas style={{ top: 0, left: 0, position: 'fixed', zIndex: -1 }}/>
              <Text />
            </main>
          </Layout>
        );
}

const _G = `
_ _ # # # # #
_ # # _ _ _ _
# # _ _ _ _ _
# # _ _ # # #
# # _ _ _ # #
_ # # _ _ # #
_ _ # # # # #
`;

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

function Canvas (props: any) {
        const isDarkTheme = useColorMode().colorMode === "dark";
        const gl = useGL({ float: "mediump"})`
          uniform float focal;
          uniform vec2 iMouse;
          uniform vec2 iResolution;
          uniform vec3 up;
          uniform vec3 eye;
          uniform vec3 focus;
          uniform vec3 color;

          float boxSDF(vec3 p, float side) {
            vec3 q = abs(p);
            return length(max(q - vec3(side), 0.0));
          }

          float crossSDF(vec3 p, float c) {
              p = abs(p);
              float dxy = max(p.x, p.y);
              float dyz = max(p.y, p.z);
              float dxz = max(p.x, p.z);
              return min(dxy, min(dyz, dxz)) - c;
          }

          // ref: https://qiita.com/aa_debdeb/items/bffe5b7a33f5bf65d25b

          float deMengerSponge1(vec3 p, float scale, float width) {
              float d = boxSDF(p, scale);
              vec3 a = mod(p, 2.0) - 1.0;
              vec3 r = 1.0 - scale * abs(a);
              float c = crossSDF(r, width) / scale;
              d = max(d, c);
              return d;
          }

          float de(vec3 p) {
              float x = - abs(iMouse.x) * 16.;
              float y = - 16. * iMouse.y;
              return deMengerSponge1(p, 32.0 + x, 16. + x * 0.5 + y * 0.5);
          }

          void main() {
            // Setup ray
            vec3 look = normalize(focus - eye);
            vec3 right = normalize(cross(look, up));
            vec2 scr = gl_FragCoord.xy - 0.5 * iResolution;
            vec3 dir = normalize(focal * look + scr.x * right + scr.y * up);

            // Ray marching
            vec3 p = eye + dir;
            vec3 e = vec3(0.0005, 0.0, 0.0);
            float d = de(p);

            for (int i = 0; i < 256; i++) {
              if(d <= e.x) {
                float x = de(p + e.xyy) - d;
                float y = de(p + e.yxx) - d;
                float z = de(p + e.yyx) - d;
                float lighting = dot(normalize(eye), normalize(vec3(x, y, z)));
                gl_FragColor = vec4(color, 1.0) * lighting;
                return;
              }
              p = p + d * dir;
              d = de(p);
            }
            gl_FragColor = vec4(color * 2., 1.0);
          }
        `

        useFrame(() => {
                gl.clear()
                gl.viewport()
                gl.drawArrays()
                return true
        })

        useFrame(() => {
                const now = performance.now() / 1000 / 100
                const x = 32.8 * Math.cos(now)
                const z = 32.8 * Math.sin(now)
                gl.setUniform({ eye: [x, 0, z] })
                return true
        })

        useUniform({
                focal: 500,
                up: [0, 1, 0],
                focus: [0, 0, 0],
                color: isDarkTheme
                    ? [0, 0, 0]
                    : [117 / 255, 117 / 255, 117 / 255] // rgb(117,117,117)
        })

        return <canvas id={gl.id} {...props} />
}

const Text = () => {
        const isDarkTheme = useColorMode().colorMode === "dark"
        const color = isDarkTheme ? "#fff" : "#212121"
        return (
          <div style={{
            display: "flex",
            fontSize: "1.5rem",
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "column",
          }}>
            <h1 style={{
              color,
              marginTop: "5rem",
              fontSize: "5rem",
              fontFamily: "'Press Start 2P', cursive",
            }}>GLRE</h1>
            <div style={{ color, fontSize: "2.5rem" }}>GLSL Reactive Engine</div>
            <div style={{
              display: "flex",
              fontSize: "1.5rem",
              alignItems: "center",
              justifyContent: "center",
              flexDirection: "row",
              marginTop: "2rem",
              gap: "1rem",
            }}>
              <a style={{ color }} href="/docs">Getting started</a>
              <a style={{ color: "rgb(255,185,0)"  }} href="https://codesandbox.io/s/glre-test3-ntlk3l" target="_blank">Try demo</a>
            </div>
          </div>
        )
}