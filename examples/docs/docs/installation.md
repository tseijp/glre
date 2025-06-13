---
marp: true
hide_table_of_contents: true
title: 'Installation'
description: 'Installation'
image: https://github.com/tseijp.png
keywords: [glsl, webgl, hooks, react, reactjs, reactive, solid, solidjs, typescript]
date: 2023-01-01
---

# Installation

```ruby
npm i glre
```

or

```ruby
yarn add glre
```

## Install from CDN or static hosting

```html
<canvas id="id" style="top: 0; left: 0; position: fixed" />
<script type="module">
        import { createGL } from 'https://esm.sh/glre'
        const frag = `
          #version 300 es
          precision highp float;
          uniform vec2 iResolution;
          out vec4 fragColor;
          void main() {
            fragColor = vec4(fract(gl_FragCoord.xy / iResolution), 0, 1);
          }
        `
        function App() {
                const el = document.getElementById('id')
                createGL({ el, frag }).mount()
        }
        document.addEventListener('DOMContentLoaded', App)
</script>
```
