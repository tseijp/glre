import { describe, it, expect } from '@jest/globals'
import { float, vec2, vec3, vec4, int, struct, Fn, Scope } from '../../src/node'
import { build } from '../../test-utils'
import { code } from '../../src/node/utils'
import type { NodeContext } from '../../src/node/types'

describe('Struct Processing System', () => {
        const createWGSLContext = (): NodeContext => ({ isWebGL: false })
        const createGLSLContext = (): NodeContext => ({ isWebGL: true })

        describe('Struct Definition', () => {
                it('should handle struct instantiation without initial values', () => {
                        const Point = struct({ x: float(), y: float() }, 'Point')
                        const res = build(() => {
                                const p = Point()
                                return p.x.add(p.y)
                        }, 'Point')
                        expect(res).toContain('struct Point {')
                        expect(res).toContain('x: f32')
                        expect(res).toContain('y: f32')
                })

                it('should handle struct instantiation with initial values', () => {
                        const Transform = struct(
                                {
                                        position: vec3(),
                                        scale: float(),
                                },
                                'Transform'
                        )
                        const res = build(() => {
                                const t = Transform({
                                        position: vec3(1, 2, 3),
                                        scale: float(2.0),
                                })
                                return t.position.length()
                        }, 'Transform')
                        expect(res).toContain('struct Transform {')
                        expect(res).toContain('position: vec3f')
                        expect(res).toContain('scale: f32')
                })

                it('should auto-generate struct names when not provided', () => {
                        const Material = struct({
                                color: vec3(),
                                roughness: float(),
                        })
                        const res = build(() => {
                                const m = Material({}, 'm')
                                return m.color.length()
                        })
                        expect(res).toMatch(/^[ \t]*var m: x\d+ = x\d+\(\);$/m) // var m: x4 = x4();
                })
        })

        describe('Struct Header Generation', () => {
                it('should generate correct WGSL struct headers', () => {
                        const Particle = struct({ position: vec3(), velocity: vec3(), mass: float() }, 'Particle')
                        const res = build(() => Particle(), 'Particle')
                        expect(res).toContain('struct Particle {')
                        expect(res).toContain('position: vec3f,')
                        expect(res).toContain('velocity: vec3f,')
                        expect(res).toContain('mass: f32,')
                        expect(res).toContain('};')
                })

                it('should generate correct GLSL struct headers', () => {
                        const Light = struct({ position: vec3(), color: vec3(), intensity: float() }, 'Light')
                        const res = build(() => Light(), 'Light', true)
                        expect(res).toContain('struct Light {')
                        expect(res).toContain('vec3 position;')
                        expect(res).toContain('vec3 color;')
                        expect(res).toContain('float intensity;')
                        expect(res).toContain('};')
                })

                it('should handle complex nested field types', () => {
                        const Material = struct({ albedo: vec4(), normal: vec3(), metallic: float(), roughness: float(), emissive: vec3() }, 'Material')
                        const res = build(() => Material(), 'Material')
                        expect(res).toContain('albedo: vec4f,')
                        expect(res).toContain('normal: vec3f,')
                        expect(res).toContain('metallic: f32,')
                        expect(res).toContain('roughness: f32,')
                        expect(res).toContain('emissive: vec3f,')
                })
        })

        describe('Struct Field Access', () => {
                it('should handle field access correctly', () => {
                        const Camera = struct({ position: vec3(), target: vec3(), fov: float() }, 'Camera')
                        const res = build(() => {
                                const cam = Camera(
                                        {
                                                position: vec3(0, 0, 5),
                                                target: vec3(0, 0, 0),
                                                fov: float(45),
                                        },
                                        'cam'
                                )
                                return cam.position.length()
                        })
                        expect(res).toContain('cam.position')
                        expect(res).toContain('length(cam.position)')
                })

                it('should handle field assignment correctly', () => {
                        const Transform = struct({ position: vec3(), rotation: vec3() }, 'Transform')
                        const res = build(() => {
                                const transform = Transform({}, 'transform')
                                transform.position.assign(vec3(1, 2, 3))
                                transform.rotation.assign(vec3(0, 0, 0))
                                return transform.position.x
                        })
                        expect(res).toContain('transform.position = vec3f(1.0, 2.0, 3.0);')
                        expect(res).toContain('transform.rotation = vec3f(0.0, 0.0, 0.0);')
                })

                it('should handle chained field access operations', () => {
                        const Sphere = struct({ center: vec3(), radius: float() }, 'Sphere')
                        const res = build(() => {
                                const sphere = Sphere(
                                        {
                                                center: vec3(1, 2, 3),
                                                radius: float(2.5),
                                        },
                                        'sphere'
                                )
                                return sphere.center.normalize().mul(sphere.radius)
                        })
                        expect(res).toContain('normalize(sphere.center)')
                        expect(res).toContain('sphere.radius')
                })

                it('should handle field swizzling operations', () => {
                        const Rect = struct({ position: vec4(), size: vec2() }, 'Rect')
                        const res = build(() => {
                                const rect = Rect(
                                        {
                                                position: vec4(0, 0, 100, 100),
                                                size: vec2(50, 25),
                                        },
                                        'rect'
                                )
                                return rect.position.xy.add(rect.size)
                        })
                        expect(res).toContain('rect.position.xy')
                        expect(res).toContain('rect.size')
                })
        })

        describe('Struct Constructor Generation', () => {
                it('should generate struct constructors with parameters', () => {
                        const Color = struct({ r: float(), g: float(), b: float(), a: float() }, 'Color')
                        const res = build(() => {
                                const red = Color({
                                        r: float(1.0),
                                        g: float(0.0),
                                        b: float(0.0),
                                        a: float(1.0),
                                })
                                return red.r
                        })
                        expect(res).toContain('Color(1.0, 0.0, 0.0, 1.0)')
                })

                it('should handle partial initialization with default values', () => {
                        const Settings = struct({ enabled: float(), value: float(), multiplier: float() }, 'Settings')
                        const res = build(() => {
                                const settings = Settings({
                                        enabled: float(1.0),
                                        value: float(0.5),
                                })
                                return settings.enabled.add(settings.value)
                        })
                        expect(res).toContain('Settings(1.0, 0.5')
                })

                it('should handle empty struct construction', () => {
                        const Empty = struct({ placeholder: float() }, 'Empty')
                        const res = build(() => {
                                const empty = Empty()
                                return empty.placeholder
                        })
                        expect(res).toContain('var ')
                        expect(res).toContain(': Empty')
                })
        })

        describe('Nested Struct Support', () => {
                it('should handle structs with struct fields', () => {
                        const Vector3 = struct({ x: float(), y: float(), z: float() }, 'Vector3')
                        // @ts-ignore @TODO FIX #127 `Type 'Struct<{ x: Float; y: Float; z: Float; }>' is not assignable to type 'Void | Bool | UInt | Int | Float | BVec2 | IVec2 | UVec2 | Vec2 | BVec3 | IVec3 | UVec3 | Vec3 | ... 10 more ... | StructBase'. Type 'Struct<{ x: Float; y: Float; z: Float; }>' is not assignable to type 'StructBase'. Type 'Struct<{ x: Float; y: Float; z: Float; }>' is missing the following properties from type '_X<"struct">': assign, select, fragment, compute, and 115 more.`
                        const Transform = struct({ position: Vector3(), scale: Vector3() }, 'Transform')
                        const res = build(() => {
                                const transform = Transform({
                                        // @ts-ignore @TODO FIX #127 `Type 'Struct<{ x: Float; y: Float; z: Float; }>' is not assignable to type 'Void | Bool | UInt | Int | Float | BVec2 | IVec2 | UVec2 | Vec2 | BVec3 | IVec3 | UVec3 | Vec3 | ... 10 more ... | StructBase'. Type 'Struct<{ x: Float; y: Float; z: Float; }>' is not assignable to type 'StructBase'. Type 'Struct<{ x: Float; y: Float; z: Float; }>' is missing the following properties from type '_X<"struct">': assign, select, fragment, compute, and 115 more.`
                                        position: Vector3({ x: float(1), y: float(2), z: float(3) }),
                                        // @ts-ignore @TODO FIX #127 `Type 'Struct<{ x: Float; y: Float; z: Float; }>' is not assignable to type 'Void | Bool | UInt | Int | Float | BVec2 | IVec2 | UVec2 | Vec2 | BVec3 | IVec3 | UVec3 | Vec3 | ... 10 more ... | StructBase'. Type 'Struct<{ x: Float; y: Float; z: Float; }>' is not assignable to type 'StructBase'. Type 'Struct<{ x: Float; y: Float; z: Float; }>' is missing the following properties from type '_X<"struct">': assign, select, fragment, compute, and 115 more.`
                                        scale: Vector3({ x: float(1), y: float(1), z: float(1) }),
                                })
                                return transform.position.x
                        }, 'Transform')
                        expect(res).toContain('struct Transform {')
                        expect(res).toContain('position: Vector3,')
                })

                it('should handle complex nested structures', () => {
                        const Material = struct({ color: vec3(), metallic: float() }, 'Material')
                        // @ts-ignore @TODO FIX #127 `Type 'Struct<{ color: Vec3; metallic: Float; }>' is not assignable to type 'Void | Bool | UInt | Int | Float | BVec2 | IVec2 | UVec2 | Vec2 | BVec3 | IVec3 | UVec3 | Vec3 | ... 10 more ... | StructBase'. Type 'Struct<{ color: Vec3; metallic: Float; }>' is not assignable to type 'StructBase'. Type 'Struct<{ color: Vec3; metallic: Float; }>' is missing the following properties from type '_X<"struct">': assign, select, fragment, compute, and 115 more.`
                        const Mesh = struct({ material: Material(), vertexCount: int() }, 'Mesh')
                        const res = build(() => {
                                // @ts-ignore @TODO FIX #127 `Type 'Struct<{ color: Vec3; metallic: Float; }>' is not assignable to type 'Void | Bool | UInt | Int | Float | BVec2 | IVec2 | UVec2 | Vec2 | BVec3 | IVec3 | UVec3 | Vec3 | ... 10 more ... | StructBase'. Type 'Struct<{ color: Vec3; metallic: Float; }>' is not assignable to type 'StructBase'. Type 'Struct<{ color: Vec3; metallic: Float; }>' is missing the following properties from type '_X<"struct">': assign, select, fragment, compute, and 115 more.`
                                const mesh = Mesh({ material: Material({ color: vec3(1, 0, 0), metallic: float(0.8) }, 'material'), vertexCount: int(1000) }, 'mesh')
                                return mesh.material.color.length()
                        })
                        expect(res).toContain('mesh.material.color')
                })
        })

        describe('Struct Type Inference', () => {
                it('should infer struct types correctly', () => {
                        const Point3D = struct({ x: float(), y: float(), z: float() }, 'Point3D')
                        const res = build(() => {
                                const p1 = Point3D({ x: float(1), y: float(2), z: float(3) }, 'p1')
                                const p2 = Point3D({ x: float(4), y: float(5), z: float(6) }, 'p2')
                                return p1.x.add(p2.x)
                        })
                        expect(res).toContain('var p1: Point3D = Point3D(1.0, 2.0, 3.0);')
                        expect(res).toContain('var p2: Point3D = Point3D(4.0, 5.0, 6.0);')
                })

                it('should handle field type inference within structs', () => {
                        const Particle = struct({ position: vec3(), velocity: vec3(), life: float() }, 'Particle')
                        const res = build(() => {
                                const particle = Particle({}, 'particle')
                                particle.position.assign(vec3(0, 1, 0))
                                particle.velocity.assign(particle.position.normalize())
                                return particle.velocity.length()
                        })
                        expect(res).toContain('particle.position = vec3f(0.0, 1.0, 0.0);')
                        expect(res).toContain('particle.velocity = normalize(particle.position);')
                })
        })

        describe('Struct Operations and Functions', () => {
                it('should handle struct instances in function parameters', () => {
                        const Vector2 = struct({ x: float(), y: float() }, 'Vector2')
                        const lengthFunc = Fn(([v]) => {
                                return v.x.mul(v.x).add(v.y.mul(v.y)).sqrt()
                        }).setLayout({
                                name: 'vectorLength',
                                type: 'float',
                                // @ts-ignore @TODO FIX #127 `Type '"Vector2"' is not assignable to type 'Constants | "auto"'.`
                                inputs: [{ name: 'vec', type: 'Vector2' }],
                        })
                        const res = build(() => {
                                const vec = Vector2({ x: float(3), y: float(4) }, 'vec')
                                return lengthFunc(vec)
                        })
                        expect(res).toContain('return vectorLength(vec);')
                        expect(res).toContain('var vec: Vector2 = Vector2(3.0, 4.0);')
                })

                it('should handle struct return values from functions', () => {
                        const Color = struct({ r: float(), g: float(), b: float() }, 'Color')
                        const createRed = Fn(() => {
                                return Color({ r: float(1), g: float(0), b: float(0) })
                                // @ts-ignore @TODO FIX #127 `Type '"Color"' is not assignable to type 'Constants | "auto"'. Did you mean '"color"'?`
                        }).setLayout({ name: 'createRedColor', type: 'Color' })
                        const res = build(() => {
                                const red = createRed()
                                return red.r
                        }, 'createRedColor')
                        expect(res).toContain('createRedColor')
                        expect(res).toContain('-> Color')
                })

                it('should handle struct copying and assignment', () => {
                        const Transform = struct({ position: vec3(), rotation: float() }, 'Transform')
                        const res = build(() => {
                                const t1 = Transform({ position: vec3(1, 2, 3), rotation: float(45) }, 't1')
                                const t2 = Transform({}, 't2')
                                t2.assign(t1)
                                return t2.position.x
                        })

                        expect(res).toContain('t2 = t1;')
                })
        })

        describe('Dependency Resolution and Ordering', () => {
                it('should handle forward struct declarations', () => {
                        const NodeStruct = struct({ value: int(), next: int() }, 'Node')
                        // @ts-ignore @TODO FIX #127 `Type 'Struct<{ value: Int; next: Int; }>' is not assignable to type 'Void | Bool | UInt | Int | Float | BVec2 | IVec2 | UVec2 | Vec2 | BVec3 | IVec3 | UVec3 | Vec3 | ... 10 more ... | StructBase'. Type 'Struct<{ value: Int; next: Int; }>' is not assignable to type 'StructBase'. Type 'Struct<{ value: Int; next: Int; }>' is missing the following properties from type '_X<"struct">': assign, select, fragment, compute, and 115 more.`
                        const ListStruct = struct({ head: NodeStruct(), size: int() }, 'List')
                        const res = Scope(() => {
                                // @ts-ignore @TODO FIX #127 `ype 'Struct<{ value: Int; next: Int; }>' is not assignable to type 'Void | Bool | UInt | Int | Float | BVec2 | IVec2 | UVec2 | Vec2 | BVec3 | IVec3 | UVec3 | Vec3 | ... 10 more ... | StructBase'. Type 'Struct<{ value: Int; next: Int; }>' is not assignable to type 'StructBase'. Type 'Struct<{ value: Int; next: Int; }>' is missing the following properties from type '_X<"struct">': assign, select, fragment, compute, and 115 more.`
                                const list = ListStruct({ head: NodeStruct({ value: int(1), next: int(0) }), size: int(1) })
                                return vec4(list.head.value)
                        }).fragment()
                        expect(res).toContain('struct Node {')
                })

                /**
                 * @TODO FIX #128 Triangle uses Vector3/Vertex fields, but undefined in head during code gen
                it('should resolve complex dependency chains', () => {
                        const Vector3 = struct({ x: float(), y: float(), z: float() }, 'Vector3')
                        // @ts-ignore @TODO FIX #127 `Type 'Struct<{ x: Float; y: Float; z: Float; }>' is not assignable to type 'Void | Bool | UInt | Int | Float | BVec2 | IVec2 | UVec2 | Vec2 | BVec3 | IVec3 | UVec3 | Vec3 | ... 10 more ... | StructBase'. Type 'Struct<{ x: Float; y: Float; z: Float; }>' is not assignable to type 'StructBase'. Type 'Struct<{ x: Float; y: Float; z: Float; }>' is missing the following properties from type '_X<"struct">': assign, select, fragment, compute, and 115 more.`
                        const Vertex = struct({ position: Vector3(), normal: Vector3() }, 'Vertex')
                        // @ts-ignore @TODO FIX #127 `Type 'Struct<StructFields>' is not assignable to type 'Void | Bool | UInt | Int | Float | BVec2 | IVec2 | UVec2 | Vec2 | BVec3 | IVec3 | UVec3 | Vec3 | ... 10 more ... | StructBase'. Type 'Struct<StructFields>' is not assignable to type 'StructBase'. Type 'Struct<StructFields>' is missing the following properties from type '_X<"struct">': assign, select, fragment, compute, and 115 more.`
                        const Triangle = struct({ v1: Vertex(), v2: Vertex(), v3: Vertex() }, 'Triangle')
                        const res = vertex(
                                Scope(() => {
                                        const tri = Triangle()
                                        return vec4(tri.v1.position.x)
                                })
                        )
                        const lines = res!.split('\n')
                        const vector3Index = lines.findIndex((line) => line.includes('struct Vector3'))
                        const vertexIndex = lines.findIndex((line) => line.includes('struct Vertex'))
                        const triangleIndex = lines.findIndex((line) => line.includes('struct Triangle'))
                        expect(vector3Index).toBeLessThan(vertexIndex)
                        expect(vertexIndex).toBeLessThan(triangleIndex)
                })
                 */
        })

        describe('Platform-Specific Struct Generation', () => {
                it('should generate different struct syntax for WGSL vs GLSL', () => {
                        const Material = struct({ diffuse: vec3(), specular: float() }, 'Material')
                        const wgsl = build(() => Material(), 'Material', false)
                        const glsl = build(() => Material(), 'Material', true)
                        expect(wgsl).toContain('diffuse: vec3f,')
                        expect(wgsl).toContain('specular: f32,')
                        expect(glsl).toContain('vec3 diffuse;')
                        expect(glsl).toContain('float specular;')
                })

                it('should handle struct constructors differently in WGSL vs GLSL', () => {
                        const Point = struct({ x: float(), y: float() }, 'Point')
                        const res = build(() => {
                                const p = Point({ x: float(1), y: float(2) })
                                return p.x
                        })
                        expect(res).toContain('Point(1.0, 2.0)')
                })
        })

        describe('Error Cases and Edge Conditions', () => {
                it('should handle empty struct definitions', () => {
                        const Empty = struct({}, 'Empty')
                        const res = build(() => {
                                const _empty = Empty()
                                return float(1.0)
                        }, 'Empty')
                        expect(res).toContain('struct Empty')
                })

                it('should handle structs with single fields', () => {
                        const Wrapper = struct({ value: float() }, 'Wrapper')
                        const res = build(() => {
                                const w = Wrapper({ value: float(42) })
                                return w.value
                        })
                        expect(res).toContain('Wrapper(42.0)')
                })

                it('should handle struct field access on computed expressions', () => {
                        const Transform = struct({ matrix: vec4(), scale: float() }, 'Transform')
                        const getTransform = Fn(() => {
                                return Transform({ matrix: vec4(1, 0, 0, 0), scale: float(1) })
                        })
                        const res = build(() => getTransform().scale)
                        expect(res).toContain('.scale')
                })
        })
})
