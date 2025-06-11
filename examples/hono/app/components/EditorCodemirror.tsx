import React from 'react'

const EditorCodemirror = React.forwardRef<
        HTMLDivElement | null,
        React.HTMLAttributes<HTMLDivElement>
>((props, forwardedRef) => {
        const { children, ...other } = props
        return (
                <div
                        className="relative -translate-x-6 w-full h-full rounded overflow-hidden"
                        {...other}
                >
                        <div className="flex justify-end items-center h-12 gap-4">
                                {children}
                        </div>
                        <div
                                ref={forwardedRef}
                                className="absolute pb-24 w-full h-full rounded overflow-hidden hidden-scrollbar"
                        />
                </div>
        )
})

export default EditorCodemirror
