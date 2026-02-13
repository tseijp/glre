import Layout from '@theme/Layout'
import { useGL } from 'glre/src/react'
import { iDrag, iResolution, instance, varying, vec3, vec4 } from 'glre/src/node'
import { box, torus, sphere } from 'glre/src/buffers'
import { rotate4dX, rotate4dY, perspective, translate4d } from 'glre/src/addons'
import type { Vec3 } from 'glre/src/node'

export default function WebGLInstancing() {
        const instanceCount = 200
        const aspect = iResolution.x.div(iResolution.y)
        const rot = rotate4dX(iDrag.y).mul(rotate4dY(iDrag.x))
        const mvp = perspective(1.0, aspect, 0.1, 100).mul(translate4d(0, 0, -1)).mul(rot)
        const view = (v: Vec3) => mvp.mul(vec4(v, 1))
        const rand = (a = -0.5, b = 0.5) => (b - a) * Math.random() + a
        const geo1 = box({ width: 0.08, height: 0.08, depth: 0.08 })
        const geo2 = sphere({ radius: 0.05 })
        const geo3 = torus({ radius: 0.04, tube: 0.015 })
        const pos1 = instance(vec3(), 'pos1')
        const pos2 = instance(vec3(), 'pos2')
        const pos3 = instance(vec3(), 'pos3')
        const _pos = () => {
                const pos = []
                for (let i = 0; i < instanceCount; i++) pos.push(rand(), rand(), rand())
                return pos
        }
        const gl = useGL(
                {
                        isWebGL: true,
                        isDepth: true,
                        instanceCount,
                        count: geo1.count,
                        vertex: view(geo1.vertex('vertex1').add(pos1)),
                        fragment: vec4(varying(geo1.normal('normal1')), 1),
                        instances: { pos1: null },
                        attributes: { vertex1: null, normal1: null },
                        mount() {
                                pos1.value = _pos()
                        },
                },
                {
                        instanceCount,
                        count: geo2.count,
                        vertex: view(geo2.vertex('vertex2').add(pos2)),
                        fragment: vec4(varying(geo2.normal('normal2')), 1),
                        instances: { pos2: null },
                        attributes: { vertex2: null, normal2: null },
                        mount() {
                                pos2.value = _pos()
                        },
                },
                {
                        instanceCount,
                        count: geo3.count,
                        vertex: view(geo3.vertex('vertex3').add(pos3)),
                        fragment: vec4(varying(geo3.normal('normal3')), 1),
                        instances: { pos3: null },
                        attributes: { vertex3: null, normal3: null },
                        mount() {
                                pos3.value = _pos()
                        },
                }
        )
        return (
                <Layout noFooter>
                        <div style={{ position: 'fixed', top: 60, left: 0, width: '100%', height: 'calc(100% - 60px)' }}>
                                <canvas ref={gl.ref} />
                        </div>
                </Layout>
        )
}
