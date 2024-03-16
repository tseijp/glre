// import React from 'react'
import Layout from '../containers/Layout'
// import TitleInput from '../components/editor/TitleInput'
// import SubmitButton from '../components/editor/SubmitButton'
import { useEventImpl } from '../hooks/useEventImpl'
import { useCodemirror } from '../hooks/useCodemirror'
import Editor from '../containers/Editor'
import EditorItem from '../containers/EditorItem'

interface NewProps {
        defaultFragmentShader: string
}

const App = (props: NewProps) => {
        const { defaultFragmentShader } = props
        const event = useEventImpl()
        const ref = useCodemirror(defaultFragmentShader, event.onChangeTextarea)
        return (
                <Layout>
                        <Editor>
                                <EditorItem>
                                        <canvas
                                                ref={event.gl.ref}
                                                width="540"
                                                height="400"
                                                color="red"
                                        />
                                </EditorItem>
                                <EditorItem>
                                        {/* <TitleInput
                                                name="title"
                                                onChange={
                                                        event?.onChangeTitleInput
                                                }
                                        />
                                        <SubmitButton children="Update" /> */}
                                        <div ref={ref} />
                                </EditorItem>
                        </Editor>
                </Layout>
        )
}

export default App
