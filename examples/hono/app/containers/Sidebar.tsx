import React from 'react'

export interface SidebarProps {
        children: React.ReactNode
}

const Sidebar = (props: SidebarProps) => {
        const { children } = props
        return (
                <div className="hidden lg:flex h-screen w-full flex-col border-r border-gray-200 dark:border-gray-800">
                        <div className="flex-1 flex flex-col justify-between max-h-full">
                                {children}
                        </div>
                </div>
        )
}

export default Sidebar
