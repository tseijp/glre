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
<script type="module">
        import createGL from 'https://esm.sh/glre'
        import { vec4, fract, position, iResolution } from 'https://esm.sh/glre/node'
        const fs = vec4(fract(position.xy.div(iResolution)), 0, 1)
        const el = document.createElement('canvas')
        createGL({ el, fs }).mount()
        document.body.append(el)
</script>
```
