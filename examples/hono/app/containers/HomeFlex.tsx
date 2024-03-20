import React from 'react'

interface HomeProps {
        children: React.ReactNode
}

const HomeFlex = (props: HomeProps) => {
        const { children } = props
        return <div className="w-full h-full">{children}</div>
}

export default HomeFlex
