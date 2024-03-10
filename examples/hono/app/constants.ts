export const DELAYED_COMPILE_MS = 1000

export const DefaultFragmentShader = `
precision highp float;
uniform vec2 iResolution;

void main() {
  gl_FragColor = vec4(fract(gl_FragCoord.xy / iResolution), 0, 1);
}
`.trim()
