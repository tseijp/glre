export const resizeGL = (gl: any) => {
        const gap = 48
        let height = window.innerHeight - gap
        let width = window.innerWidth - gap
        width = Math.min((height / 1280) * 800, width)
        Object.assign(gl, { width, height })
}

let ctx = null as any

export const mountGL = (gl: any) => {
        gl.gl = ctx ?? gl.el.getContext('webgl2')
        gl.init()
        gl.resize()
        gl.frame.start()
        gl({ resize: () => resizeGL(gl) })
        window.addEventListener('resize', gl.resize)
        gl.el.addEventListener('mousemove', gl.mousemove)
}

export const cleanGL = (gl: any) => {
        gl.frame.stop()
        gl.gl.deleteProgram?.(gl.pg)
        window.removeEventListener('resize', gl.resize)
}

export const drawGL = (gl: any) => {
        gl.queue(() => {
                gl.clear()
                gl.viewport()
                gl.drawArrays()
        })
}
