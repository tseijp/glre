import React from 'react'

interface SidebarItemProps {
        children: React.ReactNode
}

const SidebarItem = (props: SidebarItemProps) => {
        const { children } = props
        return <div className="flex flex-col">{children}</div>
}

export default SidebarItem
