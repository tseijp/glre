interface ToolbarProps {
        children: React.ReactNode
}

const Toolbar = (props: ToolbarProps) => {
        const { children } = props
        return <div className="flex flex-col gap-0.5">{children}</div>
}

export default Toolbar
