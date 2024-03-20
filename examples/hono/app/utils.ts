export const resizeGL = (gl: any) => {
        gl.size = [gl.el.width, gl.el.height]
        gl.uniform('iResolution', gl.size)
}

let ctx = null as any

export const mountGL = (gl: any) => {
        gl.gl = ctx ?? gl.el.getContext('webgl2', { premultipliedAlpha: false })
        gl.init()
        gl.frame.start()
        gl._resize = () => resizeGL(gl)
        window.addEventListener('resize', gl._resize)
        gl.el.addEventListener('mousemove', gl.mousemove)
}

export const cleanGL = (gl: any) => {
        gl.frame.stop()
        gl.gl?.deleteProgram?.(gl.pg)
        window.removeEventListener('resize', gl._resize)
}

export const drawGL = (gl: any) => {
        gl.queue(() => {
                gl.clear()
                gl.viewport()
                gl.drawArrays()
        })
}
