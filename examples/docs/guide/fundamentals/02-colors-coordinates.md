# Colors and Coordinates

Learn detailed color manipulation and coordinate transformations.

## Understanding Color Systems

### RGB vs HSV

RGB (Red, Green, Blue) is like mixing colored lights, while HSV (Hue, Saturation, Value) is more intuitive for artists.

**RGB**: Mix red, green, and blue light
**HSV**: Pick a color (hue), make it vibrant (saturation), make it bright (value)

```javascript
// RGB: Direct color mixing
const brightBlue = vec3(0.3, 0.7, 1.0)

// HSV-style color creation
const createHSVColor = (h, s, v) => {
        // Convert HSV to RGB (mathematical conversion)
        const c = v.mul(s)
        const x = c.mul(oneMinus(abs(h.mul(6).mod(2).sub(1))))
        const m = v.sub(c)

        const h6 = h.mul(6)

        return If(h6.lessThan(1), () => {
                return vec3(c, x, 0).add(m)
        })
                .ElseIf(h6.lessThan(2), () => {
                        return vec3(x, c, 0).add(m)
                })
                .ElseIf(h6.lessThan(3), () => {
                        return vec3(0, c, x).add(m)
                })
                .ElseIf(h6.lessThan(4), () => {
                        return vec3(0, x, c).add(m)
                })
                .ElseIf(h6.lessThan(5), () => {
                        return vec3(x, 0, c).add(m)
                })
                .Else(() => {
                        return vec3(c, 0, x).add(m)
                })
}
```

### Color Blending

Mix two colors together smoothly:

```javascript
const gl = createGL({
        fragment: () => {
                const pos = builtin('position')

                // Two colors to blend
                const color1 = vec3(1.0, 0.2, 0.3) // Reddish
                const color2 = vec3(0.2, 0.6, 1.0) // Bluish

                // X coordinate determines blend ratio
                const mixRatio = pos.x.mul(0.5).add(0.5)

                // Blend the colors
                const blendedColor = mix(color1, color2, mixRatio)

                return vec4(blendedColor, 1.0)
        },
})
```

**What `mix()` does**:

- When `mixRatio` = 0: returns `color1`
- When `mixRatio` = 1: returns `color2`
- When `mixRatio` = 0.5: returns halfway between both colors

## Coordinate Transformations

### Moving, Scaling, and Rotating

Think of coordinates like a piece of paper you can move, resize, and turn:

```javascript
const gl = createGL({
        fragment: () => {
                const pos = builtin('position')

                // Move coordinates (translation)
                const offset = vec2(0.3, -0.2)
                const movedPos = pos.xy.add(offset)

                // Scale coordinates (make bigger/smaller)
                const scale = 2.0
                const scaledPos = movedPos.mul(scale)

                // Rotate coordinates
                const angle = 0.5 // radians (about 30 degrees)
                const cosA = cos(angle)
                const sinA = sin(angle)
                const rotatedPos = vec2(
                        scaledPos.x.mul(cosA).sub(scaledPos.y.mul(sinA)),
                        scaledPos.x.mul(sinA).add(scaledPos.y.mul(cosA))
                )

                // Use transformed coordinates for color
                const color = vec3(abs(rotatedPos.x), abs(rotatedPos.y), 0.5)
                return vec4(color, 1.0)
        },
})
```

### Polar Coordinates

Sometimes it's easier to think in circles rather than squares:

```javascript
const gl = createGL({
        fragment: () => {
                const pos = builtin('position')

                // Convert to polar coordinates (radius and angle)
                const radius = length(pos.xy) // Distance from center
                const angle = atan2(pos.y, pos.x) // Angle around center

                // Use angle for hue (color wheel effect)
                const hue = angle.div(6.28318).add(0.5) // Convert -π→π to 0→1

                // Use radius for brightness
                const brightness = saturate(oneMinus(radius))

                // Create color wheel
                const color = vec3(
                        sin(hue.mul(6.28318)).mul(0.5).add(0.5),
                        cos(hue.mul(6.28318).add(2.094)).mul(0.5).add(0.5),
                        sin(hue.mul(6.28318).add(4.188)).mul(0.5).add(0.5)
                ).mul(brightness)

                return vec4(color, 1.0)
        },
})
```

**What this creates**: A circular rainbow that fades to black at the edges.

## Creating Patterns

### Checkerboard Pattern

```javascript
const gl = createGL({
        fragment: () => {
                const pos = builtin('position')

                // Divide screen into grid cells
                const scale = 8.0
                const gridPos = pos.xy.mul(scale)

                // Get cell indices
                const cellX = floor(gridPos.x)
                const cellY = floor(gridPos.y)

                // Checkerboard pattern
                const checker = mod(cellX.add(cellY), 2.0)

                // Alternate between white and black
                const color = vec3(checker)
                return vec4(color, 1.0)
        },
})
```

### Stripe Patterns

