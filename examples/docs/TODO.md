# GLSL から TSL プロジェクト TODO チェックリスト

## 第一段階：基礎数学関数群 (57 ファイル)

### math/ ディレクトリ基本関数 (26 ファイル)

- [x] `aafloor.glsl` → TSL
- [x] `aafract.glsl` → TSL
- [x] `aamirror.glsl` → TSL
- [x] `aastep.glsl` → TSL
- [x] `absi.glsl` → TSL
- [x] `adaptiveThreshold.glsl` → TSL
- [x] `atan2.glsl` → TSL
- [x] `bump.glsl` → TSL
- [x] `const.glsl` → TSL
- [x] `cubic.glsl` → TSL
- [x] `cubicMix.glsl` → TSL
- [x] `decimate.glsl` → TSL
- [x] `dist.glsl` → TSL
- [x] `fcos.glsl` → TSL
- [x] `frac.glsl` → TSL
- [x] `gain.glsl` → TSL
- [x] `gaussian.glsl` → TSL
- [x] `grad4.glsl` → TSL
- [x] `hammersley.glsl` → TSL
- [x] `highPass.glsl` → TSL
- [x] `inside.glsl` → TSL
- [x] `invCubic.glsl` → TSL
- [x] `inverse.glsl` → TSL
- [x] `invQuartic.glsl` → TSL
- [x] `lengthSq.glsl` → TSL
- [x] `lerp.glsl` → TSL

### math/ ディレクトリ演算関数 (20 ファイル)

- [x] `map.glsl` → TSL
- [x] `mirror.glsl` → TSL
- [x] `mmax.glsl` → TSL
- [x] `mmin.glsl` → TSL
- [x] `mmix.glsl` → TSL
- [x] `mod289.glsl` → TSL
- [x] `mod2.glsl` → TSL
- [x] `modi.glsl` → TSL
- [x] `nyquist.glsl` → TSL
- [x] `pack.glsl` → TSL
- [x] `parabola.glsl` → TSL
- [x] `permute.glsl` → TSL
- [x] `pow2.glsl` → TSL
- [x] `pow3.glsl` → TSL
- [x] `pow5.glsl` → TSL
- [x] `pow7.glsl` → TSL
- [x] `powFast.glsl` → TSL
- [x] `quartic.glsl` → TSL
- [x] `quintic.glsl` → TSL

### math/ ディレクトリ変換関数 (11 ファイル)

- [x] `saturate.glsl` → TSL
- [x] `saturateMediump.glsl` → TSL
- [x] `scale2d.glsl` → TSL
- [x] `scale3d.glsl` → TSL
- [x] `scale4d.glsl` → TSL
- [x] `smootherstep.glsl` → TSL
- [x] `sum.glsl` → TSL (SKIPPED)
- [x] `taylorInvSqrt.glsl` → TSL
- [x] `toMat3.glsl` → TSL
- [x] `toMat4.glsl` → TSL

### math/ ディレクトリ回転・変換関数 (12 ファイル)

- [x] `rotate2d.glsl` → TSL
- [x] `rotate3d.glsl` → TSL
- [x] `rotate3dX.glsl` → TSL
- [x] `rotate3dY.glsl` → TSL
- [x] `rotate3dZ.glsl` → TSL
- [x] `rotate4d.glsl` → TSL
- [x] `rotate4dX.glsl` → TSL
- [x] `rotate4dY.glsl` → TSL
- [x] `rotate4dZ.glsl` → TSL
- [x] `translate4d.glsl` → TSL
- [x] `transpose.glsl` → TSL (SKIPPED)
- [x] `unpack.glsl` → TSL

### math/quat/ サブディレクトリ (15 ファイル)

- [x] `quat/2mat3.glsl` → TSL
- [x] `quat/2mat4.glsl` → TSL
- [x] `quat/add.glsl` → TSL
- [x] `quat/conj.glsl` → TSL
- [x] `quat/div.glsl` → TSL
- [x] `quat/identity.glsl` → TSL
- [x] `quat/inverse.glsl` → TSL
- [x] `quat/length.glsl` → TSL
- [x] `quat/lengthSq.glsl` → TSL
- [x] `quat/lerp.glsl` → TSL
- [x] `quat/mul.glsl` → TSL
- [x] `quat/neg.glsl` → TSL
- [x] `quat/norm.glsl` → TSL
- [x] `quat/sub.glsl` → TSL
- [x] `quat/type.glsl` → TSL (SKIPPED - TSL では型定義は不要)

## 第二段階：独立基礎関数群 (306 ファイル) - 優先度高

### Phase 2A: 色空間変換基礎 (68 ファイル) - 依存関係なし

