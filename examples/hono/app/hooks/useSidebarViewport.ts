import { useEffect } from 'react'
import { useOnce } from 'reev/react'

const $ = (id: string) => Array.from(document.querySelectorAll(id))

const getNearTarget = (targets: HTMLCanvasElement[]) => {
        for (const target in targets) {
        }
}

const createSidebarViewport = () => {
        let ctx = null as null | CanvasRenderingContext2D
        let canvas = null as null | HTMLCanvasElement
        let targets = null as null | HTMLCanvasElement[]
        let requestID: any

        const onMount = () => {
                if (!canvas) return
                if (!targets) targets = $('.__canvas')! as HTMLCanvasElement[]
                if (targets.length <= 1) {
                        console.warn(`SidebarViewport Error: Canvas not found`)
                        return
                }

                if (!ctx) ctx = canvas.getContext('2d')

                const target = getNearTarget(targets)

                const tick = () => {
                        if (!ctx || !canvas) return
                        const gap = 48 * 2.0
                        const w = canvas.width - gap * 2
                        const h = canvas.height - gap * 2
                        // ctx.drawImage(targets, gap, gap, w, h)
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
