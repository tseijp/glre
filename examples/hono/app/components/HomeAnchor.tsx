import React from 'react'

interface HomeAnchorProps
        extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
        children?: React.ReactNode
}

const HomeAnchor = (props: HomeAnchorProps) => {
        return (
                <a
                        className="flex h-12 items-center justify-center text-sm font-medium text-gray-500 dark:text-gray-400"
                        {...props}
                />
        )
}

export default HomeAnchor
