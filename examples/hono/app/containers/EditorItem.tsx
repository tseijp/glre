import React from 'react'

interface EditorItemProps {
        children: React.ReactNode
}

const EditorItem = (props: EditorItemProps) => {
        const { children } = props
        return (
                <div className="max-h-[800px] flex-1 w-full h-full min-h-0">
                        {children}
                </div>
        )
}

export default EditorItem
