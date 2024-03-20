import { useEffect } from 'react'
import { useOnce } from 'reev/react'

const createSidebarViewport = () => {
        let canvas: HTMLCanvasElement
        let target: HTMLCanvasElement
        let ctx: CanvasRenderingContext2D | null
        let requestID: any

        const onMount = () => {
                const id = 'editorViewportCanvas'
                if (!target) target = document.getElementById(id) as any
                if (!target) {
                        console.warn(`SidebarViewport Error: Canvas not found`)
                        return
                }

                if (!ctx) ctx = canvas.getContext('2d')

                const tick = () => {
                        if (!ctx) return
                        const gap = 32 * 2.0
                        const w = canvas.width - gap * 2
                        const h = canvas.height - gap * 2
                        ctx.drawImage(target, gap, gap, w, h)
                        requestID = requestAnimationFrame(tick)
                }
                tick()
        }

        const onClean = () => {
                cancelAnimationFrame(requestID)
        }

        const ref = (el: HTMLCanvasElement | null) => {
                if (el) canvas = el
        }
        return { ref, onMount, onClean }
}

export const useSidebarViewport = () => {
        const { ref, onMount, onClean } = useOnce(createSidebarViewport)

        useEffect(() => {
                onMount()
                return onClean
        }, [])

        return ref
}
