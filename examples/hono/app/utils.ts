export const DELAYED_COMPILE_MS = 1000

export const DEFAULT_CREATION_TITLE = 'HELLO WORLD'

export const DEFAULT_CREATION_CONTENT = `
precision highp float;
uniform vec2 iResolution;

void main() {
  vec2 uv = fract(gl_FragCoord.xy / iResolution);
  gl_FragColor = vec4(uv, 0.0, 1.0);
}
`.trim()

export const resizeGL = (gl: any) => {
        gl.size = [gl.el.width, gl.el.height]
        gl.uniform('iResolution', gl.size)
}

let ctx = null as any

export const mountGL = (gl: any) => {
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

export const createCreation = (title: string, content: string) => {
        return fetch('/new', {
                method: 'POST',
                headers: {
                        'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                        title,
                        content,
                }),
        })
}

export const updateCreation = (id: string, title: string, content: string) => {
        return fetch(`/hono/${id}`, {
                method: 'PUT',
                headers: {
                        'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                        title,
                        content,
                }),
        })
}

export const deleteCreation = (id: string) => {
        return fetch(`/hono/${id}`, {
                method: 'DELETE',
        })
}

/**
 * my created
 */
// eslint-disable-next-line
const REG = /\"|\;|\s/g

const cache = new Map<string, Promise<string>>()

export const resolve = async (lines: string | string[]) => {
        const set = new Set<string>()

        if (!Array.isArray(lines)) lines = lines.split(/\r?\n/)

        const response = await Promise.all(
                lines.map(async (line) => {
                        const line_trim = line.trim()
                        if (line_trim.startsWith('#include "lygia')) {
                                let url = line_trim.substring(15)
                                url = 'https://lygia.xyz' + url.replace(REG, '')

                                // once only
                                if (set.has(url)) return
                                set.add(url)

                                // cache hit
                                if (cache.has(url)) return cache.get(url)
                                // if (localStorage.getItem(url)) return localStorage.getItem(url)

                                return fetch(url).then((res) => {
                                        const text = res.text()
                                        cache.set(url, text)
                                        // localStorage.setItem(url, text + "")
                                        return text
                                })
                        } else return line
                })
        )

        return response.join('\n')
}
