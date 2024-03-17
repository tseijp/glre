import React from 'react'

interface SidebarLinkButtonProps
        extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
        children: React.ReactNode
}

const SidebarLinkButton = (props: SidebarLinkButtonProps) => {
        const { children, ...other } = props
        return (
                <button>
                        <a
                                className="flex h-10 items-center justify-center px-4 text-sm font-medium border-b-2 dark:border-gray-950 text-gray-500 dark:text-gray-400"
                                {...other}
                        >
                                {children}
                        </a>
                </button>
        )
}

export default SidebarLinkButton
