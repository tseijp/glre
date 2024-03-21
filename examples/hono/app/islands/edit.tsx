// import React from 'react'
// import TitleInput from '../components/editor/TitleInput'
// import SubmitButton from '../components/editor/SubmitButton'
import { useEventImpl } from '../hooks/useEventImpl'
import { useCodemirror } from '../hooks/useCodemirror'
import EditorFlex from '../containers/EditorFlex'
import EditorItem from '../containers/EditorItem'
import Layout from '../layout'
import EditorImageButton from '../components/EditorImageButton'
import EditorInputTitle from '../components/EditorInputTitle'
import EditorViewport from '../components/EditorViewport'
import EditorCodemirror from '../components/EditorCodemirror'
import EditorUpdateButton from '../components/EditorUpdateButton'

interface NewProps {
        defaultFragmentShader: string
}

const App = (props: NewProps) => {
        const { defaultFragmentShader } = props
        const event = useEventImpl(true)
        const ref = useCodemirror(
                defaultFragmentShader,
                event.onChangeTextarea,
                event.onClickUpdateButton
        )

        return (
                <Layout>
                        <EditorFlex>
                                <EditorItem>
                                        <EditorViewport
                                                ref={event.ref}
                                                err={event.err}
                                        >
                                                <EditorImageButton />
                                                <EditorInputTitle
                                                        defaultValue="HELLO WORLD"
                                                        onChange={
                                                                event.onChangeInputTitle
                                                        }
                                                />
                                        </EditorViewport>
                                </EditorItem>
                                <EditorItem>
                                        {/* <TitleInput
                                                name="title"
                                                onChange={
                                                        event?.onChangeTitleInput
                                                }
                                        />
                                        <SubmitButton children="Update" /> */}
                                        <EditorCodemirror ref={ref}>
                                                <EditorUpdateButton
                                                        // color="red"
                                                        color="NONE"
                                                        onClick={
                                                                event.onClickDeleteButton
                                                        }
                                                >
                                                        Delete
                                                </EditorUpdateButton>
                                                <EditorUpdateButton
                                                        color={event.col}
                                                        onClick={
                                                                event.onClickUpdateButton
                                                        }
                                                >
                                                        {event.ui}
                                                </EditorUpdateButton>
                                        </EditorCodemirror>
                                </EditorItem>
                        </EditorFlex>
                </Layout>
        )
}

export default App
