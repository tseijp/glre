import { createGL, GL } from 'glre'
import createEvent from 'reev'
import { useOnce } from 'reev/react'
import { useEffect, useState } from 'react'
import {
        DEFAULT_CREATION_CONTENT,
        DEFAULT_CREATION_TITLE,
        DELAYED_COMPILE_MS,
} from '../utils'
import {
        drawGL,
        mountGL,
        cleanGL,
        resizeGL,
        createCreation,
        updateCreation,
        deleteCreation,
        resolve,
} from '../utils'
import type { EditorState } from '@codemirror/state'

type OnChangeEvent = React.ChangeEvent<HTMLTextAreaElement>

// const ERROR_MESSAGE = `
// Could not compile glsl

// ERROR: 0:5: '' : syntax error
// `.trim()

export interface EventType {
        id: string
        title: string
        content: string
        _title: string
        _content: string
        err: string
        _col: string
        col: string
        ui: string
        gl: GL
        error: Error | null
        target: Element | null
        isCreated?: boolean
        isChanged?: boolean
        onChange(): void
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
                if (event.title === event._title) return
                if (!event.isCreated) return
                event.isChanged =
                        event.content !== event._content ||
                        event.title !== event._title
                event.onChange()
        }

        const onChangeTextarea = (e: EditorState) => {
                listener()
                const id = setTimeout(
                        () => event.onChangeTextareaImpl(e),
                        DELAYED_COMPILE_MS
                )
                listener = () => clearTimeout(id)
        }

        const onChangeTextareaImpl = async (e: EditorState) => {
                const gl = createGL()
                event.content = e.doc.toString()
                event.isChanged =
                        event.content !== event._content ||
                        event.title !== event._title

                gl.el = event.target
                event.onMount(gl)
                event.onSuccess(gl)
        }

        const saveCurrentState = () => {
                event._title = event.title
                event._content = event.content
                event.isCreated = true
                event.onSave()
        }

        const onClickCreateButton = async () => {
                if (event.isCreated) return event.onClickUpdateButton()
                try {
                        if (!event.isChanged) return
                        const { title, content } = event
                        const res = await createCreation(title, content)
                        const data = await res.json()
                        const id = data.id
                        if (!id) throw new Error('No id')

                        console.log(res, data)
                        event.id = id
                        saveCurrentState()
                        window.location.replace(`/hono/${id}`)
                        alert('New Created!')
                } catch (error) {
                        console.warn('Event Error:', error)
                }
        }

        const onClickUpdateButton = async () => {
                try {
                        if (!event.isChanged) return
                        const { id, title, content } = event
                        const res = await updateCreation(id, title, content)
                        const data = await res.json()
                        console.log(res, data)
                        saveCurrentState()
                } catch (error) {
                        console.warn('Event Error:', error)
                }
        }

        const onClickDeleteButton = async () => {
                try {
                        if (!event.id) return
                        if (!window.confirm('Is it really ok to delete it?'))
                                return
                        const res = await deleteCreation(event.id)
                        const data = await res.json()
                        console.log(res, data)
                        if (res.ok) {
                                alert('Deleted Successfully!')
                                window.location.href = '/'
                        } else {
                                alert('Failed to delete')
                        }
                } catch (error) {
                        console.warn('Event Error:', error)
                }
        }

        const onMount = async (gl: GL) => {
                try {
                        gl.fs = await resolve(event.content)
                        resizeGL(gl)
                        mountGL(gl)
                        drawGL(gl)
                } catch (error) {
                        console.warn('Event Error:', error)
                        event.onError(error)
                }
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

export const useEventImpl = (
        isCreated: boolean,
        id: string,
        title: string,
        content: string
) => {
        const [gl, setGL] = useState(createGL)
        const [ui, setUI] = useState(isCreated ? 'Update' : 'Create')
        const [col, setCol] = useState('NONE')
        const [err, setError] = useState('')

        const event = useOnce(() => {
                const ret = createEventImpl({
                        onChange() {
                                setUI('Update')
                                setCol('#bf8700')
                        },
                        onSuccess(_gl) {
                                setGL((p: GL) => {
                                        ret.onClean(p)
                                        return _gl
                                })
                                setCol(event.isChanged ? '#bf8700' : 'NONE')
                                setUI(event.isCreated ? 'Update' : 'Create')
                                setError('')
                        },
                        onError(error) {
                                setError(error + '')
                                setCol('NONE')
                        },
                        onSave() {
                                setUI('Success')
                                setCol('#1f883d')
                        },
                })

                ret.gl = gl
                ret.id = id
                ret.title = title
                ret.content = content
                ret.isCreated = isCreated

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
        event._col = event.isCreated ? 'red' : 'NONE'
        event.col = col
        event.err = err

        return event
}
