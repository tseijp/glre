import React from 'react'
import {
        SIDEBAR_FLEX_Z_INDEX_CLASS as z,
        SIDEBAR_FLEX_WIDTH_CLASS as w,
} from '../constants'

export interface SidebarFlexProps {
        children: React.ReactNode
}

const SidebarFlex = React.forwardRef<HTMLDivElement, SidebarFlexProps>(
        (props, forwardRef) => {
                const { children } = props
                return (
                        <div
                                ref={forwardRef}
                                className={`fixed lg:relative z-10 w-${w} h-screen flex flex-col border-r border-gray-200 dark:border-gray-800 shadow-sm backdrop-blur-sm -translate-x-full lg:translate-x-0`}
                        >
                                <div className="flex-1 flex flex-col justify-between max-h-full">
                                        {children}
                                </div>
                        </div>
                )
        }
)

export default SidebarFlex
