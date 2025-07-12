# Getting Started

Welcome to visual programming with GLRE!

## What is GLRE?

GLRE (GPU Reactive Engine) is a TypeScript library for creating real-time graphics.
You can create beautiful visual effects with just programming knowledge - no need to learn complex technical concepts.

### Traditional Method vs GLRE

| Traditional Method            | GLRE                                 |
| ----------------------------- | ------------------------------------ |
| Learn complex technical terms | Write in TypeScript only             |
| Platform-specific setup       | Automatically optimized for browsers |
| Manual resource management    | Automatic memory management          |
| Confusing error messages      | Clear error messages                 |

### What You Can Create

- 🎨 **Real-time Animation**: Smooth motion and changes
- 🖼️ **Image Processing**: Photo and illustration filters
- 🌟 **Special Effects**: Particles and lighting
- 🎮 **Interactions**: Response to mouse and keyboard
- 📱 **Responsive**: Works on PC and mobile

## Environment Setup

### Minimal Setup

```html
<!DOCTYPE html>
<html>
        <head>
                <title>My First GLRE Project</title>
        </head>
        <body>
                <canvas id="canvas"></canvas>
                <script type="module">
                        import { createGL } from 'https://unpkg.com/glre'

                        const gl = createGL({
                                el: document.getElementById('canvas'),
                        })
                </script>
        </body>
</html>
```

### NPM Project Setup

```bash
# Create project
npm init -y
npm install glre

# TypeScript environment (recommended)
npm install -D typescript @types/node
```

```javascript
// main.js
import { createGL } from 'glre'

const gl = createGL()
console.log('GLRE is working!')
```

## Your First Visual

### Solid Color Screen

Let's start by filling the entire screen with your favorite color.

```javascript
import { createGL, vec4 } from 'glre'

// Create a blue screen
const gl = createGL({
        fragment: () => {
                return vec4(0.2, 0.4, 0.8, 1.0) // Blue color (R, G, B, A)
        },
})
```

### Understanding Colors

Colors are specified using four numbers (RGBA):

| Component     | Meaning        | Range     | Example                |
| ------------- | -------------- | --------- | ---------------------- |
| **R (Red)**   | How much red   | 0.0 - 1.0 | 1.0 = bright red       |
| **G (Green)** | How much green | 0.0 - 1.0 | 1.0 = bright green     |
| **B (Blue)**  | How much blue  | 0.0 - 1.0 | 1.0 = bright blue      |
| **A (Alpha)** | Transparency   | 0.0 - 1.0 | 1.0 = completely solid |

Think of it like mixing paint:

- `vec4(1, 0, 0, 1)` = pure red paint
- `vec4(0, 1, 0, 1)` = pure green paint
- `vec4(1, 1, 0, 1)` = red + green = yellow
- `vec4(0.5, 0.5, 0.5, 1)` = gray (equal amounts of all colors)

```javascript
// Various color examples
const colors = {
        red: vec4(1, 0, 0, 1), // Red
        green: vec4(0, 1, 0, 1), // Green
        blue: vec4(0, 0, 1, 1), // Blue
        white: vec4(1, 1, 1, 1), // White
        black: vec4(0, 0, 0, 1), // Black
        purple: vec4(0.5, 0, 0.5, 1), // Purple
}
```

### Creating Gradients

Let's make colors change across the screen based on position.

```javascript
const gl = createGL({
        fragment: () => {
                // Get screen coordinates (from -1 to 1)
                const position = builtin('position')

                // Use X coordinate to change color
                const x = position.x
                const color = vec4(x.mul(0.5).add(0.5), 0.2, 0.8, 1.0)

                return color
        },
})
```

In this example:

- `position.x` gets the horizontal position on screen
- Left edge is -1, right edge is 1
- `mul(0.5).add(0.5)` converts -1→1 range to 0→1 range

## Understanding Coordinates

### Screen Coordinate System

