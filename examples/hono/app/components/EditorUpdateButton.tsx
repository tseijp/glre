import React from 'react'

interface EditorUpdateButtonProps
        extends React.HTMLAttributes<HTMLButtonElement> {
        color?: string
        children?: React.ReactNode
        onClick?: () => void
}

const EditorUpdateButton = (props: EditorUpdateButtonProps) => {
        const { color, ...other } = props
        return (
                <button
                        disabled={color === 'NONE'}
                        style={{
                                cursor:
                                        color === 'NONE'
                                                ? 'not-allowed'
                                                : 'pointer',
                                opacity: color === 'NONE' ? 0.5 : 1,
                                border:
                                        color === 'NONE'
                                                ? void 0
                                                : `solid ${color} 2px`,
                        }}
                        className="h-8 px-4 flex items-center justify-center font-medium text-gray-500 dark:text-gray-400 border-2 border-gray-200 dark:border-gray-800 rounded-lg"
                        {...other}
                />
        )
}

export default EditorUpdateButton
