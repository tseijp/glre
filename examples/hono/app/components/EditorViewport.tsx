import React from 'react'
import Canvas from './Canvas'

const EditorViewport = React.forwardRef<HTMLCanvasElement | null>(
        (props, forwardedRef) => {
                return (
                        <div className="p-6 max-w-lg w-full h-full" {...props}>
                                <Canvas ref={forwardedRef} />
                        </div>
                )
        }
)

export default EditorViewport
