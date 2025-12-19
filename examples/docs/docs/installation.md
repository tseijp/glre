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
        import { createGL } from 'https://esm.sh/glre'
        import { vec4, uv } from 'https://esm.sh/glre/node'
        createGL({ fs: vec4(uv, 0, 1) }).mount()
</script>
```
