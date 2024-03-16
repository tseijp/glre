import { useOnce } from 'reev/react'

const _isDark = () => window.matchMedia('(prefers-color-scheme: dark)').matches

export const createCodemirror = <El extends Element>(
        defaultValue: string,
        handleChange: Function
) => {
        let target = null as null | El

        const mount = async () => {
                const [
                        { cpp },
                        { EditorState },
                        { EditorView, lineNumbers },
                        { githubDark, githubLight },
                ] = await Promise.all([
                        import('@codemirror/lang-cpp'),
                        import('@codemirror/state'),
                        import('@codemirror/view'),
                        import('@uiw/codemirror-theme-github'),
                ])

                const dark = _isDark()
                const myTheme = EditorView.theme(theme, { dark })
                const listenner = EditorView.updateListener.of(({ state }) => {
                        handleChange(state)
                })

                const extensions = [
                        cpp(),
                        lineNumbers(),
                        dark ? githubDark : githubLight,
                        myTheme,
                        listenner,
                ]

                const doc = defaultValue
                const state = EditorState.create({ doc, extensions })
                const parent = target!
                const editorView = new EditorView({ state, parent })

                Object.assign(ret, {
                        state,
                        editorView,
                        extensions,
                })
        }

        const clean = () => {}

        const ret = (el: null | El) => {
                if (el) {
                        target = el
                        mount()
                } else clean()
        }

        return ret
}

export const useCodemirror = (defaultValue: string, handleChange: Function) => {
        const ref = useOnce(() => createCodemirror(defaultValue, handleChange))
        return ref
}

const theme = {
        '&': {
                width: '100%',
                height: '100%',
                color: '#E5E5E5',
                backgroundColor: '#303030',
        },
        '.cm-content': {},
        '&.cm-focused .cm-selectionBackground, ::selection': {
                backgroundColor: '#3A3A3A',
        },
        '.cm-gutters': {
                backgroundColor: '#1D1D1D',
                color: '#A8A8A8',
                border: 'none',
        },
}
