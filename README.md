# 🌇 glre

<strong>
<samp>

<p align="center">

[![ npm version ](
    https://img.shields.io/npm/v/glre?style=flat&colorA=000&colorB=000)](
    https://www.npmjs.com/package/glre)
[![ downloads ](
    https://img.shields.io/npm/dm/glre.svg?style=flat&colorA=000&colorB=000)](
    https://www.npmtrends.com/glre)
[![ license MIT ](
    https://img.shields.io/npm/l/glre?style=flat&colorA=000&colorB=000)](
    https://github.com/tseijp/glre)
[![ docs available ](
    https://img.shields.io/badge/docs-available-000.svg?style=flat&colorA=000)](
    https://glre.tsei.jp/>)
[![ bundle size ](
    https://img.shields.io/bundlephobia/minzip/glre?style=flat&colorA=000&colorB=000)](
    https://bundlephobia.com/package/glre@latest)

glre is a simple glsl Reactive Engine on the web and native via TypeScript, React, Solid and more.

</p>
<p align="center" valign="top">
  <a href="https://codesandbox.io/s/glre-test1-skyl9p">
    <img alt="1" width="256" src="https://user-images.githubusercontent.com/40712342/212297558-15a1e721-55d6-4b6f-aab4-9f5d7cede2cb.gif"></img>
  </a>
  <a href="https://codesandbox.io/s/glre-test2-c1syho">
    <img alt="2" width="256" src="https://user-images.githubusercontent.com/40712342/212297576-e12cef1b-b0e0-40cb-ac0f-7fb387ae6da8.gif"></img>
  </a>
  <a href="https://codesandbox.io/s/glre-test3-ntlk3l">
    <img alt="3" width="256" src="https://user-images.githubusercontent.com/40712342/212297587-0227d536-5cef-447a-be3e-4c93dad002a2.gif"></img>
  </a>
</p>

## Installation

```ruby
npm install glre
```

<table>
<td width="1000px" valign="top">

## Documentation

###### [Docs][docs] : glre Introduction

###### [API][api] : glre API and feature

###### [Guide][guide] : Creating a scene

[docs]: https://glre.tsei.jp/docs
[api]: https://glre.tsei.jp/api
[guide]: https://glre.tsei.jp/guide

</td>
<td width="1000px" valign="top">

## Ecosystem

###### ⛪️ [reev][reev]: reactive event state manager

###### 🌃 [refr][refr]: request animation frame

[reev]: https://github.com/tseijp/reev
[refr]: https://github.com/tseijp/refr

</td>
<td width="1000px" valign="top">

## Staying informed

###### [github discussions][github] welcome✨

###### [@tseijp][twitter] twitter

###### [tsei.jp][articles] articles

[github]: https://github.com/tseijp/glre/discussions
[twitter]: https://twitter.com/tseijp
[articles]: https://tsei.jp/articles

</td>
</table>

## PRs

###### welcome✨

## What does it look like?

<table>
  <tr>
    <td width="7500px" align="center" valign="center">
      glre simplifies glsl programming via TypeScript, React, Solid and more (<a href="https://codesandbox.io/s/glre-basic-demo-ppzo3d">live demo</a>).
    </td>
    <td width="2500px" valign="top">
      <a href="https://codesandbox.io/s/glre-basic-demo-ppzo3d">
        <img alt="4" src="https://i.imgur.com/Lb3h9fs.jpg"></img>
      </a>
    </td>
  </tr>
</table>

```ts
import { createRoot } from "react-dom/client";
import { useGL, useFrame } from "@glre/react";

const App = (props) => {
  const gl = useGL()`
    precision highp float;
    uniform vec2 iResolution;
    void main() {
      gl_FragColor = vec4(fract(gl_FragCoord.xy / iResolution), 0, 1);
    }
  `;
  useFrame(() => {
    gl.clear();
    gl.viewport();
    gl.drawArrays();
  });
  return <canvas id={gl.id} {...props} />;
};

const style = { top: 0, left: 0, position: "fixed" };
createRoot(document.getElementById("root")).render(<App style={style} />);
```

<details>
<summary>pure js supported</summary>

```html
<!DOCTYPE html>
<html>
  <body>
    <script type="module">
      import createGL from "https://cdn.skypack.dev/glre@latest"
      const gl = createGL`
        precision highp float;
        uniform vec2 resolution;
        void main() {
          gl_FragColor = vec4(fract(gl_FragCoord.xy / resolution), 0, 1);
        }
      `;

      gl.setFrame(() => {
        gl.clear();
        gl.viewport();
        gl.drawArrays();
        return true;
      });

      const style = { top: 0, left: 0, position: "fixed" };
      const canvas = document.createElement("canvas");
      Object.assign(canvas, { id: gl.id });
      Object.assign(canvas.style, style);
      document.body.append(canvas);
      window.addEventListener("DOMContentLoaded", gl.mount);
    </script>
  </body>
</html>
```

</details>
</samp>
</strong>
