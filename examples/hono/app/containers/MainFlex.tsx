import React from 'react'

export interface MainProps {
        children: React.ReactNode
}

const MainFlex = (props: MainProps) => {
        const { children } = props
        return <div className="flex flex-col w-full h-screen">{children}</div>
}

export default MainFlex
