import React from 'react'
import Canvas from './Canvas'

const EditorViewport = React.forwardRef<HTMLCanvasElement | null>(
        (props, forwardedRef) => {
                return (
                        <div className="p-8 max-w-lg w-full h-full" {...props}>
                                <Canvas
                                        canvasId="editorViewportCanvas"
                                        ref={forwardedRef}
                                />
                        </div>
                )
        }
)

export default EditorViewport