- [x] `color/space/hsl2rgb.glsl` → TSL
- [x] `color/space/hsv2rgb.glsl` → TSL
- [x] `color/space/rgb2hsl.glsl` → TSL
- [x] `color/space/rgb2hsv.glsl` → TSL
- [x] `color/space/hue2rgb.glsl` → TSL
- [x] `color/space/rgb2hue.glsl` → TSL
- [x] `color/space/cmyk2rgb.glsl` → TSL
- [x] `color/space/rgb2cmyk.glsl` → TSL
- [x] `color/space/gamma2linear.glsl` → TSL
- [x] `color/space/linear2gamma.glsl` → TSL
- [x] `color/space/srgb2rgb.glsl` → TSL
- [x] `color/space/rgb2srgb.glsl` → TSL
- [x] `color/space/lab2rgb.glsl` → TSL
- [x] `color/space/rgb2lab.glsl` → TSL
- [x] `color/space/xyz2rgb.glsl` → TSL
- [x] `color/space/rgb2xyz.glsl` → TSL
- [x] `color/space/oklab2rgb.glsl` → TSL
- [x] `color/space/rgb2oklab.glsl` → TSL
- [x] `color/space/lch2rgb.glsl` → TSL
- [x] `color/space/rgb2lch.glsl` → TSL
- [x] `color/space/yuv2rgb.glsl` → TSL
- [x] `color/space/rgb2yuv.glsl` → TSL
- [x] `color/space/yiq2rgb.glsl` → TSL
- [x] `color/space/rgb2yiq.glsl` → TSL

### Phase 2B: アニメーション基礎 (88 ファイル) - 依存関係なし

- [x] `animation/easing/linearIn.glsl` → TSL
- [x] `animation/easing/linearOut.glsl` → TSL
- [x] `animation/easing/linearInOut.glsl` → TSL
- [x] `animation/easing/quadraticIn.glsl` → TSL
- [x] `animation/easing/quadraticOut.glsl` → TSL
- [x] `animation/easing/quadraticInOut.glsl` → TSL
- [x] `animation/easing/cubicIn.glsl` → TSL
- [x] `animation/easing/cubicOut.glsl` → TSL
- [x] `animation/easing/cubicInOut.glsl` → TSL
- [x] `animation/easing/quarticIn.glsl` → TSL
- [x] `animation/easing/quarticOut.glsl` → TSL
- [x] `animation/easing/quarticInOut.glsl` → TSL
- [x] `animation/easing/quinticIn.glsl` → TSL
- [x] `animation/easing/quinticOut.glsl` → TSL
- [x] `animation/easing/quinticInOut.glsl` → TSL
- [x] `animation/easing/exponentialIn.glsl` → TSL
- [x] `animation/easing/exponentialOut.glsl` → TSL
- [x] `animation/easing/exponentialInOut.glsl` → TSL
- [x] `animation/easing/circularIn.glsl` → TSL
- [x] `animation/easing/circularOut.glsl` → TSL
- [x] `animation/easing/circularInOut.glsl` → TSL

### Phase 2C: SDF 基本図形 (42 ファイル) - 依存関係なし

- [ ] `sdf/sphereSDF.glsl` → TSL
- [ ] `sdf/boxSDF.glsl` → TSL
- [ ] `sdf/planeSDF.glsl` → TSL
- [ ] `sdf/circleSDF.glsl` → TSL
- [ ] `sdf/rectSDF.glsl` → TSL
- [ ] `sdf/triSDF.glsl` → TSL
- [ ] `sdf/hexSDF.glsl` → TSL
- [ ] `sdf/torusSDF.glsl` → TSL
- [ ] `sdf/cylinderSDF.glsl` → TSL
- [ ] `sdf/coneSDF.glsl` → TSL
- [ ] `sdf/ellipsoidSDF.glsl` → TSL
- [ ] `sdf/octahedronSDF.glsl` → TSL
- [ ] `sdf/tetrahedronSDF.glsl` → TSL
- [ ] `sdf/heartSDF.glsl` → TSL
- [ ] `sdf/arrowSDF.glsl` → TSL
- [ ] `sdf/flowerSDF.glsl` → TSL
- [ ] `sdf/boxFrameSDF.glsl` → TSL
- [ ] `sdf/hexPrismSDF.glsl` → TSL
- [ ] `sdf/triPrismSDF.glsl` → TSL
- [ ] `sdf/octogonPrismSDF.glsl` → TSL
- [ ] `sdf/linkSDF.glsl` → TSL
- [ ] `sdf/opElongate.glsl` → TSL
- [ ] `sdf/opOnion.glsl` → TSL
- [ ] `sdf/opExtrude.glsl` → TSL

### Phase 2D: ジオメトリ基礎 (108 ファイル)

- [ ] `geometry/triangle/area.glsl` → TSL
- [ ] `geometry/triangle/centroid.glsl` → TSL
- [ ] `geometry/triangle/normal.glsl` → TSL
- [ ] `geometry/aabb/centroid.glsl` → TSL
- [ ] `geometry/aabb/diagonal.glsl` → TSL
- [ ] `space/aspect.glsl` → TSL
- [ ] `space/center.glsl` → TSL
- [ ] `space/uncenter.glsl` → TSL
- [ ] `space/ratio.glsl` → TSL
- [ ] `space/unratio.glsl` → TSL
- [ ] `space/cart2polar.glsl` → TSL
- [ ] `space/polar2cart.glsl` → TSL
