# WebGL GPGPU Demos

WebGL2 fallback implementations of WebGPU compute shader demos using texture-based GPGPU techniques.

## Demos

[basic](/gpgpu/webgl/basic) - Basic compute shader simulation using fragment shaders

[flocking](/gpgpu/webgl/flocking) - Boid flocking behavior simulation

[particles](/gpgpu/webgl/particles) - Particle system animation

[sound](/gpgpu/webgl/sound) - Audio waveform generation and visualization

## Implementation Notes

These WebGL2 demos use texture-based GPGPU to simulate WebGPU compute shader functionality:

- Fragment shaders perform compute operations instead of compute shaders
- Ping-pong textures handle read/write operations
- RGBA32F textures store computational data
- Framebuffer objects enable render-to-texture workflows

The WebGL fallback provides equivalent functionality to WebGPU demos while maintaining broader browser compatibility.