# Time and Animation

Learn to create dynamic, moving visuals that change over time.

## Understanding Time

### Getting Time Values

In GLRE, you can easily access time to create animations:

````javascript
const gl = createGL({
    fragment: () => {
        // Get elapsed time in seconds
        const time = uniform('iTime')

        // Change color over time
        const red = sin(time).mul(0.5).add(0.5)
        const green = sin(time.add(2.0)).mul(0.5).add(0.5)
        const blue = sin(time.add(4.0)).mul(0.5).add(0.5)

        return vec4(red, green, blue, 1.0)
    }
})

// Update time every frame
gl('loop', () => {
    const time = performance.now() / 1000
    gl.uniform('iTime', time)
})
```åß

**What happens**: Colors smoothly cycle through different values, creating a rainbow effect.

### Basic Time Patterns

```javascript
const gl = createGL({
    fragment: () => {
        const time = uniform('iTime')
        const pos = builtin('position')

        // Oscillation: smoothly goes up and down
        const oscillation = sin(time.mul(2.0)).mul(0.5).add(0.5)

        // Linear progression: steadily increases
        const linear = fract(time.mul(0.5))

        // Easing: smooth acceleration/deceleration
        const eased = sin(time.mul(1.5)).mul(0.5).add(0.5)
        const smoothed = eased.mul(eased).mul(3.0).sub(eased.mul(eased).mul(2.0))

        // Choose pattern based on position
        const pattern = mix(
            oscillation,
            mix(linear, smoothed, step(0.0, pos.x)),
            step(0.3, abs(pos.y))
        )

        const color = vec3(pattern, pattern.mul(0.8), pattern.mul(1.2))
        return vec4(color, 1.0)
    }
})
````

## Animation Patterns

### Rotation Animation

Spin things around in circles:

```javascript
const gl = createGL({
        fragment: () => {
                const time = uniform('iTime')
                const pos = builtin('position')

                // Rotation angle
                const angle = time.mul(1.0)

                // Apply rotation to coordinates
                const cosA = cos(angle)
                const sinA = sin(angle)
                const rotatedPos = vec2(pos.x.mul(cosA).sub(pos.y.mul(sinA)), pos.x.mul(sinA).add(pos.y.mul(cosA)))

                // Create stripes on rotated coordinates
                const stripe = sin(rotatedPos.x.mul(10.0)).mul(0.5).add(0.5)

                const color = vec3(stripe, stripe.mul(0.7), stripe.mul(0.9))
                return vec4(color, 1.0)
        },
})
```

### Scale Animation

Make things grow and shrink:

```javascript
const gl = createGL({
        fragment: () => {
                const time = uniform('iTime')
                const pos = builtin('position')

                // Pulsing effect
                const pulse = sin(time.mul(3.0)).mul(0.3).add(1.0)

                // Scale coordinates
                const scaledPos = pos.xy.div(pulse)

                // Distance from center
                const distance = length(scaledPos)

                // Circle that pulses
                const circle = smoothstep(0.5, 0.45, distance)

                const color = vec3(circle, circle.mul(0.8), circle.mul(1.2))
                return vec4(color, 1.0)
        },
})
```

### Wave Propagation

Create ripples spreading outward:

```javascript
const gl = createGL({
        fragment: () => {
                const time = uniform('iTime')
                const pos = builtin('position')

                // Distance from center
                const distance = length(pos.xy)

                // Wave that travels outward
                const wave = sin(distance.mul(20.0).sub(time.mul(8.0)))

                // Fade effect with distance
                const attenuation = oneMinus(distance)
                const finalWave = wave.mul(attenuation).mul(0.5).add(0.5)

                const color = vec3(finalWave, finalWave.mul(0.6), finalWave.mul(1.4))
                return vec4(color, 1.0)
        },
})
```

**What this creates**: Ripples that start from the center and spread outward, like dropping a stone in water.

## Complex Animations

### Multiple Wave Frequencies

Combine different rhythms for complex patterns:

