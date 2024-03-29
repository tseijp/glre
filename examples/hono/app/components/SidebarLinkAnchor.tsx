import React from 'react'

interface SidebarLinkAnchorProps
        extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
        children: React.ReactNode
}

const SidebarLinkAnchor = (props: SidebarLinkAnchorProps) => {
        return (
                <a
                        className="flex h-12 items-center justify-center px-4 text-sm font-medium border-b-2 dark:border-gray-950 text-gray-500 dark:text-gray-400"
                        {...props}
                />
        )
}

export default SidebarLinkAnchor
