---
hide_table_of_contents: true
title: 'Creating a scene'
description: 'Creating a scene'
image: https://github.com/tseijp.png
keywords:
        [
                glsl,
                webgl,
                hooks,
                react,
                reactjs,
                reactive,
                solid,
                solidjs,
                typescript,
        ]
date: 2023-01-01
---

# Creating a scene

The goal of this section is to give a brief introduction to glre.js.
We will start by setting up a scene, with a spinning cube.

- Based on: [Ray marching cube minus sphere][ref]
- Result: [glre rotate cube test2 - CodeSandbox][demo]

[ref]: https://www.shadertoy.com/view/4tBGDt
[demo]: https://codesandbox.io/s/glre-rotate-cube-test2-8kycuh

## Before we started

Before you can use glre.js, you need somewhere to display it.
Save the following HTML to a file on your computer.

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
import createGL from "https://cdn.skypack.dev/glre@latest"

const gl = createGL`
  precision highp float;
  uniform vec2 iResolution; // window size
  uniform vec3 color;       // light color
  uniform vec3 up;          // camera up direction
  uniform vec3 eye;         // camera position
  uniform vec3 focus;       // camera focus point
  uniform float focal;      // camera focal length
```

### Creating Box

```c
  float boxSDF(vec3 p, float side) {
    vec3 d = abs(p) - side;
    return min(max(d.x, max(d.y, d.z)), 0.0) + length(max(d, 0.0));
  }
```

## Setup

- Calculate this particular pixel's normalized coordinates
- Calculate the direction that the ray through this pixel goes
- Calculate eye directions

```c
  void main() {
    vec3 look = normalize(focus - eye);
    vec3 right = normalize(cross(look, up));
    vec2 scr = gl_FragCoord.xy - 0.5 * iResolution;
    vec3 dir = normalize(focal * look + scr.x * right + scr.y * up);
```

## Ray march

```c
    vec3 p = eye + dir;
    vec3 e = vec3(0.0005, 0.0, 0.0);
    float d = boxSDF(p, 50.0);

    for (int i = 0; i < 256; i++) {
      if (d <= e.x) {
        float x = boxSDF(p + e.xyy, 50.0) - d;
        float y = boxSDF(p + e.yxx, 50.0) - d;
        float z = boxSDF(p + e.yyx, 50.0) - d;
        float lighting = dot(normalize(eye), normalize(vec3(x, y, z)));
        float lighting = dot(normalize(eye), normalize(normal - d));
        gl_FragColor = vec4(color, 1.0) * lighting;
        return;
      }
      p = p + d * normalize(dir);
      d = boxSDF(p, 50.0);
    }
    gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
  }
`;
```

## Rendering the scene

```ts
gl.setFrame(() => {
        gl.clear()
        gl.viewport()
        gl.drawArrays()
        return true
})
```

## Animating the cube

```ts
gl.setFrame(() => {
        const t = performance.now() / 1000
        const x = 200 * Math.cos(t)
        const z = 200 * Math.sin(t)
        gl.setUniform({ eye: [x, 0, z] })
        return true
})
```

## setUniform

```ts
gl.setUniform({
        focal: 500,
        up: [0, 1, 0],
        focus: [0, 0, 0],
        color: [0, 1, 0],
})
```

## Create your app

```ts
const style = { top: 0, left: 0, position: 'fixed' }
Object.assign(document.getElementById(gl.id).style, style)
document.addEventListener('DOMContentLoaded', gl.mount)
```

## The result

```html
<!DOCTYPE html>
<html>
        <body>
                <canvas id="myCanvas"></canvas>
                <script type="module">
                        import createGL from 'https://cdn.skypack.dev/glre@latest'

                        // Creating the scene
                        const gl = createGL`
      precision highp float;
      uniform vec2 iResolution; // window size
      uniform vec3 color;       // light color
      uniform vec3 up;          // camera up direction
      uniform vec3 eye;         // camera position
      uniform vec3 focus;       // camera focus point
      uniform float focal;      // camera focal length

      // Creating Box
      float boxSDF(vec3 p, float side) {
        vec3 d = abs(p) - side;
        return min(max(d.x, max(d.y, d.z)), 0.0) + length(max(d, 0.0));
      }

      void main() {
        // Setup
        vec3 look = normalize(focus - eye);
        vec3 right = normalize(cross(look, up));
        vec2 scr = gl_FragCoord.xy - 0.5 * iResolution;
        vec3 dir = normalize(focal * look + scr.x * right + scr.y * up);

        // Ray marching
        vec3 p = eye + dir;
        vec3 e = vec3(0.0005, 0.0, 0.0);
        float d = boxSDF(p, 50.0);

        for (int i = 0; i < 50; i++) {
          if(d <= e.x) {
            float x = boxSDF(p + e.xyy, 50.0) - d;
            float y = boxSDF(p + e.yxx, 50.0) - d;
            float z = boxSDF(p + e.yyx, 50.0) - d;
            float lighting = dot(normalize(eye), normalize(vec3(x, y, z)));
            gl_FragColor = vec4(color, 1.0) * lighting;
            return;
          }
          p = p + d * normalize(dir);
          d = boxSDF(p, 50.0);
        }
        gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
      }
    `

                        gl.setFrame(() => {
                                gl.clear()
                                gl.viewport()
                                gl.drawArrays()
                                return true
                        })

                        gl.setFrame(() => {
                                const t = performance.now() / 1000
                                const x = 200 * Math.cos(t)
                                const z = 200 * Math.sin(t)
                                gl.setUniform({ eye: [x, 0, z] })
                                return true
                        })

                        gl.setUniform({
                                focal: 500,
                                up: [0, 1, 0],
                                focus: [0, 0, 0],
                                color: [0, 1, 0],
                        })

                        const style = { top: 0, left: 0, position: 'fixed' }
                        Object.assign(
                                document.getElementById(gl.id).style,
                                style
                        )
                        document.addEventListener('DOMContentLoaded', gl.mount)
                </script>
        </body>
</html>
```