```javascript
const gl = createGL({
        fragment: () => {
                const time = uniform('iTime')
                const pos = builtin('position')

                // Different wave frequencies
                const wave1 = sin(time.mul(1.0)) // Slow
                const wave2 = sin(time.mul(1.618)) // Golden ratio frequency
                const wave3 = sin(time.mul(0.707)) // Another harmonic

                // Combine waves
                const composite = wave1.add(wave2.mul(0.5)).add(wave3.mul(0.25))
                const normalized = composite.div(1.75).mul(0.5).add(0.5)

                // Apply to pattern
                const modulation = sin(pos.x.mul(5.0)).mul(sin(pos.y.mul(5.0)))
                const final = normalized.mul(modulation.mul(0.5).add(0.5))

                const color = vec3(final, final.mul(0.8), final.mul(1.2))
                return vec4(color, 1.0)
        },
})
```

### Lissajous Curves

Mathematical curves that create beautiful patterns:

```javascript
const gl = createGL({
        fragment: () => {
                const time = uniform('iTime')
                const pos = builtin('position')

                // Lissajous curve parameters
                const a = 3.0 // X frequency
                const b = 4.0 // Y frequency
                const delta = time.mul(0.5)

                // Calculate curve position
                const x = sin(time.mul(a).add(delta)).mul(0.7)
                const y = sin(time.mul(b)).mul(0.7)
                const curvePos = vec2(x, y)

                // Distance from curve
                const distance = length(pos.xy.sub(curvePos))

                // Draw the curve
                const curve = smoothstep(0.1, 0.05, distance)

                // Add trail effect
                const history = sin(distance.mul(30.0).sub(time.mul(5.0)))
                        .mul(0.5)
                        .add(0.5)
                const historyMask = smoothstep(0.8, 0.2, distance)

                const final = max(curve, history.mul(historyMask).mul(0.3))
                const color = vec3(final, final.mul(0.7), final.mul(1.3))

                return vec4(color, 1.0)
        },
})
```

## Easing Functions

### Smooth Transitions

Instead of linear changes, use easing for more natural motion:

```javascript
// Common easing functions
const createEasingFunctions = () => {
        const easeInOut = (t) => {
                return t.mul(t).mul(3.0).sub(t.mul(t).mul(2.0))
        }

        const easeInQuart = (t) => {
                return t.mul(t).mul(t).mul(t)
        }

        const easeOutBounce = (t) => {
                const n1 = 7.5625
                const d1 = 2.75

                return If(t.lessThan(1.0 / d1), () => {
                        return n1.mul(t).mul(t)
                })
                        .ElseIf(t.lessThan(2.0 / d1), () => {
                                const t2 = t.sub(1.5 / d1)
                                return n1.mul(t2).mul(t2).add(0.75)
                        })
                        .ElseIf(t.lessThan(2.5 / d1), () => {
                                const t2 = t.sub(2.25 / d1)
                                return n1.mul(t2).mul(t2).add(0.9375)
                        })
                        .Else(() => {
                                const t2 = t.sub(2.625 / d1)
                                return n1.mul(t2).mul(t2).add(0.984375)
                        })
        }

        return { easeInOut, easeInQuart, easeOutBounce }
}
```

## Interactive Animations

### Mouse-Controlled Effects

Combine time with mouse position:

```javascript
const gl = createGL({
        fragment: () => {
                const time = uniform('iTime')
                const mouse = uniform('iMouse')
                const pos = builtin('position')

                // Distance from mouse
                const mouseDistance = length(pos.xy.sub(mouse))

                // Time-based ripples from mouse position
                const ripple = sin(mouseDistance.mul(15.0).sub(time.mul(10.0)))
                const rippleMask = smoothstep(0.8, 0.0, mouseDistance)

                // Background pattern
                const background = sin(pos.x.mul(10.0).add(time)).mul(sin(pos.y.mul(10.0).add(time)))

                // Combine effects
                const final = background.mul(0.3).add(ripple.mul(rippleMask).mul(0.7))
                const color = vec3(final.mul(0.5).add(0.5))

                return vec4(color, 1.0)
        },
})

gl('mousemove', (event, x, y) => {
        const [width, height] = gl.size
        const normalizedX = (x / width) * 2 - 1
        const normalizedY = -((y / height) * 2 - 1)
        gl.uniform('iMouse', [normalizedX, normalizedY])
})
```

