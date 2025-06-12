---
marp: true
hide_table_of_contents: true
title: 'Event API'
description: 'Event API'
image: https://github.com/tseijp.png
keywords: [glsl, webgl, hooks, react, reactjs, reactive, solid, solidjs, typescript]
date: 2023-01-01
---

# Event API

```ts
import { createGL } from 'glre'

createGL({
        // init
        init() {},

        // Schedule before rendering
        loop()

        // run when mount phase
        mount() {},

        // run when clean phase
        clean() {},

        // Schedule on rendering
        render() {},

        // mousemove event
        mousemove() {},

        // resize event
        resize() {},
})
```
