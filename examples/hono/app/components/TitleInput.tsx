import React from 'react'

const TitleInput = (props: React.TextareaHTMLAttributes<HTMLInputElement>) => {
        return (
                <input
                        {...props}
                        placeholder="please input here..."
                        className="
                                bg-white
                                text-blue-500
                                font-bold
                                py-2
                                px-4
                                rounded
                                shadow
                        "
                ></input>
        )
}

export default TitleInput
