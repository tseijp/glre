import React from 'react'

export interface HeaderProps {
        children: React.ReactNode
}

const Header = (props: HeaderProps) => {
        const { children } = props
        return (
                <header
                        className={`
                                fixed
                                flex
                                justify-between
                                items-center
                                bg-gradient-to-br from-blue-500 to-blue-400
                                text-white
                                w-full
                                p-4
                                shadow
                                top-0
                                left-0
                                min-[960px]:hidden
                        `}
                >
                        {children}
                </header>
        )
}

export default Header
