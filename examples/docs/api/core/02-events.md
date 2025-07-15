# Event System

GLRE's reactive event system manages CPU-GPU data flow and user interactions.

## Core Lifecycle Events

### Mount Event

Handles engine initialization:

```javascript
gl('mount', () => {
        console.log('Engine initialized')

        // Setup initial uniforms
        gl.uniform('startTime', performance.now())
        gl.uniform('iResolution', [gl.canvas.width, gl.canvas.height])
})
```

### Cleanup Event

Manages resource disposal:

```javascript
gl('clean', () => {
        console.log('Resources cleaned up')

        // Custom cleanup code
        clearInterval(updateTimer)
        removeEventListeners()
})
```

### Resize Event

Responds to canvas size changes:

```javascript
gl('resize', () => {
        const [width, height] = gl.size
        gl.uniform('iResolution', [width, height])

        // Update aspect ratio
        const aspect = width / height
        gl.uniform('aspectRatio', aspect)
})
```

## Animation Loop

### Frame Events

```javascript
gl('loop', () => {
        const time = performance.now() / 1000
        gl.uniform('iTime', time)

        // Update other time-based uniforms
        gl.uniform('deltaTime', time - lastTime)
        lastTime = time
})
```

### Conditional Updates

```javascript
const createConditionalUpdate = () => {
        let needsUpdate = true

        gl('loop', () => {
                if (!needsUpdate) return

                // Expensive calculations only when needed
                const complexValue = calculateComplexValue()
                gl.uniform('complexValue', complexValue)

                needsUpdate = false
        })

        return {
                markDirty: () => (needsUpdate = true),
        }
}
```

## Input Events

### Mouse Interaction

```javascript
gl('mousemove', (event, x, y) => {
        // Normalized coordinates (-1 to 1)
        const [width, height] = gl.size
        const normalizedX = (x / width) * 2 - 1
        const normalizedY = -((y / height) * 2 - 1)

        gl.uniform('iMouse', [normalizedX, normalizedY])
})

gl('mousedown', () => {
        gl.uniform('isMouseDown', 1.0)
})

gl('mouseup', () => {
        gl.uniform('isMouseDown', 0.0)
})
```

### Keyboard Input

```javascript
const createKeyboardHandler = () => {
        const pressedKeys = new Set()

        document.addEventListener('keydown', (event) => {
                pressedKeys.add(event.code)
                gl('keydown', event.code)
        })

        document.addEventListener('keyup', (event) => {
                pressedKeys.delete(event.code)
                gl('keyup', event.code)
        })

        gl('keydown', (key) => {
                switch (key) {
                        case 'Space':
                                gl.uniform('isPaused', !gl.isPaused)
                                break
                        case 'ArrowUp':
                                gl.uniform('direction', [0, 1])
                                break
                }
        })

        return { pressedKeys }
}
```

## Custom Events

### Event Registration

```javascript
const createEventManager = () => {
        const listeners = new Map()

        const on = (eventName, callback) => {
                if (!listeners.has(eventName)) {
                        listeners.set(eventName, [])
                }
                listeners.get(eventName).push(callback)
        }

        const emit = (eventName, ...args) => {
                const eventListeners = listeners.get(eventName)
                if (eventListeners) {
                        eventListeners.forEach((callback) => callback(...args))
                }
        }

        const off = (eventName, callback) => {
                const eventListeners = listeners.get(eventName)
                if (eventListeners) {
                        const index = eventListeners.indexOf(callback)
                        if (index !== -1) {
                                eventListeners.splice(index, 1)
                        }
                }
        }

        return { on, emit, off }
}

// Usage
gl('textureLoaded', (textureName) => {
        gl.uniform('hasTexture', 1.0)
        console.log('Texture ready:', textureName)
})

// Trigger custom event
loadTexture('background.jpg').then(() => {
        gl('textureLoaded', 'background.jpg')
})
```

## Reactive Patterns

### State Management

```javascript
const createReactiveState = (initialState) => {
        let state = { ...initialState }
        const listeners = []

        const setState = (updates) => {
                const prevState = { ...state }
                state = { ...state, ...updates }

                listeners.forEach((listener) => listener(state, prevState))
        }

        const subscribe = (listener) => {
                listeners.push(listener)
                return () => {
                        const index = listeners.indexOf(listener)
                        if (index !== -1) listeners.splice(index, 1)
                }
        }

        const getState = () => ({ ...state })

        return { setState, subscribe, getState }
}

// Usage
const appState = createReactiveState({
        mode: 'normal',
        intensity: 1.0,
        color: [1, 1, 1],
})

appState.subscribe((state) => {
        gl.uniform('mode', state.mode === 'normal' ? 0 : 1)
        gl.uniform('intensity', state.intensity)
        gl.uniform('baseColor', state.color)
})
```

