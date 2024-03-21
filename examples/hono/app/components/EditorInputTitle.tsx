import React from 'react'

interface EditorLinkAnchorProps
        extends React.InputHTMLAttributes<HTMLInputElement> {
        children?: React.ReactNode
}

const EditorInputTitle = (props: EditorLinkAnchorProps) => {
        return (
                <input
                        placeholder="Please enter a title"
                        className="flex h-12 items-center justify-center text-sm font-medium text-gray-500 dark:text-gray-400 appearance-none bg-transparent border-none outline-none"
                        {...props}
                />
        )
}

export default EditorInputTitle
