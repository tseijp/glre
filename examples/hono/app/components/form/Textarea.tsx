import React from 'react'

interface TextareaProps
        extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
        defaultValue?: string
}

const Textarea = (props: TextareaProps) => {
        const { defaultValue, ...other } = props

        return (
                <textarea
                        {...other}
                        className="
                                bg-white
                                text-blue-500
                                font-bold
                                py-2
                                px-4
                                rounded
                                shadow
                        "
                        placeholder="please input here..."
                        rows={20}
                        defaultValue={defaultValue}
                />
        )
}

export default Textarea
