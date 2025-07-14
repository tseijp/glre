import React from 'react'
import ReactLiveScope from '../ReactLiveScope'
// @ts-ignore
import PlaygroundProvider from '@theme/Playground/Provider' // @ts-ignore
import PlaygroundContainer from '@theme/Playground/Container' // @ts-ignore
import PlaygroundPreview from '@theme/Playground/Preview' // @ts-ignore
import PlaygroundEditor from '@theme/Playground/Editor'
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
        const [ref, isInView] = useInView({ threshold: 0.1 })
        const height = 256 + 87 // canvas + padding

        return (
                <div ref={ref}>
                        <PlaygroundContainer>
                                <PlaygroundProvider
                                        code={code}
                                        transformCode={transformCode.bind(null, isFun)}
                                        scope={ReactLiveScope}
                                        {...props}
                                >
                                        <PlaygroundEditor />
                                        {isInView ? (
                                                <PlaygroundPreview />
                                        ) : (
                                                <div
                                                        style={{
                                                                height: `${height}px`,
                                                                borderRadius: '0 0 6.4px',
                                                                backgroundColor: 'rgba(255, 255, 255, 0.1)', // Dark background like canvas
                                                                transition: 'opacity 0.3s ease-in-out',
                                                        }}
                                                />
                                        )}
                                </PlaygroundProvider>
                        </PlaygroundContainer>
                </div>
        )
}
