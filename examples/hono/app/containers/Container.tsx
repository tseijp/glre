import { SIDEBAR_FLEX_WIDTH_PIXEL as w } from '../constants'

interface ContainerProps {
        children: React.ReactNode
}

const Container = (props: ContainerProps) => {
        const { children } = props
        return (
                <div
                        key="1"
                        className={`grid min-h-screen w-full items-start gap-0 border-2 border-gray-200 lg:grid-cols-[${w}px_1fr] dark:border-gray-950`}
                >
                        {children}
                </div>
        )
}

export default Container
