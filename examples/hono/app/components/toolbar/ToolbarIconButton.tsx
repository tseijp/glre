interface ToolbarIconButtonProps {
        Icon: React.FunctionComponent<React.SVGProps<SVGSVGElement>>
        children: React.ReactNode
}

const ToolbarIconButton = (props: ToolbarIconButtonProps) => {
        const { Icon, children } = props
        return (
                <button
                        className="m-2"
                        // size="icon"
                        // variant="outline"
                >
                        <Icon className="h-4 w-4" />
                        <span className="sr-only">{children}</span>
                </button>
        )
}

export default ToolbarIconButton
