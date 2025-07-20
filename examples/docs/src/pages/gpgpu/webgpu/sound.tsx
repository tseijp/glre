import { useGL } from 'glre/src/react'
import { useEffect, useRef } from 'react'

const soundCompute = `
@group(0) @binding(0) var<uniform> iTime: f32;
@group(2) @binding(0) var<storage, read_write> audioBuffer: array<f32>;
@compute @workgroup_size(64)
fn main(@builtin(global_invocation_id) global_invocation_id: vec3u) {
        var index = global_invocation_id.x;
        if (index >= arrayLength(&audioBuffer)) { return; }
        var t = iTime + f32(index) * 0.0001;
        var freq = 3.14159 * 12;
        audioBuffer[index] = sin(3.14159 * freq * t);
}
`

const visualFragment = `
@group(0) @binding(0) var<uniform> iResolution: vec2f;
@group(2) @binding(0) var<storage, read_write> audioBuffer: array<f32>;
@fragment
fn main(@builtin(position) position: vec4f) -> @location(0) vec4f {
        var uv = position.xy / iResolution;
        var bufferSize = arrayLength(&audioBuffer);
        var index = u32(uv.x * f32(bufferSize)) % bufferSize;
        var amplitude = audioBuffer[index];
        var waveY = 0.5 + amplitude * 0.3;
        var distFromWave = abs(uv.y - waveY);
        var isWaveform = step(distFromWave, 0.005);
        var background = vec3f(0.1, 0.1, 0.2);
        var waveColor = vec3f(1.0, 0.8, 0.0);
        return vec4f(mix(background, waveColor, isWaveform), 1.0);
}
`

export default function () {
        const ctxRef = useRef<AudioContext>(null!)
        const intervalRef = useRef<NodeJS.Timeout>(null!)

        const gl = useGL({
                count: 3,
                isWebGL: false,
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
                                const device = gl.webgpu.device
                                const { buffer } = gl.webgpu.storages('audioBuffer')!

                                const readBuffer = device.createBuffer({ size: audioBuffer.byteLength, usage: 9 })

                                const encoder = device.createCommandEncoder()
                                encoder.copyBufferToBuffer(buffer, 0, readBuffer, 0, audioBuffer.byteLength)
                                device.queue.submit([encoder.finish()])

                                await readBuffer.mapAsync(1)
                                const data = new Float32Array(readBuffer.getMappedRange())
                                audioBuffer.set(data)
                                readBuffer.unmap()
                                readBuffer.destroy()

                                const webAudioBuffer = ctx.createBuffer(1, bufferSize, 44100)
                                const channelData = webAudioBuffer.getChannelData(0)
                                channelData.set(audioBuffer)

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
                        <p>Click to start GPU audio</p>
                </div>
        )
}
