import { Fn, iResolution, mat3, uniform, uv, vec2, vec3, vec4 } from 'glre/src/node'
import { createGL } from 'glre/src'
import { useEffect, useRef } from 'react'

const isWebGL = true

const createVideo = async () => {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false })
        const video = document.createElement('video')
        video.srcObject = stream
        await video.play()
        return video
}

const fragment = (video: HTMLVideoElement) => {
        const iTexture = uniform(video)
        const step = vec2(1).div(iResolution)
        const s = Fn(([uv, x, y]) => {
                const offset = vec2(x, y).mul(step).add(uv)
                return iTexture.texture(offset).r
        })
        const matDot = Fn(([a, b]) => {
                return a[0].dot(b[0]).add(a[1].dot(b[1])).add(a[2].dot(b[2]))
        })
        const sample = mat3(s(uv, -1, -1), s(uv, 0, -1), s(uv, 1, -1), s(uv, -1, 0), s(uv, 0, 0), s(uv, 1, 0), s(uv, -1, 1), s(uv, 0, 1), s(uv, 1, 1))
        const sobelX = mat3(-1, 0, 1, -2, 0, 2, -1, 0, 1).constant()
        const sobelY = mat3(-1, -2, -1, 0, 0, 0, 1, 2, 1).constant()
        const gx = matDot(sample, sobelX)
        const gy = matDot(sample, sobelY)
        const edge = vec2(gx, gy).length().oneMinus().sqrt()
        return vec4(vec3(edge), 1)
}

export default function Canvas() {
        const ref = useRef<HTMLCanvasElement>(null!)

        const startCamera = async () => {
                if (!ref.current) return
                const video = await createVideo()
                const frag = fragment(video)
                const el = ref.current
                const gl = createGL({ el, frag, isWebGL })
                gl.uniform('videoSize', [video.videoWidth, video.videoHeight])
                gl.mount()
        }

        useEffect(() => {
                startCamera()
        }, [])

        return <canvas ref={ref} style={{ top: 0, left: 0, position: 'fixed' }} />
}
