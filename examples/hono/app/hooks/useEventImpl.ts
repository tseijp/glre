import { createGL, GL } from 'glre'
import createEvent from 'reev'
import { useOnce } from 'reev/react'
import { useEffect, useState } from 'react'
import { DELAYED_COMPILE_MS } from '../constants'
import { drawGL, mountGL, cleanGL, resizeGL } from '../utils'
import type { EditorState } from '@codemirror/state'

type OnChangeEvent = React.ChangeEvent<HTMLTextAreaElement>

export interface EventType {
        gl: GL
        error: Error | null
        target: Element | null
        onMount(gl: GL): void
        onClean(gl: GL): void
        onSuccess(gl: GL): void
        onError(error: any): void
        onChangeTextarea: (e: EditorState) => void
        onChangeTextareaImpl: (e: EditorState) => void
        onChangeTitleInput(): void
        __listener?: () => void
        ref(el: Element | null): void
}

const createEventImpl = (override: Partial<EventType>) => {
        let listener = () => {}

        const onChangeTitleInput = (_e: OnChangeEvent) => {
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
                const gl = createGL()
                try {
                        gl.el = event.target
                        gl.fs = e.doc.toString()
                        resizeGL(gl)
                        mountGL(gl)
                        drawGL(gl)
                        event.onSuccess(gl)
                } catch (error) {
                        console.warn('Event Error:', error)
                        event.onError(error)
                }
        }

        const onMount = (gl: GL) => {
                resizeGL(gl)
                mountGL(gl)
                drawGL(gl)
        }

        const onClean = (gl: GL) => {
                cleanGL(gl)
        }

        const event = createEvent<EventType>({
                ...override,
                onMount,
                onClean,
                onChangeTitleInput,
                onChangeTextarea,
                onChangeTextareaImpl,
        })

        return event
}

export const useEventImpl = () => {
        const [, setError] = useState<Error | null>(null)
        const [gl, setGL] = useState(createGL)

        const event = useOnce(() => {
                const ret = createEventImpl({
                        onSuccess(_gl) {
                                setGL((p: GL) => {
                                        ret.onClean(p)
                                        return _gl
                                })
                                setError(null)
                        },
                        onError(error) {
                                setError((event.error = error))
                        },
                })

                ret.gl = gl

                ret.ref = (el: Element | null) => {
                        if (el) gl.el = event.target = el
                }

                return ret
        })

        useEffect(() => {
                event.onMount(event.gl)
                return () => {
                        event.onClean(event.gl)
                }
        }, [event])

        return event
}
