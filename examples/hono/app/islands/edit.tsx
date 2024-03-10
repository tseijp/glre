// import React from 'react'
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
                <div className="flex">
                        <canvas
                                ref={event.gl.ref}
                                width="540"
                                height="400"
                                color="red"
                        />
                        <Form>
                                <TitleInput
                                        onChange={event?.onChangeTitleInput}
                                />
                                <Textarea
                                        onChange={event?.onChangeTextarea}
                                        defaultValue={defaultFragmentShader}
                                />
                                <SubmitButton children="Update" />
                        </Form>
                </div>
        )
}

export default App
