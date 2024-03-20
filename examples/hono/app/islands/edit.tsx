// import React from 'react'
// import TitleInput from '../components/editor/TitleInput'
// import SubmitButton from '../components/editor/SubmitButton'
import { useEventImpl } from '../hooks/useEventImpl'
import { useCodemirror } from '../hooks/useCodemirror'
import EditorFlex from '../containers/EditorFlex'
import EditorItem from '../containers/EditorItem'
import Layout from '../layout'
import EditorViewport from '../components/EditorViewport'
import EditorCodemirror from '../components/EditorCodemirror'

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
                                        <EditorViewport ref={event.ref} />
                                </EditorItem>
                                <EditorItem>
                                        {/* <TitleInput
                                                name="title"
                                                onChange={
                                                        event?.onChangeTitleInput
                                                }
                                        />
                                        <SubmitButton children="Update" /> */}
                                        <EditorCodemirror ref={ref} />
                                </EditorItem>
                        </EditorFlex>
                </Layout>
        )
}

export default App
