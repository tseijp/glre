import React from 'react'

interface SidebarIconButtonProps {
        Icon: React.ComponentType<React.SVGProps<SVGSVGElement>>
        children: React.ReactNode
}

const SidebarIconButton = (props: SidebarIconButtonProps) => {
        const { Icon } = props
        return (
                <button
                        className="flex items-center justify-center m-3 gap-3 w-12 h-12 text-sm font-medium rounded border-2 dark:border-gray-950 text-gray-500 dark:text-gray-400"
                        // size="icon"
                        // variant="outline"
                >
                        <Icon className="h-6 w-6" />
                        {/* <span className="hidden lg:flex">{children}</span> */}
                </button>
        )
}

export default SidebarIconButton
