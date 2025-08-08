Animation/Easing Functions の demo code は以下を参考に、`linearIn` の部分 2 箇所をそれぞれの easing 関数に書き換えて使用してください

```msx
<FragmentEditor
        isFun
        code={`
const fragment = () => {
    const w = 0.01
    const t = iTime.fract()
    const y = linearIn(t)
    const Y = linearIn(uv.x)
    const a = vec3(0.1, 0.9, 0.3)
    const b = vec3(0.8, 0.9, 0.7)
    const c = a.mix(b, t).mul(uv.x.step(t))
    const lines = mmin2(smoothstep(0, w, uv.mod(0.1).min(uv.sub(vec2(t, y)).abs())))
    const curve = stroke(uv.y.sub(Y), 0, w).mul(c)
    const color = lines.oneMinus().mul(0.2).add(curve)
    return vec4(color, 1)

}`}
/>
```

## Animation/Easing Functions

- [x] `animation/easing/backIn.glsl` → TSL
- [ ] `animation/easing/backInOut.glsl` → TSL
- [ ] `animation/easing/backOut.glsl` → TSL
- [ ] `animation/easing/bounceIn.glsl` → TSL
- [ ] `animation/easing/bounceInOut.glsl` → TSL
- [ ] `animation/easing/bounceOut.glsl` → TSL
- [ ] `animation/easing/circularIn.glsl` → TSL
- [ ] `animation/easing/circularInOut.glsl` → TSL
- [ ] `animation/easing/circularOut.glsl` → TSL
- [ ] `animation/easing/cubicIn.glsl` → TSL
- [ ] `animation/easing/cubicInOut.glsl` → TSL
- [ ] `animation/easing/cubicOut.glsl` → TSL
- [ ] `animation/easing/elasticIn.glsl` → TSL
- [ ] `animation/easing/elasticInOut.glsl` → TSL
- [ ] `animation/easing/elasticOut.glsl` → TSL
- [ ] `animation/easing/exponentialIn.glsl` → TSL
- [ ] `animation/easing/exponentialInOut.glsl` → TSL
- [ ] `animation/easing/exponentialOut.glsl` → TSL
- [ ] `animation/easing/linearIn.glsl` → TSL
- [ ] `animation/easing/linearInOut.glsl` → TSL
- [ ] `animation/easing/linearOut.glsl` → TSL
- [ ] `animation/easing/quadraticIn.glsl` → TSL
- [ ] `animation/easing/quadraticInOut.glsl` → TSL
- [ ] `animation/easing/quadraticOut.glsl` → TSL
- [ ] `animation/easing/quarticIn.glsl` → TSL
- [ ] `animation/easing/quarticInOut.glsl` → TSL
- [ ] `animation/easing/quarticOut.glsl` → TSL
- [ ] `animation/easing/quinticIn.glsl` → TSL
- [ ] `animation/easing/quinticInOut.glsl` → TSL
- [ ] `animation/easing/quinticOut.glsl` → TSL
- [ ] `animation/easing/sineIn.glsl` → TSL
- [ ] `animation/easing/sineInOut.glsl` → TSL
- [ ] `animation/easing/sineOut.glsl` → TSL

## Color Functions

- [x] `draw/fill.glsl` → TSL
- [x] `draw/stroke.glsl` → TSL
- [x] `draw/line.glsl` → TSL
- [x] `draw/rect.glsl` → TSL
- [x] `draw/circle.glsl` → TSL
- [x] `draw/tri.glsl` → TSL
- [x] `draw/point.glsl` → TSL
- [x] `draw/arrows.glsl` → TSL
- [x] `draw/axis.glsl` → TSL
- [x] `draw/bridge.glsl` → TSL
- [x] `draw/char.glsl` → TSL
- [ ] `draw/colorChecker.glsl` → TSL
- [ ] `draw/colorPicker.glsl` → TSL
- [ ] `draw/digits.glsl` → TSL
- [x] `draw/flip.glsl` → TSL
- [x] `draw/hex.glsl` → TSL
- [ ] `draw/matrix.glsl` → TSL

- [x] `color/blend/add.glsl` → TSL
- [ ] `color/blend/multiply.glsl` → TSL
- [ ] `color/blend/screen.glsl` → TSL
- [ ] `color/blend/overlay.glsl` → TSL
- [ ] `color/blend/difference.glsl` → TSL
- [ ] `color/palette/heatmap.glsl` → TSL
- [ ] `color/palette/fire.glsl` → TSL