### Durable Functions

GLRE's durable functions prevent unnecessary updates:

```javascript
const createDurableUpdate = () => {
        let lastValues = new Map()

        const durableUniform = (name, value) => {
                const lastValue = lastValues.get(name)

                // Only update if value changed
                if (lastValue !== value) {
                        gl.uniform(name, value)
                        lastValues.set(name, value)
                }
        }

        return { durableUniform }
}

const { durableUniform } = createDurableUpdate()

gl('loop', () => {
        const time = performance.now() / 1000
        durableUniform('iTime', time) // Only updates when time changes
})
```

## Touch Events

### Mobile Support

```javascript
const createTouchHandler = () => {
        const touches = new Map()

        const handleTouchEvent = (event) => {
                event.preventDefault()
                touches.clear()

                for (let i = 0; i < event.touches.length; i++) {
                        const touch = event.touches[i]
                        const rect = gl.canvas.getBoundingClientRect()

                        const x = ((touch.clientX - rect.left) / rect.width) * 2 - 1
                        const y = -(((touch.clientY - rect.top) / rect.height) * 2 - 1)

                        touches.set(touch.identifier, { x, y })
                }

                // Send first two touches to GPU
                const touchArray = Array.from(touches.values())
                gl.uniform('touchCount', touchArray.length)
                gl.uniform('touch1', touchArray[0] || [0, 0])
                gl.uniform('touch2', touchArray[1] || [0, 0])
        }

        gl.canvas.addEventListener('touchstart', handleTouchEvent)
        gl.canvas.addEventListener('touchmove', handleTouchEvent)
        gl.canvas.addEventListener('touchend', handleTouchEvent)

        return { touches }
}
```

## Performance Events

### Frame Rate Monitoring

```javascript
const createPerformanceMonitor = () => {
        let frameCount = 0
        let lastTime = performance.now()

        gl('loop', () => {
                frameCount++
                const currentTime = performance.now()

                if (currentTime - lastTime >= 1000) {
                        const fps = (frameCount * 1000) / (currentTime - lastTime)
                        gl('fps', fps)

                        frameCount = 0
                        lastTime = currentTime
                }
        })

        gl('fps', (fps) => {
                if (fps < 30) {
                        console.warn('Low FPS detected:', fps)
                        gl('lowPerformance', fps)
                }
        })
}
```

## Error Events

### Error Handling

```javascript
const createErrorHandler = () => {
        gl('error', (error, context) => {
                console.error('GLRE Error:', error)

                // Attempt recovery
                switch (error.type) {
                        case 'shader_compile':
                                gl.fragment = fallbackShader
                                gl('mount')
                                break
                        case 'context_lost':
                                // Wait for context restoration
                                break
                }
        })

        // Safe event wrapper
        const safeEmit = (eventName, ...args) => {
                try {
                        gl(eventName, ...args)
                } catch (error) {
                        gl('error', { type: 'event_error', error }, { event: eventName, args })
                }
        }

        return { safeEmit }
}
```

## Event Flow

The GLRE event system follows this pattern:

```
User Input → Event Capture → State Update → GPU Sync → Render
     ↑                                                      ↓
     └─────────── Feedback Loop ←─────────────────────────────┘
```

### Event Lifecycle

1. **Input Phase**: Capture user interactions
2. **Processing Phase**: Update application state
3. **Sync Phase**: Send data to GPU
4. **Render Phase**: Execute GPU drawing
5. **Feedback Phase**: Handle results and prepare next frame

## Event Best Practices

### Memory Management

```javascript
const createManagedEventHandler = () => {
        const cleanup = []

        const addEventHandler = (eventName, handler) => {
                gl(eventName, handler)
                cleanup.push(() => gl.off(eventName, handler))
        }

        const cleanupAll = () => {
                cleanup.forEach((fn) => fn())
                cleanup.length = 0
        }

        return { addEventHandler, cleanupAll }
}
```

### Throttling

```javascript
const createThrottledHandler = (handler, delay) => {
        let lastCall = 0

        return (...args) => {
                const now = Date.now()
                if (now - lastCall >= delay) {
                        handler(...args)
                        lastCall = now
                }
        }
}

// Throttle mouse events to 60fps
gl(
        'mousemove',
        createThrottledHandler((event, x, y) => {
                updateMousePosition(x, y)
        }, 16)
)
```

GLRE's event system enables reactive programming patterns that automatically synchronize CPU state with GPU execution.
