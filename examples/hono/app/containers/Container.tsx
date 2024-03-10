interface ContainerProps {
        children: React.ReactNode
}

const Container = (props: ContainerProps) => {
        const { children } = props
        return (
                <div
                        className="
                                flex
                                font-sans
                                bg-gradient-to-br from-blue-500 to-blue-400
                                text-white
                                min-h-screen
                                p-4
                        "
                >
                        {children}
                </div>
        )
}

export default Container
