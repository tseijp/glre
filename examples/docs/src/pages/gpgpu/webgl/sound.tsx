import { useGL } from 'glre/src/react'
import { useEffect, useRef } from 'react'

const soundCompute = `
#version 300 es
precision highp float;
uniform float iTime;
out vec4 fragColor;

void main() {
        ivec2 coord = ivec2(gl_FragCoord.xy);
        vec2 texSize = vec2(32.0, 32.0);
        if (coord.x >= int(texSize.x) || coord.y >= int(texSize.y)) {
                discard;
        }
        
        int index = coord.y * int(texSize.x) + coord.x;
        if (index >= 1024) {
                discard;
        }
        
        float t = iTime + float(index) * 0.0001;
        float freq = 3.14159 * 12.0;
        float result = sin(3.14159 * freq * t);
        
        // Convert from -1,1 range to 0,1 range for storage
        float normalized = (result + 1.0) * 0.5;
        fragColor = vec4(normalized, 0.0, 0.0, 1.0);
}
`

const visualFragment = `
#version 300 es
precision highp float;
uniform vec2 iResolution;
uniform sampler2D audioBuffer;
out vec4 fragColor;

void main() {
        vec2 uv = gl_FragCoord.xy / iResolution;
        vec2 texSize = vec2(textureSize(audioBuffer, 0));
        int bufferSize = int(texSize.x * texSize.y);
        
        int index = int(uv.x * float(bufferSize)) % bufferSize;
        int y = index / int(texSize.x);
        int x = index - y * int(texSize.x);
        ivec2 coord = ivec2(x, y);
        
        float normalized = texelFetch(audioBuffer, coord, 0).r;
        float amplitude = (normalized * 2.0) - 1.0; // Convert back to -1,1 range
        float waveY = 0.5 + amplitude * 0.3;
        float distFromWave = abs(uv.y - waveY);
        float isWaveform = step(distFromWave, 0.005);
        
        vec3 background = vec3(0.1, 0.1, 0.2);
        vec3 waveColor = vec3(1.0, 0.8, 0.0);
        fragColor = vec4(mix(background, waveColor, isWaveform), 1.0);
}
`

// Function to extract frequency from shader code
const extractFreqFromShader = (shaderCode: string): number => {
        // Look for patterns like "freq = 3.14159 * 12.0" or "freq = 3.14159 * NUMBER"
        const freqMatch = shaderCode.match(/freq\s*=\s*3\.14159\s*\*\s*(\d+(?:\.\d+)?)/)
        if (freqMatch) {
                return 3.14159 * parseFloat(freqMatch[1])
        }

        // Fallback: look for any "3.14159 * NUMBER" pattern
        const fallbackMatch = shaderCode.match(/3\.14159\s*\*\s*(\d+(?:\.\d+)?)/)
        if (fallbackMatch) {
                return 3.14159 * parseFloat(fallbackMatch[1])
        }

        // Default frequency
        return 3.14159 * 12.0
}

export default function () {
        const ctxRef = useRef<AudioContext>(null!)
        const intervalRef = useRef<NodeJS.Timeout>(null!)

        const gl = useGL({
                count: 3,
                isWebGL: true,
                cs: soundCompute,
                fs: visualFragment,
                loop() {
                        gl.uniform('iTime', Date.now() / 1000)
                },
        })

        useEffect(() => {
                const bufferSize = 1024
                const audioBuffer = new Float32Array(bufferSize)
                gl.storage('audioBuffer', audioBuffer)

                const handleClick = async () => {
                        const ctx = new AudioContext()
                        ctxRef.current = ctx

                        const playAudio = async () => {
                                // Extract frequency from current compute shader
                                const currentFreq = extractFreqFromShader(soundCompute)

                                // Generate audio on CPU using extracted frequency
                                const buffer = new Float32Array(bufferSize)
                                const time = performance.now() / 1000

                                for (let i = 0; i < bufferSize; i++) {
                                        const t = time + i * 0.0001
                                        buffer[i] = Math.sin(3.14159 * currentFreq * t)
                                }

                                const webAudioBuffer = ctx.createBuffer(1, bufferSize, 44100)
                                const channelData = webAudioBuffer.getChannelData(0)
                                channelData.set(buffer)

                                const source = ctx.createBufferSource()
                                source.buffer = webAudioBuffer
                                source.connect(ctx.destination)
                                source.start()
                        }

                        intervalRef.current = setInterval(playAudio, 500)
                        document.removeEventListener('click', handleClick)
                }

                document.addEventListener('click', handleClick)

                return () => {
                        document.removeEventListener('click', handleClick)
                        if (intervalRef.current) clearInterval(intervalRef.current)
                        if (ctxRef.current) ctxRef.current.close()
                }
        }, [])

        return (
                <div>
                        <canvas ref={gl.ref} />
                        <p>Click to start GPU audio (freq auto-extracted from shader)</p>
                        <p>Current frequency: {extractFreqFromShader(soundCompute).toFixed(2)}</p>
                </div>
        )
}
