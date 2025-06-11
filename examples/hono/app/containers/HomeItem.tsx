import React from 'react'

interface HomeItemProps {
        children: React.ReactNode
}

const HomeItem = (props: HomeItemProps) => {
        const { children } = props
        return (
                <div className="max-h-[800px] flex-1 w-full h-full min-h-0">
                        {children}
                </div>
        )
}

export default HomeItem
