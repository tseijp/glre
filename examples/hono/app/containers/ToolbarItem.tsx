interface ToolbarItemProps {
        children: React.ReactNode
}

const ToolbarItem = (props: ToolbarItemProps) => {
        const { children } = props
        return (
                <div className="border-t w-full border-gray-200 py-4 px-4 dark:border-gray-800">
                        {children}
                </div>
        )
}

export default ToolbarItem
