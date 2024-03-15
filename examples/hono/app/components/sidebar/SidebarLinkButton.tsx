import React from 'react'

interface SidebarLinkButtonProps extends React.HTMLProps<HTMLLinkElement> {
        children: React.ReactNode
}

const SidebarLinkButton = (props: SidebarLinkButtonProps) => {
        const { children, ...other } = props
        return (
                <button>
                        <a
                                className="flex h-10 items-center justify-center border-b-2 border-gray-100 px-4 text-sm font-medium text-gray-500 dark:border-gray-950 dark:text-gray-400"
                                {...other}
                        >
                                {children}
                        </a>
                </button>
        )
}

export default SidebarLinkButton
