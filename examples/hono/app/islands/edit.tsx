// import React from 'react'
import Layout from '../containers/Layout'
import MainItem from '../containers/MainItem'
import Form from '../containers/Form'
import Textarea from '../components/form/Textarea'
import TitleInput from '../components/form/TitleInput'
import SubmitButton from '../components/form/SubmitButton'
import { useEventImpl } from '../hooks'

interface NewProps {
        defaultFragmentShader: string
}

const App = (props: NewProps) => {
        const { defaultFragmentShader } = props
        const event = useEventImpl()
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
                                        <Textarea
                                                name="content"
                                                onChange={
                                                        event?.onChangeTextarea
                                                }
                                                defaultValue={
                                                        defaultFragmentShader
                                                }
                                        />
                                        <SubmitButton children="Update" />
                                </Form>
                        </MainItem>
                </Layout>
        )
}

export default App