```javascript
const gl = createGL({
        fragment: () => {
                const pos = builtin('position')

                // Vertical stripes
                const frequency = 10.0
                const stripe = sin(pos.x.mul(frequency)).mul(0.5).add(0.5)

                // Diagonal stripes
                const diagonal = sin(pos.x.add(pos.y).mul(frequency)).mul(0.5).add(0.5)

                // Combine patterns
                const pattern = mix(stripe, diagonal, 0.5)

                const color = vec3(pattern, pattern.mul(0.8), pattern.mul(0.6))
                return vec4(color, 1.0)
        },
})
```

### Circular Patterns

```javascript
const gl = createGL({
        fragment: () => {
                const pos = builtin('position')

                // Distance from center
                const distance = length(pos.xy)

                // Concentric circles
                const rings = sin(distance.mul(20.0)).mul(0.5).add(0.5)

                // Smooth ring edges
                const ringWidth = 0.1
                const smoothRings = smoothstep(0.0, ringWidth, rings)

                // Combine with gradient
                const gradient = oneMinus(distance)
                const finalPattern = smoothRings.mul(gradient)

                const color = vec3(finalPattern, finalPattern.mul(0.8), finalPattern.mul(1.2))
                return vec4(color, 1.0)
        },
})
```

## Useful Effects

### Vignette Effect

Darken the edges of the screen:

```javascript
const gl = createGL({
        fragment: () => {
                const pos = builtin('position')

                // Base color
                const baseColor = vec3(0.8, 0.9, 1.0)

                // Vignette based on distance from center
                const distance = length(pos.xy)
                const vignette = smoothstep(0.8, 0.2, distance)

                const finalColor = baseColor.mul(vignette)
                return vec4(finalColor, 1.0)
        },
})
```

### Grid Lines

```javascript
const gl = createGL({
        fragment: () => {
                const pos = builtin('position')

                // Background color
                const backgroundColor = vec3(0.1, 0.1, 0.2)

                // Grid settings
                const gridSize = 0.1
                const lineWidth = 0.02

                // Calculate grid lines
                const grid = abs(fract(pos.xy.div(gridSize)).sub(0.5))
                const gridLines = smoothstep(0.0, lineWidth, min(grid.x, grid.y))

                // Grid color
                const gridColor = vec3(0.3, 0.3, 0.5)

                // Blend background and grid
                const finalColor = mix(gridColor, backgroundColor, gridLines)
                return vec4(finalColor, 1.0)
        },
})
```

## Mathematical Functions Explained

### Wave Functions

These create repeating patterns:

```javascript
const gl = createGL({
        fragment: () => {
                const pos = builtin('position')

                // Sine wave: smooth up and down motion
                const sine = sin(pos.x.mul(8.0)).mul(0.5).add(0.5)

                // Sawtooth wave: ramp up, then jump down
                const sawtooth = fract(pos.x.mul(4.0))

                // Square wave: switches between high and low
                const square = step(0.5, fract(pos.x.mul(4.0)))

                // Choose wave based on Y position
                const waveSelect = pos.y.mul(0.5).add(0.5)
                const wave1 = mix(sine, sawtooth, step(0.33, waveSelect))
                const wave2 = mix(wave1, square, step(0.66, waveSelect))

                const color = vec3(wave2, wave2.mul(0.8), wave2.mul(1.2))
                return vec4(color, 1.0)
        },
})
```

### Random Patterns

Create seemingly random variations:

```javascript
// Pseudo-random function
const random = (st) => {
        return fract(sin(dot(st, vec2(12.9898, 78.233))).mul(43758.5453123))
}

const gl = createGL({
        fragment: () => {
                const pos = builtin('position')

                // Grid cells
                const scale = 10.0
                const cellPos = floor(pos.xy.mul(scale))

                // Random value per cell
                const randomValue = random(cellPos)

                // Random color per cell
                const color = vec3(
                        random(cellPos),
                        random(cellPos.add(vec2(1.0, 0.0))),
                        random(cellPos.add(vec2(0.0, 1.0)))
                )

                return vec4(color, 1.0)
        },
})
```

## Common Issues

### Colors Don't Look Right

```javascript
// Problem: Values outside 0-1 range
const color = vec3(300, 150, 75) // Too large!

// Solution: Normalize to 0-1 range
const color = vec3(300, 150, 75).div(255) // Convert from 0-255 to 0-1
```

### Distorted Coordinates

```javascript
// Account for screen aspect ratio
const gl = createGL({
        fragment: () => {
                const pos = builtin('position')
                const resolution = uniform('iResolution')

                // Aspect ratio correction
                const aspect = resolution.x.div(resolution.y)
                const correctedPos = vec2(pos.x.mul(aspect), pos.y)

                // Now circles appear as perfect circles
                const distance = length(correctedPos)
                const circle = step(distance, 0.5)

                return vec4(vec3(circle), 1.0)
        },
})
```

## What You've Learned

- ✅ RGB and HSV color systems
- ✅ Color blending and adjustments
- ✅ Coordinate transformations (move, scale, rotate)
- ✅ Polar coordinate system
- ✅ Pattern generation
- ✅ Mathematical function applications

## Next Steps

Now that you understand colors and coordinates, learn about [Time and Animation](03-time-animation.md) to make your visuals move and change dynamically.
