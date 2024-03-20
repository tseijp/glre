import React, { useEffect, useImperativeHandle, useRef } from 'react'
import { useOnce } from 'reev/react'

const createRect = <ContainerRef extends { current: Element | null }>(
        containerRef: ContainerRef
) => {
        const container = containerRef.current
        let width = 0
        let height = 0
        if (container instanceof HTMLElement) {
                width = container.offsetWidth
                height = container.offsetHeight
        }
        return { width, height }
}

const createCanvasResize = <
        ContainerRef extends { current: HTMLDivElement | null },
        CanvasRef extends { current: HTMLCanvasElement | null }
>(
        containerRef: ContainerRef,
        canvasRef: CanvasRef
) => {
        const onResize = () => {
                const canvas = canvasRef.current
                const rect = createRect(containerRef)
                if (rect.width <= 0 || rect.height <= 0 || !canvas) return
                canvas.width = rect.width
                canvas.height = rect.height
        }

        const onMount = () => {
                onResize()
                const container = containerRef.current
                if (!container) return
                window.addEventListener('resize', onResize)
        }

        const onClean = () => {
                const container = containerRef.current
                if (!container) return
                window.removeEventListener('resize', onResize)
        }

        return { onMount, onClean }
}

interface CanvasProps extends React.HTMLAttributes<HTMLDivElement> {
        canvasId?: string
}

const Canvas = React.forwardRef<HTMLCanvasElement | null, CanvasProps>(
        (props, forwardedRef) => {
                const { canvasId, ...divProps } = props
                const divRef = useRef<HTMLDivElement | null>(null)
                const containerRef = useRef<HTMLDivElement | null>(null)
                const canvasRef = useRef<HTMLCanvasElement | null>(null)
                const canvasResize = useOnce(() => {
                        return createCanvasResize(containerRef, canvasRef)
                })

                useImperativeHandle(forwardedRef, () => canvasRef.current!)

                useEffect(() => {
                        canvasResize.onMount()
                        return () => {
                                canvasResize.onClean()
                        }
                }, [canvasResize])

                return (
                        <div
                                ref={divRef}
                                className="relative w-full h-full overflow-hidden rounded"
                                {...divProps}
                        >
                                <div
                                        ref={containerRef}
                                        className="w-full h-full"
                                >
                                        <canvas
                                                id={canvasId}
                                                ref={canvasRef}
                                                className="block rounded"
                                        />
                                </div>
                        </div>
                )
        }
)

export default Canvas
