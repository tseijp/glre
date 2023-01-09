---
marp: true
hide_table_of_contents: true
title: "Creating a scene"
description: "Creating a scene"
image: https://github.com/tseijp.png
keywords: [glsl, webgl, hooks, react, reactjs, reactive, solid, solidjs, typescript]
date: 2023-01-01
---

# Creating a scene

## Before we started

```html
<!DOCTYPE html>
<html>
 <body>
  <canvas id="myCanvas"></canvas>
  <script type="module">
   // Our Javascript will go here.
  </script>
 </body>
</html>
```

## Creating the scene

```ts
import gl from "glre"

const { mount } = gl("myCanvas")`
  uniform vec2 mouse;
  void main() {
    gl.FragColor = vec4(mouse, 0.0, 1.0);
  }
`

/*...*/

window.addEventListener("DomContentLoaded", mount)
```

## Rendering the scene

```ts
.setFrame(() => {
  gl.clear()        // to run gl.clear(gl.COLOR_BUFFER_BIT)
  gl.viewport()     // to run gl.viewport(0, 0, width, height)
  gl.drawElements() // to run gl.drawArrays(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0)
  return true       // to continue rendering
})
```

## The result

```html
<!DOCTYPE html>
<html>
 <body>
  <canvas id="myCanvas"></canvas>
  <script type="module">
    import { gl } from "glre"

    const { mount } = gl("myCanvas")`
      uniform vec2 mouse;
      void main() {
        gl.FragColor = vec4(mouse, 0.0, 1.0);
      }
    `.setFrame(() => {
      gl.clear()
      gl.viewport()
      gl.drawElements()
      return true
    })

    window.addEventListener("load", mount)
  </script>
 </body>
</html>
```