import React from 'react'

export interface MainProps {
        children: React.ReactNode
}

const Main = (props: MainProps) => {
        const { children } = props
        return (
                <main
                        className="
                                flex
                                flex-col
                                font-sans
                                bg-gradient-to-br from-blue-500 to-blue-400
                                text-white
                                min-h-screen
                                p-4
                                mt-16
                        "
                >
                        {children}
                </main>
        )
}

export default Main
