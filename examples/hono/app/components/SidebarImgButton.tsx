import React from 'react'

interface SidebarImgButtonProps {
        children: React.ReactNode
}

const SidebarImgButton = (props: SidebarImgButtonProps) => {
        const { children } = props
        return (
                <button
                        className="flex items-center justify-center m-3 w-12 h-12 font-medium rounded border-2 dark:border-gray-950 text-gray-500 dark:text-gray-400"
                        // size="icon"
                        // variant="outline"
                >
                        <img
                                alt="profile"
                                src="https://github.com/tseijp/glre/blob/main/examples/hono/static/profile.jpg?raw=true"
                                className="rounded-full"
                                height="32"
                                style={{
                                        aspectRatio: '32/32',
                                        objectFit: 'cover',
                                }}
                                width="32"
                        />
                        <span className="sr-only">{children}</span>
                </button>
        )
}

export default SidebarImgButton
