import React from 'react'
interface MainItemProps {
        children: React.ReactNode
}

const MainItem = (props: MainItemProps) => {
        const { children } = props
        return (
                <div className="grid flex-1 min-h-0 overflow-auto gap-4 p-4 md:gap-6 md:p-10">
                        <div className="flex flex-col gap-4">
                                <div className="grid gap-4">{children}</div>
                        </div>
                </div>
        )
}

export default MainItem