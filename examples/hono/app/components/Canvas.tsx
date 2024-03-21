import React from 'react'
import { useCanvasSize } from '../hooks/useCanvasSize'
const Canvas = React.forwardRef<
        HTMLCanvasElement | null,
        React.HTMLAttributes<HTMLDivElement>
>((props, forwardedRef) => {
        const { children, ...other } = props
        const [divRef, containerRef, canvasRef] = useCanvasSize()

        React.useImperativeHandle(forwardedRef, () => canvasRef.current!)

        return (
                <div
                        ref={divRef}
                        className="relative w-full h-full overflow-hidden rounded"
                        {...other}
                >
                        <div ref={containerRef} className="w-full h-full">
                                <canvas
                                        ref={canvasRef}
                                        className="__canvas block rounded"
                                />
                        </div>
                        {children}
                </div>
        )
})

export default Canvas
