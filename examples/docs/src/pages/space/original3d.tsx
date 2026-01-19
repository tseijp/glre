import Layout from '@theme/Layout'
import { useGL } from 'glre/src/react'
import { Fn, Scope, float, int, iMouse, iResolution, ivec2, ivec3, uv, vec2, vec3, vec4 } from 'glre/src/node'
import type { Int, Vec2, Vec4 } from 'glre/src/node'

const URL = 'https://pub-a3916cfad25545dc917e91549e7296bc.r2.dev/v3/78_76.png'

const fragment = Scope(() => {
        return vec4(1, 0, 0, 1)
})

export default () => (
        <Layout noFooter>
                <div style={{ position: 'fixed', top: 60, left: 0, width: '100%', height: 'calc(100% - 60px)' }}>
                        <canvas ref={useGL({ fragment }).ref} />
                </div>
        </Layout>
)
