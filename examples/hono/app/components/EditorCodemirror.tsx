import React from 'react'

const EditorCodemirror = React.forwardRef<HTMLDivElement | null>(
        (props, forwardedRef) => {
                return (
                        <div
                                className="relative -translate-x-6 w-full h-full rounded overflow-hidden"
                                {...props}
                        >
                                <div
                                        ref={forwardedRef}
                                        className="absolute py-6 w-full h-full overflow-scroll rounded overflow-hidden"
                                ></div>
                        </div>
                )
        }
)

export default EditorCodemirror
