# glre

## GLSL Reactive Engine

This is a simple GLSL reactive engine. It is a work in progress.

## Usage

```ts
import gl from "glre";

gl`
  void main() {
    gl_FragColor = vec4(1.0);
  }
`;

gl.render("#myCanvas");
```

## Getting started

```tsx
import { createRoot } from 'react-dom/client'
import useGL from "@glre/react"

const App = () => {
  useGL("myCanvas")`
    void main() {
      gl_FragColor = vec4(1.0);
    }
  `;
  return <canvas id="myCanvas" />
}

createRoot(getElementById('root')).render(<App />)
```
