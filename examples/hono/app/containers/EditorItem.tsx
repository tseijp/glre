import React from 'react'

interface EditorItemProps {
        children: React.ReactNode
}

const EditorItem = (props: EditorItemProps) => {
        const { children } = props
        return <div className="flex-1 w-full h-full">{children}</div>
}

export default EditorItem
