import React from 'react'

interface SidebarImgButtonProps {
        children: React.ReactNode
}

const SidebarImgButton = (props: SidebarImgButtonProps) => {
        const { children } = props
        return (
                <button
                        className="m-2"
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
