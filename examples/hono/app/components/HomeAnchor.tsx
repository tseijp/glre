import React from 'react'

interface HomeAnchorProps
        extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
        children?: React.ReactNode
}

const HomeAnchor = (props: HomeAnchorProps) => {
        return (
                <a
                        className="flex h-12 items-center justify-center text-sm font-medium border-b-2 dark:border-gray-950 text-gray-500 dark:text-gray-400"
                        {...props}
                />
        )
}

export default HomeAnchor
