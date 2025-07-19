import { useGL } from 'glre/src/react'

const computeShader = `
#version 300 es
precision highp float;
uniform float iTime;
out vec4 fragColor;

void main() {
        ivec2 coord = ivec2(gl_FragCoord.xy);
        float index = float(coord.y * 32 + coord.x);
        float t = iTime + index * 0.1;
        float result = sin(t) * 0.5 + 0.5;
        fragColor = vec4(result, 0.0, 0.0, 1.0);
}
`

const fragmentShader = `
#version 300 es
precision highp float;
uniform vec2 iResolution;
uniform sampler2D data;
out vec4 fragColor;

void main() {
        vec2 uv = gl_FragCoord.xy / iResolution;
        vec2 texSize = vec2(textureSize(data, 0));
        
        float totalElements = texSize.x * texSize.y;
        float indexFloat = uv.x * 1024.0;
        int index = int(mod(indexFloat, 1024.0));
        
        int y = index / int(texSize.x);
        int x = index - y * int(texSize.x);
        ivec2 coord = ivec2(x, y);
        
        float value = texelFetch(data, coord, 0).r;
        fragColor = vec4(value, value * 0.5, 1.0 - value, 1.0);
}
`

export default function () {
        const gl = useGL({
                count: 3,
                isWebGL: true,
                cs: computeShader,
                fs: fragmentShader,
        })

        gl.storage('data', new Float32Array(1024))

        return <canvas ref={gl.ref} />
}