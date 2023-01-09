# glre

## GLSL Reactive Engine

This is a simple GLSL reactive engine. It is a work in progress.

## Usage

```ts
import gl from "glre";

const { mount } = gl("myCanvas")`
  precision highp float;
  uniform vec2 resolution;
  void main() {
    gl_FragColor = vec4(fract(gl_FragCoord.xy / resolution), 0, 1);
  }
`;

widow.addEventListener("DOMContentLoaded", mount);
```

## Getting started

```tsx
import { createRoot } from 'react-dom/client'
import { useGL, useFrame } from "@glre/react"

const App = () => {
  const gl = useGL("myCanvas")`
    precision highp float;
    uniform vec2 resolution;
    void main() {
      gl_FragColor = vec4(fract(gl_FragCoord.xy / resolution), 0, 1);
    }
  `;

  useFrame(() => {
    gl.clear();
    gl.viewport();
    gl.drawArrays();
  })

  return <canvas id="myCanvas" />
}

createRoot(getElementById('root')).render(<App />)
```