## Time-Based Effects

### Kaleidoscope

Create a kaleidoscope effect that changes over time:

```javascript
const gl = createGL({
        fragment: () => {
                const time = uniform('iTime')
                const pos = builtin('position')

                // Convert to polar coordinates
                let radius = length(pos.xy)
                let angle = atan2(pos.y, pos.x)

                // Kaleidoscope symmetry
                const sections = 6.0
                angle = angle.div(6.28318).mul(sections)
                angle = abs(fract(angle).sub(0.5)).mul(2.0)
                angle = angle.mul(6.28318).div(sections)

                // Time-based rotation
                angle = angle.add(time.mul(0.5))

                // Radial waves
                radius = radius.add(sin(angle.mul(8.0).add(time.mul(2.0))).mul(0.1))

                // Pattern generation
                const pattern1 = sin(radius.mul(20.0).sub(time.mul(3.0)))
                const pattern2 = sin(angle.mul(12.0).add(radius.mul(15.0)))

                const combined = pattern1.mul(pattern2).mul(0.5).add(0.5)

                // Rainbow colors
                const colorPhase = angle.add(time)
                const color = vec3(
                        sin(colorPhase).mul(0.5).add(0.5),
                        sin(colorPhase.add(2.09)).mul(0.5).add(0.5),
                        sin(colorPhase.add(4.18)).mul(0.5).add(0.5)
                ).mul(combined)

                return vec4(color, 1.0)
        },
})
```

## Animation Control

### Pause and Resume

Control animation playback:

```javascript
const createAnimationController = () => {
        let isPaused = false
        let pausedTime = 0

        const gl = createGL({
                fragment: () => {
                        const time = uniform('iTime')
                        const wave = sin(time.mul(2.0)).mul(0.5).add(0.5)
                        return vec4(vec3(wave), 1.0)
                },
        })

        gl('loop', () => {
                if (!isPaused) {
                        const currentTime = performance.now() / 1000
                        gl.uniform('iTime', currentTime - pausedTime)
                }
        })

        // Space key to pause/resume
        document.addEventListener('keydown', (event) => {
                if (event.code === 'Space') {
                        if (isPaused) {
                                pausedTime = performance.now() / 1000 - pausedTime
                                isPaused = false
                        } else {
                                pausedTime = performance.now() / 1000 - pausedTime
                                isPaused = true
                        }
                }
        })

        return { gl }
}
```

## Common Issues

### Jerky Animation

```javascript
// Problem: Inconsistent frame rate
// Solution: Use requestAnimationFrame

let lastTime = 0

const animate = (currentTime) => {
        const deltaTime = (currentTime - lastTime) / 1000
        lastTime = currentTime

        // Use stable time values
        gl.uniform('iTime', currentTime / 1000)
        gl.uniform('deltaTime', deltaTime)

        requestAnimationFrame(animate)
}

requestAnimationFrame(animate)
```

### Time Precision Issues

```javascript
// More precise time management
const createTimeManager = () => {
        const startTime = performance.now()

        const getElapsedTime = () => {
                return (performance.now() - startTime) / 1000
        }

        return { getElapsedTime }
}

const timeManager = createTimeManager()

gl('loop', () => {
        const elapsed = timeManager.getElapsedTime()
        gl.uniform('iTime', elapsed)
})
```

## What You've Learned

- ✅ Time access and basic animation
- ✅ Rotation, scaling, and wave animations
- ✅ Complex pattern combinations
- ✅ Easing functions for smooth motion
- ✅ Interactive time-based effects
- ✅ Animation control systems

## Next Steps

Now that you can create dynamic visuals, learn about [Shapes and Patterns](../techniques/04-shapes-patterns.md) to draw specific forms and complex designs.
