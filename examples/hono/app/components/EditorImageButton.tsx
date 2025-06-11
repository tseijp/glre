import React from 'react'

interface EditorImageButtonProps {
        children?: React.ReactNode
}

const EditorImageButton = (_props: EditorImageButtonProps) => {
        return (
                <button className="flex items-center justify-center w-12 h-12 font-medium text-gray-500 dark:text-gray-400">
                        <img
                                alt="profile"
                                src="https://r.tsei.jp/profile.jpg"
                                className="rounded-full"
                                height="32"
                                style={{
                                        aspectRatio: '32/32',
                                        objectFit: 'cover',
                                }}
                                width="32"
                        />
                </button>
        )
}

export default EditorImageButton
