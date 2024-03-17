interface ToolbarFlexProps {
        children: React.ReactNode
}

const ToolbarFlex = (props: ToolbarFlexProps) => {
        const { children } = props
        return (
                <div className="flex justify-center items-center fixed bottom-0 w-full h-12 overflow-hidden shadow-sm backdrop-blur-sm">
                        {children}
                </div>
        )
}

export default ToolbarFlex
