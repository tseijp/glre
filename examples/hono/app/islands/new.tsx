import Layout from '../containers/Layout'
import MainItem from '../containers/MainItem'
import Form from '../containers/Form'
import TitleInput from '../components/form/TitleInput'
import SubmitButton from '../components/form/SubmitButton'
import { useEventImpl } from '../hooks/useEventImpl'
import { useCodemirror } from '../hooks/useCodemirror'

interface NewProps {
        defaultFragmentShader: string
}

const New = (props: NewProps) => {
        const { defaultFragmentShader } = props
        const event = useEventImpl()
        const ref = useCodemirror(defaultFragmentShader, event.onChangeTextarea)
        return (
                <Layout>
                        <MainItem>
                                <canvas
                                        ref={event.gl.ref}
                                        width="540"
                                        height="400"
                                        color="red"
                                />
                        </MainItem>
                        <MainItem>
                                <Form>
                                        <TitleInput
                                                name="title"
                                                onChange={
                                                        event?.onChangeTitleInput
                                                }
                                        />
                                        <div />
                                        <SubmitButton children="New Create" />
                                </Form>
                        </MainItem>
                </Layout>
        )
}

export default New
