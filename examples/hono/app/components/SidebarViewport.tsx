import Canvas from './Canvas'
import { useOnce } from 'reev/react'

const createSidebarViewport = () => {
        let canvas: HTMLCanvasElement
        let target: HTMLCanvasElement
        let requestID: any

        const onMount = () => {
                const id = 'editorViewportCanvas'
                target = document.getElementById(id)! as HTMLCanvasElement
                if (!target) return

                const ctx = canvas.getContext('2d')
                if (!ctx) return

                const tick = () => {
                        ctx.drawImage(target, 0, 0, target.width, target.height)
                        requestID = requestAnimationFrame(tick)
                }
                tick()
        }

        const onClean = () => {
                cancelAnimationFrame(requestID)
        }

        const ref = (el: HTMLCanvasElement | null) => {
                if (el) {
                        canvas = el
                        onMount()
                } else onClean()
        }
        return ref
}

const SidebarViewport = () => {
        const ref = useOnce(createSidebarViewport)
        return (
                <div className="absolute max-w-lg w-full h-full flex pointer-events-none">
                        <Canvas ref={ref} />
                </div>
        )
}

export default SidebarViewport