GLRE uses this coordinate system:

```
     (-1, 1) -------- (1, 1)
        |              |
        |    Screen    |
        |              |
     (-1, -1) ------- (1, -1)
```

Think of it like a map:

- Center of screen is (0, 0)
- Left and right edges are -1 and 1
- Top and bottom edges are 1 and -1

### Using Position

```javascript
const gl = createGL({
        fragment: () => {
                const pos = builtin('position')

                // Get coordinate components
                const x = pos.x // Horizontal position
                const y = pos.y // Vertical position

                // Distance from center
                const distance = length(vec2(x, y))

                return vec4(distance, distance, distance, 1.0)
        },
})
```

### Working with Vectors

Vectors are groups of numbers that work together:

```javascript
// 2D vector (like a point on a map)
const point2D = vec2(0.5, 0.3)
const x_component = point2D.x
const y_component = point2D.y

// 3D vector (like RGB color)
const point3D = vec3(1.0, 0.5, 0.2)
const red = point3D.x // or point3D.r
const green = point3D.y // or point3D.g
const blue = point3D.z // or point3D.b

// 4D vector (RGBA color)
const color = vec4(0.8, 0.2, 0.6, 1.0)
const rgb = color.xyz // First 3 components
const alpha = color.w // Transparency
```

## Understanding Math Functions

### Basic Math Operations

```javascript
// Addition
const a = float(2.0)
const b = float(3.0)
const sum = a.add(b) // 2.0 + 3.0 = 5.0

// Multiplication
const doubled = a.mul(2) // 2.0 * 2 = 4.0

// Sine wave (creates smooth up-and-down motion)
const wave = sin(a) // Creates values between -1 and 1
```

### What is Sine?

Sine (`sin`) creates smooth wave patterns. Imagine drawing a wave:

- At 0, sine = 0 (middle)
- At π/2, sine = 1 (top)
- At π, sine = 0 (middle again)
- At 3π/2, sine = -1 (bottom)

This creates smooth, repeating motion perfect for animation.

## Practical Examples

### Rainbow Gradient

```javascript
const gl = createGL({
        fragment: () => {
                const pos = builtin('position')

                // Convert X coordinate to 0-1 range
                const x = pos.x.mul(0.5).add(0.5)

                // Create rainbow colors using sine waves
                const r = sin(x.mul(6.28)).mul(0.5).add(0.5)
                const g = sin(x.mul(6.28).add(2.09)).mul(0.5).add(0.5)
                const b = sin(x.mul(6.28).add(4.18)).mul(0.5).add(0.5)

                return vec4(r, g, b, 1.0)
        },
})
```

### Radial Gradient

```javascript
const gl = createGL({
        fragment: () => {
                const pos = builtin('position')

                // Distance from center
                const distance = length(pos.xy)

                // Change color based on distance
                const intensity = distance
                const color = vec3(intensity, intensity.mul(0.5), intensity.mul(0.2))

                return vec4(color, 1.0)
        },
})
```

## Common Issues and Solutions

### Q: I get an error when running the code

A: Check the browser developer tools (F12) and look at the console for error messages.

### Q: No colors are displayed

A: Check these:

- Is the 4th value (alpha) in `vec4` set to 0? It should be 1.
- Are color values between 0 and 1?
- Did you include a `return` statement?

### Q: How do I specify screen size?

A: Configure it in `createGL`:

```javascript
const gl = createGL({
        width: 800,
        height: 600,
        fragment: myShader,
})
```

## What You've Learned

- ✅ GLRE basics and setup
- ✅ Color specification with RGBA
- ✅ Understanding coordinate system
- ✅ Creating gradients
- ✅ Basic math operations

## Next Steps

Now that you can display basic colors, move on to [Colors and Coordinates](02-colors-coordinates.md) to learn more detailed color control and coordinate manipulation.

You're ready to start creating beautiful visuals with code!
