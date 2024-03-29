import React from 'react'

interface EditorProps {
        children: React.ReactNode
}

const EditorFlex = (props: EditorProps) => {
        const { children } = props
        return (
                <div className="flex flex-row items-center w-full h-full">
                        {children}
                </div>
        )
}

export default EditorFlex
