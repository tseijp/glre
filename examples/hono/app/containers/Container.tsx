interface ContainerProps {
        children: React.ReactNode
}

const Container = (props: ContainerProps) => {
        const { children } = props
        return (
                <div
                        key="1"
                        className="grid min-h-screen w-full lg:grid-cols-[300px_1fr] items-start gap-0 border-t border-gray-200 px-0.5 py-0.5 "
                >
                        {children}
                </div>
        )
}

export default Container
