import React from 'react'

interface EditorProps {
        children: React.ReactNode
}

const Editor = (props: EditorProps) => {
        const { children } = props
        return <div className="flex overflow-hidden rounded">{children}</div>
}

export default Editor
