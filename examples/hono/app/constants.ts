export const SIDEBAR_FLEX_Z_INDEX_CLASS = 20

export const SIDEBAR_FLEX_WIDTH_CLASS = 80 // 320 px

export const SIDEBAR_FLEX_WIDTH_PIXEL = 320 // 320 px

export const DELAYED_COMPILE_MS = 1000

export const DefaultFragmentShader = `
precision highp float;
uniform vec2 iResolution;

void main() {
  gl_FragColor = vec4(fract(gl_FragCoord.xy / iResolution), 0, 1);
}
`.trim()
