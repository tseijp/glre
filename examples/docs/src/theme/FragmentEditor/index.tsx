import React from 'react'
import ReactLiveScope from '../ReactLiveScope'
// @ts-ignore
import PlaygroundProvider from '@theme/Playground/Provider'
// @ts-ignore
import PlaygroundContainer from '@theme/Playground/Container'
// @ts-ignore
import PlaygroundLayout from '@theme/Playground/Layout'
import { useInView } from './useInView'

const createCanvasTemplate = (fragmentExpression: string, functionDefinition?: string) => `
function Canvas() {
        ${functionDefinition || ''}
        const gl = useGL({
                width: 256,
                height: 256,
                frag: ${fragmentExpression}
        })
        return <canvas ref={gl.ref} />
}`

const transformCode = (isFun: boolean, code: string) => {
        code = code.trim()
        let ret: string
        if (isFun) ret = createCanvasTemplate('fragment()', code)
        else ret = createCanvasTemplate(code)
        ret = ret.trim()
        return ret
}

interface Props {
        code?: string
        isFun?: boolean
}

export const FragmentEditor = ({
        code = 'vec4(fract(fragCoord.xy.div(iResolution)), 0, 1)',
        isFun = false,
        ...props
}: Props) => {
        code = code.trim()
        const { ref, isInView } = useInView({ threshold: 0.1, triggerOnce: true })
        
        // Calculate height based on code length
        const codeLines = code.split('\n').length
        const estimatedHeight = 256 + Math.max(150, codeLines * 20) + 50 // canvas + code editor + padding
        
        return (
                <div ref={ref}>
                        <PlaygroundContainer>
                                {isInView ? (
                                        <div style={{ opacity: 1, transition: 'opacity 0.3s ease-in-out' }}>
                                                <PlaygroundProvider
                                                        code={code}
                                                        transformCode={transformCode.bind(null, isFun)}
                                                        scope={ReactLiveScope}
                                                        {...props}
                                                >
                                                        <PlaygroundLayout />
                                                </PlaygroundProvider>
                                        </div>
                                ) : (
                                        <div style={{ 
                                                height: `${estimatedHeight}px`,
                                                display: 'flex', 
                                                alignItems: 'center', 
                                                justifyContent: 'center', 
                                                border: '1px solid #e0e0e0', 
                                                borderRadius: '4px',
                                                backgroundColor: '#1e1e1e', // Dark background like canvas
                                                color: '#ffffff',
                                                opacity: 0.8,
                                                transition: 'opacity 0.3s ease-in-out'
                                        }}>
                                                <span>Loading demo...</span>
                                        </div>
                                )}
                        </PlaygroundContainer>
                </div>
        )
}
