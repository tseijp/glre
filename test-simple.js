const { Fn, vec4, fract, position, iResolution, fragment } = require('./packages/core/dist/node');

// Test 1: 関数定義と呼び出しのテスト
const _frag = Fn(([uv]) => vec4(uv, 0, 1));
const frag = _frag(fract(position.xy.div(iResolution)));

// WebGL用のコード生成
console.log('=== WebGL Test ===');
const glslCode = fragment(frag, { isWebGL: true });