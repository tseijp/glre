import React from 'react'
import { useSidebarFlex } from '../hooks/useSidebarFlex'

export interface SidebarFlexProps {
        children: React.ReactNode
}

const SidebarFlex = (props: SidebarFlexProps) => {
        const { children } = props
        const ref = useSidebarFlex()

        return (
                <div
                        ref={ref}
                        className={[
                                `fixed lg:relative z-10 w-80 h-screen z-20`,
                                `flex flex-col`,
                                `-translate-x-full lg:translate-x-0`, // click arrow
                                `border-gray-200 dark:border-gray-800 `, // border
                        ].join(' ')}
                >
                        <div className="relative flex-1 flex flex-col justify-between max-h-full">
                                {children}
                        </div>
                </div>
        )
}

export default SidebarFlex
