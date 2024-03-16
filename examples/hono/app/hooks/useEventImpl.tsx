import { createGL } from 'glre'
import createEvent from 'reev'
import { useOnce } from 'reev/react'
import { useEffect, useState } from 'react'
import { DELAYED_COMPILE_MS } from '../constants'
import type { EditorState } from '@codemirror/state'

type OnChangeEvent = React.ChangeEvent<HTMLTextAreaElement>

export interface EventType {
        gl: any
        error: Error | null
        onClean(): void
        onSuccess(gl: any): void
        onError(error: any): void
        onChangeTextarea: (e: EditorState) => void
        onChangeTextareaImpl: (e: EditorState) => void
        onChangeTitleInput(): void
        __listener?: () => void
}

const mountGL = (gl: any) => {
        gl.gl = gl.el.getContext('webgl2')
        gl.init()
        gl.resize()
        gl.frame.start()
        window.addEventListener('resize', gl.resize)
        gl.el.addEventListener('mousemove', gl.mousemove)
}

const cleanGL = (gl: any) => {
        if (!gl || gl.gl || !gl.pg) return
        gl.gl.deleteProgram?.(gl.pg)
        window.removeEventListener('resize', gl.resize)
}

const drawGL = (gl: any) => {
        gl.queue(() => {
                gl.clear()
                gl.viewport()
                gl.drawArrays()
        })
}

const createEventImpl = (override: Partial<EventType>) => {
        let listener = () => {}

        const onChangeTitleInput = (e: OnChangeEvent) => {
                console.log('HIHI')
        }

        const onChangeTextarea = (e: EditorState) => {
                listener()
                const id = setTimeout(
                        () => event.onChangeTextareaImpl(e),
                        DELAYED_COMPILE_MS
                )
                listener = () => clearTimeout(id)
        }

        const onChangeTextareaImpl = (e: EditorState) => {
                const gl = createGL({
                        // fs: e.target.value,
                        width: 540,
                        height: 400,
                })
                try {
                        gl.el = event.gl.el
                        cleanGL(event.gl)
                        mountGL(gl)
                        drawGL(gl)
                        event.onSuccess(gl)
                } catch (error) {
                        console.warn(error)
                        event.onError(error)
                }
        }

        const event = createEvent<EventType>({
                ...override,
                onChangeTitleInput,
                onChangeTextarea,
                onChangeTextareaImpl,
        })

        return event
}

export const useEventImpl = () => {
        const [, setError] = useState<Error | null>(null)
        const [gl, setGL] = useState(() =>
                createGL({ width: 128, height: 128 })
        )

        const event = useOnce(() => {
                const ret = createEventImpl({
                        onSuccess(gl) {
                                setError(null)
                                setGL((event.gl = gl))
                        },
                        onError(error) {
                                setError((event.error = error))
                        },
                })

                ret.gl = gl

                ret.gl.ref = (el: Element | null) => {
                        if (el) {
                                gl.el = el
                                mountGL(gl)
                                drawGL(gl)
                        } else {
                                cleanGL(gl)
                        }
                }

                return ret
        }) as unknown as EventType

        useEffect(() => {
                return event.onClean
        }, [])

        return event
}
