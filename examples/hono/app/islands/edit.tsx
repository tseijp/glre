// import React from 'react'
// import TitleInput from '../components/editor/TitleInput'
// import SubmitButton from '../components/editor/SubmitButton'
import { useEventImpl } from '../hooks/useEventImpl'
import { useCodemirror } from '../hooks/useCodemirror'
import EditorFlex from '../containers/EditorFlex'
import EditorItem from '../containers/EditorItem'
import Layout from '../layout'

interface NewProps {
        defaultFragmentShader: string
}

const App = (props: NewProps) => {
        const { defaultFragmentShader } = props
        const event = useEventImpl()
        const ref = useCodemirror(defaultFragmentShader, event.onChangeTextarea)
        return (
                <Layout>
                        <EditorFlex>
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
                        </EditorFlex>
                </Layout>
        )
}

export default App
