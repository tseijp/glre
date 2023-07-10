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
<canvas id="myCanvas"></canvas>
<script type="module">
        import self from 'https://cdn.skypack.dev/glre@0.15.0'

        // Our GLSL and Javascript will go here.
        const frag = `
                ...
        `

        document.addEventListener('DOMContentLoaded', setup)

        function setup() {
                // ...
        }
        function draw() {
                // ...
        }
</script>
```

## Creating Fragment Shader

```c
precision highp float;
uniform vec2 iResolution; // canvas size
uniform vec3 up;          // camera up direction
uniform vec3 eye;         // camera position
uniform vec3 focus;       // camera focus point
uniform float focal;      // camera focal length
uniform float size;       // object size
```

### Creating Box

```c
float boxSDF(vec3 p, float side) {
        vec3 d = abs(p) - side;
        return min(max(d.x, max(d.y, d.z)), 0.0) + length(max(d, 0.0));
}
```

## Raymarch Setup

- Calculate this particular pixel's normalized coordinates
- Calculate the direction that the ray through this pixel goes
- Calculate eye directions

```c
void main() {
        /**
         * Ray marching setup
         */
        vec3 look = normalize(focus - eye);
        vec3 right = normalize(cross(look, up));
        vec2 scr = gl_FragCoord.xy - 0.5 * iResolution;
        vec3 dir = normalize(focal * look + scr.x * right + scr.y * up);
        /**
        * Ray marching
        */
        vec3 p = eye + dir;
        vec3 e = vec3(0.0005, 0.0, 0.0);
        float d = boxSDF(p, size);
        for (int i = 0; i < 50; i++) {
                if (d <= e.x) {
                        float dx = boxSDF(p + e.xyy, size) - d;
                        float dy = boxSDF(p + e.yxx, size) - d;
                        float dz = boxSDF(p + e.yyx, size) - d;
                        vec3 norm = normalize(vec3(dx, dy, dz));
                        gl_FragColor = vec4(norm * 0.5 + 0.5, 1.);
                        return;
                }
                p = p + d * normalize(dir);
                d = boxSDF(p, size);
        }
}
```

## Setup glre

```ts
document.addEventListener('DOMContentLoaded', setup)

function setup() {
        self.el = document.getElementById('id')
        self.gl = self.el.getContext('webgl2')
        self.frag = frag
        self.init()
        self.resize()
        self.uniform({
                up: [0, 1, 0],
                focus: [0, 0, 0],
                focal: 500,
                size: 50,
        })
        draw()
}
```

## Rendering the scene

```ts
function draw() {
        requestAnimationFrame(draw)
        const t = performance.now() / 1000
        const x = 200 * Math.cos(t)
        const z = 200 * Math.sin(t)
        self.uniform({ eye: [x, 0, z] })
        self.render()
        self.viewport()
        self.clear()
        self.drawArrays()
}
```

## The result

```html
<canvas id="id" style="top: 0; left: 0; position: fixed" />
<script type="module">
        import self from 'https://cdn.skypack.dev/glre@0.15.0'
        const frag = `
                precision highp float;
                uniform vec2 iResolution; // canvas size
                uniform vec3 up;          // camera up direction
                uniform vec3 eye;         // camera position
                uniform vec3 focus;       // camera focus point
                uniform float focal;      // camera focal length
                uniform float size;       // object size
                /**
                 * boxSDF
                 */
                float boxSDF(vec3 p, float side) {
                        vec3 d = abs(p) - side;
                        return min(max(d.x, max(d.y, d.z)), 0.0) + length(max(d, 0.0));
                }
                /**
                 * main
                 */
                void main() {
                        /**
                         * Ray marching setup
                         */
                        vec3 look = normalize(focus - eye);
                        vec3 right = normalize(cross(look, up));
                        vec2 scr = gl_FragCoord.xy - 0.5 * iResolution;
                        vec3 dir = normalize(focal * look + scr.x * right + scr.y * up);
                        /**
                         * Ray marching
                         */
                        vec3 p = eye + dir;
                        vec3 e = vec3(0.0005, 0.0, 0.0);
                        float d = boxSDF(p, size);
                        for (int i = 0; i < 50; i++) {
                                if (d <= e.x) {
                                        float dx = boxSDF(p + e.xyy, size) - d;
                                        float dy = boxSDF(p + e.yxx, size) - d;
                                        float dz = boxSDF(p + e.yyx, size) - d;
                                        vec3 norm = normalize(vec3(dx, dy, dz));
                                        gl_FragColor = vec4(norm * 0.5 + 0.5, 1.);
                                        return;
                                }
                                p = p + d * normalize(dir);
                                d = boxSDF(p, size);
                        }
                }
        `

        document.addEventListener('DOMContentLoaded', setup)

        function setup() {
                self.el = document.getElementById('id')
                self.gl = self.el.getContext('webgl2')
                self.frag = frag
                self.init()
                self.resize()
                self.uniform({
                        up: [0, 1, 0],
                        focus: [0, 0, 0],
                        focal: 500,
                        size: 50,
                })
                draw()
        }

        function draw() {
                requestAnimationFrame(draw)
                const t = performance.now() / 1000
                const x = 200 * Math.cos(t)
                const z = 200 * Math.sin(t)
                self.uniform({ eye: [x, 0, z] })
                self.render()
                self.viewport()
                self.clear()
                self.drawArrays()
        }
</script>
```
