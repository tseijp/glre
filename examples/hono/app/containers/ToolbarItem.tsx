interface ToolbarItemProps {
        children: React.ReactNode
}

const ToolbarItem = (props: ToolbarItemProps) => {
        const { children } = props
        return (
                <div className="border-t w-full border-gray-200 dark:border-gray-800">
                        <div className="flex w-full justify-evenly lg:justify-start">
                                {children}
                        </div>
                </div>
        )
}

export default ToolbarItem
