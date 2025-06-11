/**
 * w-80 is 320px
 */

interface ContainerProps {
        children: React.ReactNode
}

const Container = (props: ContainerProps) => {
        const { children } = props
        return (
                <div
                        key="1"
                        className="grid min-h-screen w-screen h-[100dvh] items-start gap-0 border-2 border-gray-200 lg:grid-cols-[320px_1fr] dark:border-gray-950 overflow-hidden"
                >
                        {children}
                </div>
        )
}

export default Container
