import React from 'react'

export interface MainProps {
        children: React.ReactNode
}

const MainFlex = (props: MainProps) => {
        const { children } = props
        return (
                <div className="flex flex-col w-full min-h-screen lg:grid-cols-[1fr_300px_400px]">
                        <main className="flex-1 overflow-hidden">
                                <div className="relative flex flex-col h-screen">
                                        {children}
                                </div>
                        </main>
                </div>
        )
}

export default MainFlex
