---
marp: true
hide_table_of_contents: true
title: 'Installation'
description: 'Installation'
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

# Installation

```ruby
npm i glre
```

or

```ruby
yaan add glre
```

## Install from CDN or static hosting

```html
<canvas id="id" style="top: 0; left: 0; position: fixed" />
<script type="module">
        import self from 'https://cdn.skypack.dev/glre@latest'
        const fragment = `
          precision highp float;
          uniform vec2 iResolution;
          void main() {
            gl_FragColor = vec4(fract(gl_FragCoord.xy / iResolution), 0, 1);
          }
        `
        function setup() {
                const el = document.getElementById('id')
                const gl = el.getContext('webgl2')
                self({ el, gl, fragment })
                self.init()
                self.resize()
                draw()
        }
        function draw() {
                requestAnimationFrame(draw)
                self.render()
                self.clear()
                self.viewport()
                self.drawArrays()
        }
        document.addEventListener('DOMContentLoaded', setup)
</script>
```
