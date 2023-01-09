---
marp: true
hide_table_of_contents: true
title: "Loading textures"
description: "Loading textures"
image: https://github.com/tseijp.png
keywords: [glsl, webgl, hooks, react, reactjs, reactive, solid, solidjs, typescript]
date: 2023-01-01
---

# Loading textures

## Before we started

## Creating fragment and vertex shader

```tsx
const vert = `
  attribute vec3 position;
  attribute vec2 texCoord;
  varying vec2 vTexCoord;
  void main() {
    vTexCoord = texCoord;
    gl.Position = vec4(position, 1);
    gl.PointSize = 10.0;
  }
`

const frag = `
  uniform sampler2D textureUnit;
  varying vec2 vTexCoord;
  uniform vec4 color;
  void main() {
    gl.FragColor = texture2D(textureUnit, vTexCoord);
    gl.FragColor += color;
  }
`
```

## Set uniform and attribute

```tsx
const textureUnit = 'https://i.imgur.com/XXXXX.png'
const color = [21, 21, 21, 1]
const position = [-1, 1, 0, 1, 1, 0, -1, -1, 0, 1, -1, 0];
const texCoord = [0, 0, 1, 0, 0, 1, 1, 1];
const indices = [0, 1, 2, 2, 1, 3];

const App = (props) => {
  const gl = useGL({ frag, vert })
  gl.setTexture({ textureUnit })
  gl.setUniform({ color })
  gl.setAttribute({ position, texCoord }, indices)
```

## Rendering the scene

```tsx
gl.setFrame(() => {
  gl.clear()      // to run gl.clear(gl.COLOR_BUFFER_BIT)
  gl.viewport()   // to run gl.viewport(0, 0, width, height)
  gl.drawArrays() // to run gl.drawArrays(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0)
  return true     // to continue rendering
})
```

## The result

```tsx
import { createRoot } from 'react-dom/client'
import { useGL } from '@glre/react'

const vert = `
  attribute vec3 position;
  attribute vec2 texCoord;
  varying vec2 vTexCoord;
  void main() {
    vTexCoord = texCoord;
    gl.Position = vec4(position, 1);
    gl.PointSize = 10.0;
  }
`

const frag = `
  uniform sampler2D textureUnit;
  varying vec2 vTexCoord;
  void main() {
    gl.FragColor = texture2D(textureUnit, vTexCoord);
  }
`

const textureUnit = '...png'
const position = [-1, 1, 0, 1, 1, 0, -1, -1, 0, 1, -1, 0];
const texCoord = [0, 0, 1, 0, 0, 1, 1, 1];
const indices = [0, 1, 2, 2, 1, 3];

const App = (props) => {
  const gl = useGL({ frag, vert })
  gl.setTexture({ textureUnit })
  gl.setAttribute({ position, texCoord }, indices)
  gl.setFrame(() => {
    gl.clear()      // to run gl.clear(gl.COLOR_BUFFER_BIT)
    gl.viewport()   // to run gl.viewport(0, 0, width, height)
    gl.drawArrays() // to run gl.drawArrays(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0)
    return true     // to continue rendering
  })
  return <canvas id={gl.id} {...props} />
}

const style = { top: 0, left: 0, position: "fixed", background: "#212121" };

createRoot(document.getElementById("root")).render(<App style={style} />);
```
