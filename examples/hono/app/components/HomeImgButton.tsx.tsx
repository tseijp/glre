import React from 'react'

interface HomeImgButtonProps {
        children?: React.ReactNode
}

const HomeImgButton = (_props: HomeImgButtonProps) => {
        return (
                <button className="flex items-center justify-center w-12 h-12 font-medium text-gray-500 dark:text-gray-400">
                        <img
                                alt="profile"
                                src="https://github.com/tseijp/glre/blob/main/examples/hono/static/profile.jpg?raw=true"
                                className="rounded-full"
                                height="32"
                                style={{
                                        aspectRatio: '32/32',
                                        objectFit: 'cover',
                                }}
                                width="32"
                        />
                </button>
        )
}

export default HomeImgButton
