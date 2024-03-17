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
                        className="grid min-h-screen w-full items-start gap-0 border-2 border-gray-200 md:grid-cols-[320px_1fr] dark:border-gray-950"
                >
                        {children}
                </div>
        )
}

export default Container
