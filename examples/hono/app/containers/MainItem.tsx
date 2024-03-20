import React from 'react'
interface MainItemProps {
        children: React.ReactNode
}

const MainItem = (props: MainItemProps) => {
        const { children } = props
        return (
                <div className="flex-1 w-full h-full min-h-0 overflow-auto">
                        {children}
                </div>
        )
}

export default MainItem
