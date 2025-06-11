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
import { DEFAULT_CREATION_CONTENT, DEFAULT_CREATION_TITLE } from '../utils'

const New = () => {
        const event = useEventImpl(
                false,
                '',
                DEFAULT_CREATION_TITLE,
                DEFAULT_CREATION_CONTENT
        )
        const ref = useCodemirror(
                DEFAULT_CREATION_CONTENT,
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
                                                        color={event._col}
                                                        onClick={
                                                                event.onClickDeleteButton
                                                        }
                                                >
                                                        Delete
                                                </EditorUpdateButton>
                                                <EditorUpdateButton
                                                        color={event.col}
                                                        onClick={
                                                                event.onClickCreateButton
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
