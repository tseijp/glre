import type { GL } from 'glre/src'

export const orbit = (gl: GL, { y = 0, r = 50, key = 'eye' } = {}) => {
        const t = performance.now() / 5000
        const x = r * Math.cos(t)
        const z = r * Math.sin(t)
        gl.uniform({ [key]: [x, y, z] })
}

export const resize = (gl: GL) => {
        const { innerWidth: W, innerHeight: H } = window
        let { clientWidth: w } = gl.el.parentNode
        let a = W / H
        a = Math.min(a, 1)
        w = Math.min(640, w)
        gl.size[0] = gl.el.width = w
        gl.size[1] = gl.el.height = w / a
}
