// import TitleInput from '../components/editor/TitleInput'
// import SubmitButton from '../components/editor/SubmitButton'
import { useEventImpl } from '../hooks/useEventImpl'
import { useCodemirror } from '../hooks/useCodemirror'
import EditorItem from '../containers/EditorItem'
import EditorFlex from '../containers/EditorFlex'
import Layout from '../layout'
import EditorCodemirror from '../components/EditorCodemirror'
import EditorViewport from '../components/EditorViewport'

interface NewProps {
        defaultFragmentShader: string
}

const New = (props: NewProps) => {
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

export default New
