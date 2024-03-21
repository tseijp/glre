// import TitleInput from '../components/editor/TitleInput'
// import SubmitButton from '../components/editor/SubmitButton'
import { useEventImpl } from '../hooks/useEventImpl'
import { useCodemirror } from '../hooks/useCodemirror'
import EditorItem from '../containers/EditorItem'
import EditorFlex from '../containers/EditorFlex'
import Layout from '../layout'
import EditorCodemirror from '../components/EditorCodemirror'
import EditorImageButton from '../components/EditorImageButton'
import EditorInputTitle from '../components/EditorInputTitle'
import EditorUpdateButton from '../components/EditorUpdateButton'
import EditorViewport from '../components/EditorViewport'

interface NewProps {
        defaultFragmentShader: string
}

const New = (props: NewProps) => {
        const { defaultFragmentShader } = props
        const event = useEventImpl(false)
        const ref = useCodemirror(
                defaultFragmentShader,
                event.onChangeTextarea,
                event.onClickCreateButton
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

export default New
