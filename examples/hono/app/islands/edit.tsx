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

interface Props {
        creationId: string
        creationTitle: string
        creationContent: string
}

const App = (props: Props) => {
        const { creationId, creationTitle, creationContent } = props
        const event = useEventImpl(
                true,
                creationId,
                creationTitle,
                creationContent
        )

        const ref = useCodemirror(
                creationContent,
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
                                                        defaultValue={
                                                                creationTitle
                                                        }
                                                        onChange={
                                                                event.onChangeInputTitle
                                                        }
                                                />
                                        </EditorViewport>
                                </EditorItem>
                                <EditorItem>
                                        <EditorCodemirror ref={ref}>
                                                <EditorUpdateButton
                                                        color="red"
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
