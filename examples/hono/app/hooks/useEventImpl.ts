import { createGL } from 'glre'
import createEvent from 'reev'
import { useOnce } from 'reev/react'
import { useEffect, useState } from 'react'
import { DELAYED_COMPILE_MS } from '../constants'
import { useWindowSize } from './useWindowSize'
import { drawGL, mountGL, cleanGL, resizeGL } from '../utils'
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
                        gl.el = event.gl.el
                        cleanGL(event.gl)
                        resizeGL(gl)
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
        const [gl, setGL] = useState(() => {
                return createGL()
        })

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
                                resizeGL(gl)
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
