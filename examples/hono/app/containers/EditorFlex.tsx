import React from 'react'

interface EditorProps {
        children: React.ReactNode
}

const EditorFlex = (props: EditorProps) => {
        const { children } = props
        return (
                <div className="flex flex-row w-full h-full max-w-[1280px]">
                        {children}
                </div>
        )
}

export default EditorFlex
