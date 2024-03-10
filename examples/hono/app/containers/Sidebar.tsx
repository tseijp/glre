import React from 'react'

export interface SidebarProps {
        children: React.ReactNode
}

const Sidebar = (props: SidebarProps) => {
        const { children } = props
        return (
                <div
                        className={`
                                bg-gradient-to-br from-blue-500 to-blue-400
                                text-white
                                p-4
                                w-64
                                h-full
                                top-0
                                left-0
                                bottom-0
                                pt-16
                                max-[960px]:hidden
                        `}
                >
                        {children}
                </div>
        )
}

export default Sidebar
