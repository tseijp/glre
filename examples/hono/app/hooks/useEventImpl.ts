import { createGL, GL } from 'glre'
import createEvent from 'reev'
import { useOnce } from 'reev/react'
import { useEffect, useState } from 'react'
import { DELAYED_COMPILE_MS } from '../constants'
import { drawGL, mountGL, cleanGL, resizeGL } from '../utils'
import { createCreation, updateCreation, deleteCreation } from './utils'
import type { EditorState } from '@codemirror/state'

type OnChangeEvent = React.ChangeEvent<HTMLTextAreaElement>

// const ERROR_MESSAGE = `
// Could not compile glsl

// ERROR: 0:5: '' : syntax error
// `.trim()

export interface EventType {
        title: string
        err: string
        col: string
        ui: string
        gl: GL
        error: Error | null
        target: Element | null
        isCreated?: true
        onMount(gl: GL): void
        onClean(gl: GL): void
        onSuccess(gl: GL): void
        onError(error: any): void
        onSave(): void
        onClickCreateButton(): void
        onClickUpdateButton(): void
        onClickDeleteButton(): void
        onChangeTextarea(e: EditorState): void
        onChangeTextareaImpl(e: EditorState): void
        onChangeInputTitle(): void
        __listener?: () => void
        ref(el: Element | null): void
}

const createEventImpl = (override: Partial<EventType>) => {
        let listener = () => {}

        const onChangeInputTitle = (e: OnChangeEvent) => {
                event.title = e.target.value
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

        const onClickCreateButton = () => {
                if (event.isCreated) return event.onClickUpdateButton()
                try {
                        event.onSave()
                        alert('New Created!')
                } catch (error) {
                        console.warn('Event Error:', error)
                }
        }

        const onClickUpdateButton = () => {
                try {
                        event.onSave()
                        alert('Updated')
                } catch (error) {
                        console.warn('Event Error:', error)
                }
        }

        const onClickDeleteButton = () => {
                if (!window.confirm('Is it really ok to delete it?')) return
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
                onClickCreateButton,
                onClickUpdateButton,
                onClickDeleteButton,
                onChangeInputTitle,
                onChangeTextarea,
                onChangeTextareaImpl,
        })

        return event
}

export const useEventImpl = (isCreated = false) => {
        const [gl, setGL] = useState(createGL)
        const [ui, setUI] = useState(isCreated ? 'Update' : 'Create')
        const [col, setCol] = useState('NONE')
        const [err, setError] = useState('')

        const event = useOnce(() => {
                const ret = createEventImpl({
                        onSuccess(_gl) {
                                setGL((p: GL) => {
                                        ret.onClean(p)
                                        return _gl
                                })
                                setCol('#bf8700')
                                setUI(event.isCreated ? 'Update' : 'Create')
                                setError('')
                        },
                        onError(error) {
                                setError(error)
                                setCol('NONE')
                        },
                        onSave() {
                                event.isCreated = true
                                setUI('Success')
                                setCol('#1f883d')
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

        event.ui = ui
        event.col = col
        event.err = err

        return event
}
