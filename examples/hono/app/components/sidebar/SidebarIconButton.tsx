import React from 'react'

interface SidebarIconButtonProps {
        Icon: React.ComponentType<React.SVGProps<SVGSVGElement>>
        children: React.ReactNode
}

const SidebarIconButton = (props: SidebarIconButtonProps) => {
        const { Icon, children } = props
        return (
                <button
                        className="m-3"
                        // size="icon"
                        // variant="outline"
                >
                        <Icon className="h-6 w-6" />
                        <span className="sr-only">{children}</span>
                </button>
        )
}

export default SidebarIconButton
