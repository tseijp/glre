interface ToolbarProps {
        children: React.ReactNode
}

const Toolbar = (props: ToolbarProps) => {
        const { children } = props
        return (
                <div className="absolute w-full bottom-0 shadow-sm backdrop-blur-sm">
                        {children}
                </div>
        )
}

export default Toolbar
