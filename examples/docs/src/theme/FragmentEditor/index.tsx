import ReactLiveScope from '../ReactLiveScope'
// @ts-ignore
import PlaygroundProvider from '@theme/Playground/Provider' // @ts-ignore
import PlaygroundContainer from '@theme/Playground/Container' // @ts-ignore
import PlaygroundPreview from '@theme/Playground/Preview' // @ts-ignore
import PlaygroundEditor from '@theme/Playground/Editor'
import { useInView } from './useInView'
import './index.css'

const isWebGL = false

const createCanvasTemplate = (isLoop: boolean, fragmentExpression: string, functionDefinition?: string) => {
        if (!isLoop)
                if (
                        functionDefinition?.includes('iTime') ||
                        functionDefinition?.includes('iMouse') ||
                        functionDefinition?.includes('texture') // @TODO FIX: stop rendering if no loop and using texture for webgpu
                )
                        isLoop = true
        return `
function Canvas() {
        ${functionDefinition || ''}
        const gl = useGL({
                width: 256,
                height: 256,
                isLoop: ${isLoop},
                isWebGL: ${isWebGL ? 'true' : 'false'},
                frag: ${fragmentExpression},
        })
        return <canvas ref={gl.ref} />
}`
}

const dummy = `
function Canvas() {
        return <canvas />
}
`
const transformCode = (isInView = true, isFun = true, isApp = false, isLoop = true, code: string) => {
        if (!isInView) return dummy
        code = code.trim()
        if (isApp) return code
        let ret: string
        if (isFun) ret = createCanvasTemplate(isLoop, 'fragment()', code)
        else ret = createCanvasTemplate(isLoop, code)
        ret = ret.trim()
        return ret
}

interface Props {
        code?: string
        isFun?: boolean
        isApp?: boolean
        isLoop?: boolean
}

export const FragmentEditor = ({ code = 'vec4(fract(fragCoord.xy.div(iResolution)), 0, 1)', isFun = true, isApp = false, isLoop = false, ...props }: Props) => {
        const [ref, isInView] = useInView({ threshold: 0.1 })
        return (
                <div ref={ref}>
                        <PlaygroundContainer>
                                <PlaygroundProvider code={code} transformCode={transformCode.bind(null, isInView, isFun, isApp, isLoop)} scope={ReactLiveScope} {...props}>
                                        <PlaygroundEditor />
                                        <PlaygroundPreview />
                                </PlaygroundProvider>
                        </PlaygroundContainer>
                </div>
        )
}
