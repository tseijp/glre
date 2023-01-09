---
marp: true
hide_table_of_contents: true
title: "Hooks API"
description: "Hooks API"
image: https://github.com/tseijp.png
keywords: [glsl, webgl, hooks, react, reactjs, reactive, solid, solidjs, typescript]
date: 2023-01-01
---

# Hooks API

```ts
// initialize gl
useGL(config: GLConfig): GL

// Schedule an update
useFrame(() => {})

// Start an update loop
useFrame(() => true)

// set uniform
useUniform(uniform: Record<string, number | number[]>): GL

// set texture
useTexture(texture: Record<string, string>): GL

// set attribute
useAttribute(attribute: Record<string, number[]>): GL
```
