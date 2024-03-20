import { useSidebarViewport } from '../hooks/useSidebarViewport'
import Canvas from './Canvas'

const SidebarViewport = () => {
        const ref = useSidebarViewport()
        return (
                <div className="absolute -z-10 max-w-lg w-full h-full flex pointer-events-none">
                        <div className="opacity-0 lg:opacity-100">
                                <Canvas ref={ref} />
                        </div>
                        <div className="absolute w-full h-full bg-transparent shadow-sm backdrop-blur-sm lg:backdrop-blur-3xl" />
                </div>
        )
}

export default SidebarViewport
