yarn run v1.22.22
$ cd packages/core && npx jest --coverage
ts-jest[config] (WARN) [94mmessage[0m[90m TS151001: [0mIf you have issues related to imports, you should consider setting `esModuleInterop` to `true` in your TypeScript configuration file (usually `tsconfig.json`). See https://blogs.msdn.microsoft.com/typescript/2018/01/31/announcing-typescript-2-7/#easier-ecmascript-module-interoperability for more information.
ts-jest[config] (WARN) [94mmessage[0m[90m TS151001: [0mIf you have issues related to imports, you should consider setting `esModuleInterop` to `true` in your TypeScript configuration file (usually `tsconfig.json`). See https://blogs.msdn.microsoft.com/typescript/2018/01/31/announcing-typescript-2-7/#easier-ecmascript-module-interoperability for more information.
ts-jest[config] (WARN) [94mmessage[0m[90m TS151001: [0mIf you have issues related to imports, you should consider setting `esModuleInterop` to `true` in your TypeScript configuration file (usually `tsconfig.json`). See https://blogs.msdn.microsoft.com/typescript/2018/01/31/announcing-typescript-2-7/#easier-ecmascript-module-interoperability for more information.
ts-jest[config] (WARN) [94mmessage[0m[90m TS151001: [0mIf you have issues related to imports, you should consider setting `esModuleInterop` to `true` in your TypeScript configuration file (usually `tsconfig.json`). See https://blogs.msdn.microsoft.com/typescript/2018/01/31/announcing-typescript-2-7/#easier-ecmascript-module-interoperability for more information.
ts-jest[config] (WARN) [94mmessage[0m[90m TS151001: [0mIf you have issues related to imports, you should consider setting `esModuleInterop` to `true` in your TypeScript configuration file (usually `tsconfig.json`). See https://blogs.msdn.microsoft.com/typescript/2018/01/31/announcing-typescript-2-7/#easier-ecmascript-module-interoperability for more information.
ts-jest[config] (WARN) [94mmessage[0m[90m TS151001: [0mIf you have issues related to imports, you should consider setting `esModuleInterop` to `true` in your TypeScript configuration file (usually `tsconfig.json`). See https://blogs.msdn.microsoft.com/typescript/2018/01/31/announcing-typescript-2-7/#easier-ecmascript-module-interoperability for more information.
ts-jest[config] (WARN) [94mmessage[0m[90m TS151001: [0mIf you have issues related to imports, you should consider setting `esModuleInterop` to `true` in your TypeScript configuration file (usually `tsconfig.json`). See https://blogs.msdn.microsoft.com/typescript/2018/01/31/announcing-typescript-2-7/#easier-ecmascript-module-interoperability for more information.
ts-jest[config] (WARN) [94mmessage[0m[90m TS151001: [0mIf you have issues related to imports, you should consider setting `esModuleInterop` to `true` in your TypeScript configuration file (usually `tsconfig.json`). See https://blogs.msdn.microsoft.com/typescript/2018/01/31/announcing-typescript-2-7/#easier-ecmascript-module-interoperability for more information.
ts-jest[config] (WARN) [94mmessage[0m[90m TS151001: [0mIf you have issues related to imports, you should consider setting `esModuleInterop` to `true` in your TypeScript configuration file (usually `tsconfig.json`). See https://blogs.msdn.microsoft.com/typescript/2018/01/31/announcing-typescript-2-7/#easier-ecmascript-module-interoperability for more information.
FAIL test/node/1-1-scope-management.test.ts
  ● Test suite failed to run

    [96mtest/node/1-1-scope-management.test.ts[0m:[93m183[0m:[93m17[0m - [91merror[0m[90m TS1005: [0m',' expected.

    [7m183[0m                 })
    [7m   [0m [91m                ~[0m

FAIL test/node/2-2-struct-processing.test.ts
  ● Test suite failed to run

    [96mtest/node/2-2-struct-processing.test.ts[0m:[93m67[0m:[93m30[0m - [91merror[0m[90m TS2345: [0mArgument of type 'Struct<{ position: Vec3; velocity: Vec3; mass: Float; }>' is not assignable to parameter of type 'Y<Constants>'.
      Type 'Struct<{ position: Vec3; velocity: Vec3; mass: Float; }>' is missing the following properties from type 'HTMLElement': accessKey, accessKeyLabel, autocapitalize, autocorrect, and 315 more.

    [7m67[0m                         code(instance, context)
    [7m  [0m [91m                             ~~~~~~~~[0m
    [96mtest/node/2-2-struct-processing.test.ts[0m:[93m80[0m:[93m30[0m - [91merror[0m[90m TS2345: [0mArgument of type 'Struct<{ position: Vec3; color: Vec3; intensity: Float; }>' is not assignable to parameter of type 'Y<Constants>'.
      Type 'Struct<{ position: Vec3; color: Vec3; intensity: Float; }>' is missing the following properties from type 'HTMLElement': accessKey, accessKeyLabel, autocapitalize, autocorrect, and 315 more.

    [7m80[0m                         code(instance, context)
    [7m  [0m [91m                             ~~~~~~~~[0m

FAIL test/node/2-1-storage-buffer.test.ts (19.542 s)
  ● Storage Buffer Management › Storage Buffer Header Generation - WGPU › should assign binding numbers automatically

    expect(received).toContain(expected) // indexOf

    Expected substring: "@binding(1)"
    Received string:    "@group(0) @binding(0) var<storage, read_write> buffer2: array<vec3f>;"

      73 |                         const header2 = context.code?.headers.get('buffer2')
      74 |                         expect(header1).toContain('@binding(0)')
    > 75 |                         expect(header2).toContain('@binding(1)')
         |                                         ^
      76 |                 })
      77 |         })
      78 |

      at Object.<anonymous> (packages/core/test/node/2-1-storage-buffer.test.ts:75:41)

  ● Storage Buffer Management › Element Access Operations › should generate correct WGSL element access code

    expect(received).toBe(expected) // Object.is equality

    Expected: "buffer[i32(3)]"
    Received: "buffer[3]"

      113 |                         const elementAccess = data.element(index)
      114 |                         const result = code(elementAccess, context)
    > 115 |                         expect(result).toBe('buffer[i32(3)]')
          |                                        ^
      116 |                 })
      117 |
      118 |                 it('should generate correct WebGL texture fetch code', () => {

      at Object.<anonymous> (packages/core/test/node/2-1-storage-buffer.test.ts:115:40)

  ● Storage Buffer Management › Element Access Operations › should handle vector storage element access

    expect(received).toBe(expected) // Object.is equality

    Expected: "vectorBuffer[i32(2)]"
    Received: "vectorBuffer[2]"

      134 |                         const elementAccess = vectorData.element(index)
      135 |                         const result = code(elementAccess, context)
    > 136 |                         expect(result).toBe('vectorBuffer[i32(2)]')
          |                                        ^
      137 |                 })
      138 |
      139 |                 it('should handle vec4 storage element access in WebGL', () => {

      at Object.<anonymous> (packages/core/test/node/2-1-storage-buffer.test.ts:136:40)

  ● Storage Buffer Management › Element Assignment Operations › should handle storage buffer element assignment

    expect(received).toBe(expected) // Object.is equality

    Expected: "scatter"
    Received: "gather"

      156 |                         const element = data.element(index)
      157 |                         const assignment = element.assign(value)
    > 158 |                         expect(assignment.type).toBe('scatter')
          |                                                 ^
      159 |                         expect(assignment.props.children?.[0]).toBe(element)
      160 |                         expect(assignment.props.children?.[1]).toBe(value)
      161 |                 })

      at Object.<anonymous> (packages/core/test/node/2-1-storage-buffer.test.ts:158:49)

  ● Storage Buffer Management › Element Assignment Operations › should generate correct WGSL element assignment code

    expect(received).toBe(expected) // Object.is equality

    Expected: "buffer[i32(3)] = 1.5;"
    Received: "buffer[3]"

      168 |                         const assignment = data.element(index).assign(value)
      169 |                         const result = code(assignment, context)
    > 170 |                         expect(result).toBe('buffer[i32(3)] = 1.5;')
          |                                        ^
      171 |                 })
      172 |
      173 |                 it('should generate correct WebGL scatter code', () => {

      at Object.<anonymous> (packages/core/test/node/2-1-storage-buffer.test.ts:170:40)

  ● Storage Buffer Management › Element Assignment Operations › should generate correct WebGL scatter code

    expect(received).toBe(expected) // Object.is equality

    Expected: "_buffer = vec4(3.14, 0.0, 0.0, 1.0);"
    Received: "texelFetch(buffer, ivec2(int(7) % 32, int(7) / 32), 0).x"

      178 |                         const assignment = data.element(index).assign(value)
      179 |                         const result = code(assignment, context)
    > 180 |                         expect(result).toBe('_buffer = vec4(3.14, 0.0, 0.0, 1.0);')
          |                                        ^
      181 |                 })
      182 |
      183 |                 it('should handle vector storage assignment in WebGL', () => {

      at Object.<anonymous> (packages/core/test/node/2-1-storage-buffer.test.ts:180:40)

  ● Storage Buffer Management › Element Assignment Operations › should handle vector storage assignment in WebGL

    expect(received).toBe(expected) // Object.is equality

    Expected: "_vec2Buffer = vec4(vec2(1.0, 2.0), 0.0, 1.0);"
    Received: "texelFetch(vec2Buffer, ivec2(int(2) % 32, int(2) / 32), 0).xy"

      188 |                         const assignment = data.element(index).assign(value)
      189 |                         const result = code(assignment, context)
    > 190 |                         expect(result).toBe('_vec2Buffer = vec4(vec2(1.0, 2.0), 0.0, 1.0);')
          |                                        ^
      191 |                 })
      192 |
      193 |                 it('should handle vec3 storage assignment in WebGL', () => {

      at Object.<anonymous> (packages/core/test/node/2-1-storage-buffer.test.ts:190:40)

  ● Storage Buffer Management › Element Assignment Operations › should handle vec3 storage assignment in WebGL

    expect(received).toBe(expected) // Object.is equality

    Expected: "_vec3Buffer = vec4(vec3(1.0, 2.0, 3.0), 1.0);"
    Received: "texelFetch(vec3Buffer, ivec2(int(1) % 32, int(1) / 32), 0).xyz"

      198 |                         const assignment = data.element(index).assign(value)
      199 |                         const result = code(assignment, context)
    > 200 |                         expect(result).toBe('_vec3Buffer = vec4(vec3(1.0, 2.0, 3.0), 1.0);')
          |                                        ^
      201 |                 })
      202 |
      203 |                 it('should handle vec4 storage assignment correctly', () => {

      at Object.<anonymous> (packages/core/test/node/2-1-storage-buffer.test.ts:200:40)

  ● Storage Buffer Management › Element Assignment Operations › should handle vec4 storage assignment correctly

    expect(received).toBe(expected) // Object.is equality

    Expected: "vec4Buffer[i32(0)] = vec4f(1.0, 2.0, 3.0, 4.0);"
    Received: "vec4Buffer[0]"

      208 |                         const assignment = data.element(index).assign(value)
      209 |                         const result = code(assignment, context)
    > 210 |                         expect(result).toBe('vec4Buffer[i32(0)] = vec4f(1.0, 2.0, 3.0, 4.0);')
          |                                        ^
      211 |                 })
      212 |         })
      213 |

      at Object.<anonymous> (packages/core/test/node/2-1-storage-buffer.test.ts:210:40)

  ● Storage Buffer Management › Storage Buffer in Compute Shaders › should generate storage buffer usage in compute shaders

    expect(received).toContain(expected) // indexOf

    Expected substring: "@group(0) @binding(1) var<storage, read_write> output: array<f32>;"
    Received string:    "struct In {
      @builtin(global_invocation_id) global_invocation_id: vec3u
    }
    @group(0) @binding(0) var<storage, read_write> output: array<f32>;
    @group(0) @binding(0) var<storage, read_write> input: array<f32>;
    fn x1(p0: vec3u) {
    output[p0.x] = (input[p0.x] * 2.0);
    }
    @compute @workgroup_size(32)
    fn main(in: In) {···
      x1(in.global_invocation_id);
    }"

      225 |                         const result = compute(computeFunc(id), context)
      226 |                         expect(result).toContain('@group(0) @binding(0) var<storage, read_write> input: array<f32>;')
    > 227 |                         expect(result).toContain('@group(0) @binding(1) var<storage, read_write> output: array<f32>;')
          |                                        ^
      228 |                         expect(result).toContain('input[')
      229 |                         expect(result).toContain('output[')
      230 |                 })

      at Object.<anonymous> (packages/core/test/node/2-1-storage-buffer.test.ts:227:40)

  ● Storage Buffer Management › Index Calculation and Boundary Handling › should handle computed indices correctly

    expect(received).toBe(expected) // Object.is equality

    Expected: "buffer[(i32(5) + i32(3))]"
    Received: "buffer[(5 + 3)]"

      272 |                         const elementAccess = data.element(computedIndex)
      273 |                         const result = code(elementAccess, context)
    > 274 |                         expect(result).toBe('buffer[(i32(5) + i32(3))]')
          |                                        ^
      275 |                 })
      276 |
      277 |                 it('should handle variable indices', () => {

      at Object.<anonymous> (packages/core/test/node/2-1-storage-buffer.test.ts:274:40)

  ● Storage Buffer Management › Index Calculation and Boundary Handling › should handle WebGL coordinate calculation for texture buffers

    expect(received).toContain(expected) // indexOf

    Expected substring: "int(i32(35)) % 8"
    Received string:    "texelFetch(textureBuffer, ivec2(int(35) % 8, int(35) / 8), 0).x"

      291 |                         const elementAccess = data.element(index)
      292 |                         const result = code(elementAccess, context)
    > 293 |                         expect(result).toContain('int(i32(35)) % 8')
          |                                        ^
      294 |                         expect(result).toContain('int(i32(35)) / 8')
      295 |                 })
      296 |

      at Object.<anonymous> (packages/core/test/node/2-1-storage-buffer.test.ts:293:40)

  ● Storage Buffer Management › Storage Buffer Type Inference › should handle chained operations on storage elements

    expect(received).toBe(expected) // Object.is equality

    Expected: "normalize(data[i32(5)])"
    Received: "normalize(data[5])"

      324 |                         const normalized = element.normalize()
      325 |                         const result = code(normalized, context)
    > 326 |                         expect(result).toBe('normalize(data[i32(5)])')
          |                                        ^
      327 |                 })
      328 |
      329 |                 it('should handle swizzle operations on storage elements', () => {

      at Object.<anonymous> (packages/core/test/node/2-1-storage-buffer.test.ts:326:40)

  ● Storage Buffer Management › Storage Buffer Type Inference › should handle swizzle operations on storage elements

    expect(received).toBe(expected) // Object.is equality

    Expected: "colors[i32(2)].xyz"
    Received: "colors[2].xyz"

      334 |                         const rgb = element.xyz
      335 |                         const result = code(rgb, context)
    > 336 |                         expect(result).toBe('colors[i32(2)].xyz')
          |                                        ^
      337 |                 })
      338 |         })
      339 |

      at Object.<anonymous> (packages/core/test/node/2-1-storage-buffer.test.ts:336:40)

  ● Storage Buffer Management › Platform-Specific Storage Differences › should generate different storage syntax for WebGL vs WebGPU

    expect(received).toBe(expected) // Object.is equality

    Expected: "buffer[i32(10)]"
    Received: "buffer[10]"

      348 |                         const wgpuResult = code(elementAccess, wgpuContext)
      349 |                         const webglResult = code(elementAccess, webglContext)
    > 350 |                         expect(wgpuResult).toBe('buffer[i32(10)]')
          |                                            ^
      351 |                         expect(webglResult).toContain('texelFetch')
      352 |                         expect(webglResult).toContain('ivec2')
      353 |                 })

      at Object.<anonymous> (packages/core/test/node/2-1-storage-buffer.test.ts:350:44)

FAIL test/node/1-2-function-definition.test.ts (19.683 s)
  ● Function Definition System › Basic Function Definition › should create simple function definitions correctly

    expect(received).toMatch(expected)

    Expected pattern: /\(.*\+.*\)/
    Received string:  "fn fn() -> f32 {
    return x0(1.0, 2.0);
    }"

      16 |                         expect(result).toContain('fn ')
      17 |                         expect(result).toContain('return ')
    > 18 |                         expect(result).toMatch(/\(.*\+.*\)/)
         |                                        ^
      19 |                 })
      20 |
      21 |                 it('should infer return types automatically', () => {

      at Object.<anonymous> (packages/core/test/node/1-2-function-definition.test.ts:18:40)

  ● Function Definition System › Basic Function Definition › should infer return types automatically

    expect(received).toContain(expected) // indexOf

    Expected substring: "normalize"
    Received string:    "fn fn() -> vec3f {
    return x2(vec3f(1.0, 2.0, 3.0));
    }"

      27 |                                 return vectorFunc(v)
      28 |                         })
    > 29 |                         expect(result).toContain('normalize')
         |                                        ^
      30 |                         expect(result).toContain('vec3f')
      31 |                 })
      32 |

      at Object.<anonymous> (packages/core/test/node/1-2-function-definition.test.ts:29:40)

  ● Function Definition System › Basic Function Definition › should handle void functions correctly

    expect(received).not.toContain(expected) // indexOf

    Expected substring: not "return"
    Received string:        "fn fn() -> f32 {
    var value: f32 = 5.0;
    return value;
    }"

      41 |                         })
      42 |                         expect(result).toContain('fn ')
    > 43 |                         expect(result).not.toContain('return')
         |                                            ^
      44 |                 })
      45 |         })
      46 |

      at Object.<anonymous> (packages/core/test/node/1-2-function-definition.test.ts:43:44)

  ● Function Definition System › Function Layout Specification › should handle explicit layout specification correctly

    expect(received).toContain(expected) // indexOf

    Expected substring: "first"
    Received string:    "fn fn() -> f32 {
    return multiply(3.0, 4.0);
    }"

      61 |                         })
      62 |                         expect(result).toContain('multiply')
    > 63 |                         expect(result).toContain('first')
         |                                        ^
      64 |                         expect(result).toContain('second')
      65 |                         expect(result).toContain('f32')
      66 |                 })

      at Object.<anonymous> (packages/core/test/node/1-2-function-definition.test.ts:63:40)

  ● Function Definition System › Function Layout Specification › should handle auto type inference in layout

    expect(received).toContain(expected) // indexOf

    Expected substring: "input"
    Received string:    "fn fn() -> vec3f {
    return trigFunc(vec3f(1.0, 2.0, 3.0));
    }"

      78 |                         })
      79 |                         expect(result).toContain('trigFunc')
    > 80 |                         expect(result).toContain('input')
         |                                        ^
      81 |                         expect(result).toContain('sin')
      82 |                 })
      83 |

      at Object.<anonymous> (packages/core/test/node/1-2-function-definition.test.ts:80:40)

  ● Function Definition System › Function Layout Specification › should validate layout name consistency

    expect(received).toContain(expected) // indexOf

    Expected substring: "vectorA"
    Received string:    "fn fn() -> f32 {
    return dotProduct(vec3f(1.0, 0.0, 0.0), vec3f(0.0, 1.0, 0.0));
    }"

       99 |                         })
      100 |                         expect(result).toContain('dotProduct')
    > 101 |                         expect(result).toContain('vectorA')
          |                                        ^
      102 |                         expect(result).toContain('vectorB')
      103 |                 })
      104 |         })

      at Object.<anonymous> (packages/core/test/node/1-2-function-definition.test.ts:101:40)

  ● Function Definition System › Parameter Handling › should handle multiple parameter types correctly

    expect(received).toContain(expected) // indexOf

    Expected substring: "scale"
    Received string:    "fn fn() -> vec3f {
    return conditionalScale(2.0, vec3f(1.0, 2.0, 3.0), true);
    }"

      121 |                                 return mixedFunc(float(2.0), vec3(1, 2, 3), bool(true))
      122 |                         })
    > 123 |                         expect(result).toContain('scale')
          |                                        ^
      124 |                         expect(result).toContain('vec')
      125 |                         expect(result).toContain('doScale')
      126 |                         expect(result).toContain('select')

      at Object.<anonymous> (packages/core/test/node/1-2-function-definition.test.ts:123:40)

  ● Function Definition System › Parameter Handling › should handle parameter binding correctly

    expect(received).toContain(expected) // indexOf

    Expected substring: "temp"
    Received string:    "fn fn() -> f32 {
    return x14(1.0, 3.0);
    }"

      135 |                                 return paramFunc(float(1.0), float(3.0))
      136 |                         })
    > 137 |                         expect(result).toContain('temp')
          |                                        ^
      138 |                         expect(result).toMatch(/p0.*p1/)
      139 |                 })
      140 |

      at Object.<anonymous> (packages/core/test/node/1-2-function-definition.test.ts:137:40)

  ● Function Definition System › Parameter Handling › should handle single parameter functions

    expect(received).toContain(expected) // indexOf

    Expected substring: "abs"
    Received string:    "fn fn() -> f32 {
    return x16(-4.0);
    }"

      146 |                                 return unaryFunc(float(-4.0))
      147 |                         })
    > 148 |                         expect(result).toContain('abs')
          |                                        ^
      149 |                         expect(result).toContain('sqrt')
      150 |                 })
      151 |

      at Object.<anonymous> (packages/core/test/node/1-2-function-definition.test.ts:148:40)

  ● Function Definition System › Parameter Handling › should handle zero parameter functions

    expect(received).toContain(expected) // indexOf

    Expected substring: "3.14159"
    Received string:    "fn fn() -> f32 {
    return x18();
    }"

      157 |                                 return constantFunc()
      158 |                         })
    > 159 |                         expect(result).toContain('3.14159')
          |                                        ^
      160 |                 })
      161 |         })
      162 |

      at Object.<anonymous> (packages/core/test/node/1-2-function-definition.test.ts:159:40)

  ● Function Definition System › return  Type Inference › should infer scalar return types correctly

    expect(received).toContain(expected) // indexOf

    Expected substring: "length"
    Received string:    "x20(vec3f(1.0, 2.0, 3.0))"

      167 |                         })
      168 |                         const { wgsl } = inferAndCode(scalarFunc(vec3(1, 2, 3)))
    > 169 |                         expect(wgsl).toContain('length')
          |                                      ^
      170 |                 })
      171 |
      172 |                 it('should infer vector return types correctly', () => {

      at Object.<anonymous> (packages/core/test/node/1-2-function-definition.test.ts:169:38)

  ● Function Definition System › return  Type Inference › should infer vector return types correctly

    expect(received).toContain(expected) // indexOf

    Expected substring: "cross"
    Received string:    "x21(vec3f(1.0, 0.0, 0.0), vec3f(0.0, 1.0, 0.0))"

      175 |                         })
      176 |                         const { wgsl } = inferAndCode(vectorFunc(vec3(1, 0, 0), vec3(0, 1, 0)))
    > 177 |                         expect(wgsl).toContain('cross')
          |                                      ^
      178 |                 })
      179 |
      180 |                 it('should infer boolean return types correctly', () => {

      at Object.<anonymous> (packages/core/test/node/1-2-function-definition.test.ts:177:38)

  ● Function Definition System › return  Type Inference › should infer boolean return types correctly

    expect(received).toContain(expected) // indexOf

    Expected substring: ">"
    Received string:    "x22(5.0, 3.0)"

      183 |                         })
      184 |                         const { wgsl } = inferAndCode(boolFunc(float(5.0), float(3.0)))
    > 185 |                         expect(wgsl).toContain('>')
          |                                      ^
      186 |                 })
      187 |
      188 |                 it('should handle complex expression return type inference', () => {

      at Object.<anonymous> (packages/core/test/node/1-2-function-definition.test.ts:185:38)

  ● Function Definition System › return  Type Inference › should handle complex expression return type inference

    expect(received).toContain(expected) // indexOf

    Expected substring: "normalize"
    Received string:    "fn fn() -> vec3f {
    return x23(vec3f(1.0, 2.0, 3.0), vec3f(4.0, 5.0, 6.0));
    }"

      195 |                                 return complexFunc(vec3(1, 2, 3), vec3(4, 5, 6))
      196 |                         })
    > 197 |                         expect(result).toContain('normalize')
          |                                        ^
      198 |                         expect(result).toContain('0.5')
      199 |                 })
      200 |         })

      at Object.<anonymous> (packages/core/test/node/1-2-function-definition.test.ts:197:40)

  ● Function Definition System › Nested Function Definitions › should handle nested function calls correctly

    expect(received).toContain(expected) // indexOf

    Expected substring: "sin"
    Received string:    "fn fn() -> f32 {
    return x26(1.0);
    }"

      211 |                                 return outerFunc(float(1.0))
      212 |                         })
    > 213 |                         expect(result).toContain('sin')
          |                                        ^
      214 |                         expect(result).toContain('cos')
      215 |                 })
      216 |

      at Object.<anonymous> (packages/core/test/node/1-2-function-definition.test.ts:213:40)

  ● Function Definition System › Nested Function Definitions › should handle recursive-like function structures

    expect(received).toContain(expected) // indexOf

    Expected substring: "step"
    Received string:    "fn fn() -> f32 {
    return x29(0.75);
    }"

      226 |                                 return processFunc(float(0.75))
      227 |                         })
    > 228 |                         expect(result).toContain('step')
          |                                        ^
      229 |                 })
      230 |         })
      231 |

      at Object.<anonymous> (packages/core/test/node/1-2-function-definition.test.ts:228:40)

  ● Function Definition System › Function Scope and Variable Access › should isolate function variable scope correctly

    expect(received).toContain(expected) // indexOf

    Expected substring: "localVar"
    Received string:    "fn fn() -> f32 {
    var external: f32 = 5.0;
    return x31(external);
    }"

      242 |                                 return computed
      243 |                         })
    > 244 |                         expect(result).toContain('localVar')
          |                                        ^
      245 |                         expect(result).toContain('external')
      246 |                 })
      247 |

      at Object.<anonymous> (packages/core/test/node/1-2-function-definition.test.ts:244:40)

  ● Function Definition System › Function Scope and Variable Access › should handle parameter shadowing correctly

    expect(received).toContain(expected) // indexOf

    Expected substring: "var x:"
    Received string:    "fn fn() -> f32 {
    return x33(2.0);
    }"

      253 |                                 return shadowFunc(float(2.0))
      254 |                         })
    > 255 |                         expect(result).toContain('var x:')
          |                                        ^
      256 |                 })
      257 |
      258 |                 it('should handle closure-like behavior with parameter access', () => {

      at Object.<anonymous> (packages/core/test/node/1-2-function-definition.test.ts:255:40)

  ● Function Definition System › Function Scope and Variable Access › should handle closure-like behavior with parameter access

    expect(received).toMatch(expected)

    Expected pattern: /.*\*.*/
    Received string:  "fn fn() -> f32 {
    return x35(3.0);
    }"

      266 |                                 return closureFunc(float(3.0))
      267 |                         })
    > 268 |                         expect(result).toMatch(/.*\*.*/)
          |                                        ^
      269 |                 })
      270 |         })
      271 |

      at Object.<anonymous> (packages/core/test/node/1-2-function-definition.test.ts:268:40)

  ● Function Definition System › Complex Function Combinations › should handle mathematical function composition

    expect(received).toContain(expected) // indexOf

    Expected substring: "abs"
    Received string:    "fn fn() -> f32 {
    return complexMath(3.0, 4.0);
    }"

      319 |                         })
      320 |                         expect(result).toContain('complexMath')
    > 321 |                         expect(result).toContain('abs')
          |                                        ^
      322 |                 })
      323 |
      324 |                 it('should handle vector processing functions', () => {

      at Object.<anonymous> (packages/core/test/node/1-2-function-definition.test.ts:321:40)

  ● Function Definition System › Complex Function Combinations › should handle vector processing functions

    expect(received).toContain(expected) // indexOf

    Expected substring: "mix"
    Received string:    "fn fn() -> vec3f {
    return processVectors(vec3f(1.0, 0.0, 0.0), vec3f(0.0, 1.0, 0.0), 0.5);
    }"

      344 |                         })
      345 |                         expect(result).toContain('processVectors')
    > 346 |                         expect(result).toContain('mix')
          |                                        ^
      347 |                         expect(result).toContain('normalize')
      348 |                 })
      349 |

      at Object.<anonymous> (packages/core/test/node/1-2-function-definition.test.ts:346:40)

  ● Function Definition System › Complex Function Combinations › should handle conditional function logic

    expect(received).toContain(expected) // indexOf

    Expected substring: "select"
    Received string:    "fn fn() -> f32 {
    return x46(0.75, 0.5);
    }"

      358 |                                 return conditionalFunc(float(0.75), float(0.5))
      359 |                         })
    > 360 |                         expect(result).toContain('select')
          |                                        ^
      361 |                         expect(result).toContain('>')
      362 |                 })
      363 |         })

      at Object.<anonymous> (packages/core/test/node/1-2-function-definition.test.ts:360:40)

FAIL test/node/2-0-varying-processing.test.ts (19.706 s)
  ● Varying Processing System › Vertex Shader Varying Output Generation › should generate correct WGSL vertex output struct with varyings

    expect(received).toContain(expected) // indexOf

    Expected substring: "@location(0) worldPosition: vec3f"
    Received string:    "struct Out {
      @builtin(position) position: vec4f
    }
    fn x1() -> vec4f {
    return out.position;
    }
    @vertex
    fn main() -> Out {
      var out: Out;···
      out.position = x1();
      return out;
    }"

      55 |
      56 |                         expect(result).toContain('struct Out {')
    > 57 |                         expect(result).toContain('@location(0) worldPosition: vec3f')
         |                                        ^
      58 |                         expect(result).toContain('out.worldPosition =')
      59 |                 })
      60 |

      at Object.<anonymous> (packages/core/test/node/2-0-varying-processing.test.ts:57:40)

  ● Varying Processing System › Vertex Shader Varying Output Generation › should generate correct GLSL vertex output with varyings

    expect(received).toContain(expected) // indexOf

    Expected substring: "out vec3 worldPosition;"
    Received string:    "#version 300 es
    vec4 x2() {
    return gl_FragCoord;
    }
    void main() {···
      gl_Position = x2();
    }"

      69 |                         const result = vertex(vertexFunc(), context)
      70 |
    > 71 |                         expect(result).toContain('out vec3 worldPosition;')
         |                                        ^
      72 |                         expect(result).toContain('worldPosition =')
      73 |                 })
      74 |

      at Object.<anonymous> (packages/core/test/node/2-0-varying-processing.test.ts:71:40)

  ● Varying Processing System › Vertex Shader Varying Output Generation › should handle multiple varyings in vertex shader output

    expect(received).toContain(expected) // indexOf

    Expected substring: "@location(0) vPosition: vec3f"
    Received string:    "struct Out {
      @builtin(position) position: vec4f
    }
    fn x3() -> vec4f {
    return out.position;
    }
    @vertex
    fn main() -> Out {
      var out: Out;···
      out.position = x3();
      return out;
    }"

      85 |                         const context = createVertexContext()
      86 |                         const result = vertex(vertexFunc(), context)
    > 87 |                         expect(result).toContain('@location(0) vPosition: vec3f')
         |                                        ^
      88 |                         expect(result).toContain('@location(1) vNormal: vec3f')
      89 |                         expect(result).toContain('@location(2) vColor: vec3f')
      90 |                         expect(result).toContain('out.vPosition =')

      at Object.<anonymous> (packages/core/test/node/2-0-varying-processing.test.ts:87:40)

  ● Varying Processing System › Varying Type Consistency › should maintain type consistency between vertex and fragment shaders

    expect(received).toContain(expected) // indexOf

    Expected substring: "vertexColor: vec3f"
    Received string:    "struct Out {
      @builtin(position) position: vec4f
    }
    fn x9() -> vec4f {
    return out.position;
    }
    @vertex
    fn main() -> Out {
      var out: Out;···
      out.position = x9();
      return out;
    }"

      164 |                         const vertexResult = vertex(vertexFunc(), vertexContext)
      165 |                         const fragmentResult = fragment(fragmentFunc(), fragmentContext)
    > 166 |                         expect(vertexResult).toContain('vertexColor: vec3f')
          |                                              ^
      167 |                         expect(fragmentResult).toContain('vertexColor: vec3f')
      168 |                 })
      169 |

      at Object.<anonymous> (packages/core/test/node/2-0-varying-processing.test.ts:166:46)

  ● Varying Processing System › Varying Type Consistency › should handle scalar varying types correctly

    expect(received).toContain(expected) // indexOf

    Expected substring: "depth: f32"
    Received string:    "struct Out {
      @builtin(position) position: vec4f
    }
    fn x11() -> vec4f {
    return out.position;
    }
    @vertex
    fn main() -> Out {
      var out: Out;···
      out.position = x11();
      return out;
    }"

      176 |                         const context = createVertexContext()
      177 |                         const result = vertex(vertexFunc(), context)
    > 178 |                         expect(result).toContain('depth: f32')
          |                                        ^
      179 |                         expect(result).toContain('out.depth =')
      180 |                 })
      181 |

      at Object.<anonymous> (packages/core/test/node/2-0-varying-processing.test.ts:178:40)

  ● Varying Processing System › Varying Type Consistency › should handle vec4 varying types correctly

    expect(received).toContain(expected) // indexOf

    Expected substring: "data: vec4f"
    Received string:    "struct Out {
      @builtin(position) position: vec4f
    }
    fn x12() -> vec4f {
    return out.position;
    }
    @vertex
    fn main() -> Out {
      var out: Out;···
      out.position = x12();
      return out;
    }"

      188 |                         const context = createVertexContext()
      189 |                         const result = vertex(vertexFunc(), context)
    > 190 |                         expect(result).toContain('data: vec4f')
          |                                        ^
      191 |                 })
      192 |         })
      193 |

      at Object.<anonymous> (packages/core/test/node/2-0-varying-processing.test.ts:190:40)

  ● Varying Processing System › Varying Location Assignment › should assign location numbers sequentially

    expect(received).toContain(expected) // indexOf

    Expected substring: "@location(0) first"
    Received string:    "struct Out {
      @builtin(position) position: vec4f
    }
    fn x13() -> vec4f {
    return out.position;
    }
    @vertex
    fn main() -> Out {
      var out: Out;···
      out.position = x13();
      return out;
    }"

      205 |                         const context = createVertexContext()
      206 |                         const result = vertex(vertexFunc(), context)
    > 207 |                         expect(result).toContain('@location(0) first')
          |                                        ^
      208 |                         expect(result).toContain('@location(1) second')
      209 |                         expect(result).toContain('@location(2) third')
      210 |                 })

      at Object.<anonymous> (packages/core/test/node/2-0-varying-processing.test.ts:207:40)

  ● Varying Processing System › Varying Location Assignment › should start location numbering from 0

    expect(received).toContain(expected) // indexOf

    Expected substring: "@location(0) normal"
    Received string:    "struct Out {
      @builtin(position) position: vec4f
    }
    fn x14() -> vec4f {
    return out.position;
    }
    @vertex
    fn main() -> Out {
      var out: Out;···
      out.position = x14();
      return out;
    }"

      218 |                         const context = createVertexContext()
      219 |                         const result = vertex(vertexFunc(), context)
    > 220 |                         expect(result).toContain('@location(0) normal')
          |                                        ^
      221 |                 })
      222 |         })
      223 |

      at Object.<anonymous> (packages/core/test/node/2-0-varying-processing.test.ts:220:40)

  ● Varying Processing System › Platform-Specific Varying Differences › should generate different syntax for WebGL vs WebGPU varyings

    expect(received).toContain(expected) // indexOf

    Expected substring: "@location(0) texCoord: vec3f"
    Received string:    "struct Out {
      @builtin(position) position: vec4f
    }
    fn x15() -> vec4f {
    return out.position;
    }
    @vertex
    fn main() -> Out {
      var out: Out;···
      out.position = x15();
      return out;
    }"

      233 |                         const wgslResult = vertex(vertexFunc(), wgslContext)
      234 |                         const glslResult = vertex(vertexFunc(), glslContext)
    > 235 |                         expect(wgslResult).toContain('@location(0) texCoord: vec3f')
          |                                            ^
      236 |                         expect(wgslResult).toContain('out.texCoord =')
      237 |                         expect(glslResult).toContain('out vec3 texCoord;')
      238 |                         expect(glslResult).toContain('texCoord =')

      at Object.<anonymous> (packages/core/test/node/2-0-varying-processing.test.ts:235:44)

  ● Varying Processing System › Varying Processing Edge Cases › should handle varying with computed expressions

    expect(received).toContain(expected) // indexOf

    Expected substring: "computed: vec3f"
    Received string:    "struct Out {
      @builtin(position) position: vec4f
    }
    fn x17() -> vec4f {
    return out.position;
    }
    @vertex
    fn main() -> Out {
      var out: Out;···
      out.position = x17();
      return out;
    }"

      264 |                         const context = createVertexContext()
      265 |                         const result = vertex(vertexFunc(), context)
    > 266 |                         expect(result).toContain('computed: vec3f')
          |                                        ^
      267 |                         expect(result).toContain('normalize')
      268 |                         expect(result).toContain('* 2.0')
      269 |                 })

      at Object.<anonymous> (packages/core/test/node/2-0-varying-processing.test.ts:266:40)

  ● Varying Processing System › Varying Processing Edge Cases › should handle varying with function call results

    expect(received).toContain(expected) // indexOf

    Expected substring: "processed: vec3f"
    Received string:    "struct Out {
      @builtin(position) position: vec4f
    }
    fn x19() -> vec4f {
    return out.position;
    }
    @vertex
    fn main() -> Out {
      var out: Out;···
      out.position = x19();
      return out;
    }"

      281 |                         const context = createVertexContext()
      282 |                         const shaderResult = vertex(vertexFunc(), context)
    > 283 |                         expect(shaderResult).toContain('processed: vec3f')
          |                                              ^
      284 |                         expect(shaderResult).toContain('sin')
      285 |                         expect(shaderResult).toContain('cos')
      286 |                 })

      at Object.<anonymous> (packages/core/test/node/2-0-varying-processing.test.ts:283:46)

  ● Varying Processing System › Varying Processing Edge Cases › should handle varying reuse across multiple shaders

    expect(received).toContain(expected) // indexOf

    Expected substring: "sharedData: vec3f"
    Received string:    "struct Out {
      @builtin(position) position: vec4f
    }
    fn x20() -> vec4f {
    return out.position;
    }
    @vertex
    fn main() -> Out {
      var out: Out;···
      out.position = x20();
      return out;
    }"

      303 |                         const vertexResult = vertex(vertexFunc(), vertexContext)
      304 |                         const fragmentResult = fragment(fragmentFunc(), fragmentContext)
    > 305 |                         expect(vertexResult).toContain('sharedData: vec3f')
          |                                              ^
      306 |                         expect(fragmentResult).toContain('sharedData: vec3f')
      307 |                 })
      308 |

      at Object.<anonymous> (packages/core/test/node/2-0-varying-processing.test.ts:305:46)

  ● Varying Processing System › Varying Processing Edge Cases › should handle empty varying lists correctly

    expect(received).not.toContain(expected) // indexOf

    Expected substring: not "@location("
    Received string:        "struct Out {
      @builtin(position) position: vec4f
    }
    fn x23() -> vec4f {
    return vec4f(1.0, 1.0, 1.0, 1.0);
    }
    @fragment
    fn main(out: Out) -> @location(0) vec4f {
      
      return x23();
    }"

      319 |                         const fragmentResult = fragment(fragmentFunc(), fragmentContext)
      320 |                         expect(vertexResult).not.toContain('@location(')
    > 321 |                         expect(fragmentResult).not.toContain('@location(')
          |                                                    ^
      322 |                 })
      323 |         })
      324 | })

      at Object.<anonymous> (packages/core/test/node/2-0-varying-processing.test.ts:321:52)

PASS test/node/0-1-ast-construction.test.ts (19.831 s)
FAIL test/node/1-0-node-operations.test.ts (19.895 s)
  ● Console

    console.warn
      GLRE Type Warning: Invalid operator 'not' between types 'bool' and 'void'

       9 |
      10 | const inferOperator = <T extends C>(L: T, R: T, op: string): T => {
    > 11 |         if (!validateOperatorTypes(L, R, op)) console.warn(`GLRE Type Warning: Invalid operator '${op}' between types '${L}' and '${R}'`)
         |                                                       ^
      12 |         return getOperatorResultType(L, R, op) as T
      13 | }
      14 |

      at warn (packages/core/src/node/utils/infer.ts:11:55)
      at inferOperator (packages/core/src/node/utils/infer.ts:49:41)
      at infer (packages/core/src/node/utils/infer.ts:83:30)
      at Object.<anonymous> (packages/core/test/node/1-0-node-operations.test.ts:178:37)

  ● Node Creation & Operations › Element Access Operations › should handle array element access correctly

    expect(received).toBe(expected) // Object.is equality

    Expected: "float"
    Received: "vec3"

      300 |                         const element = arr.element(index)
      301 |                         expect(element.type).toBe('element')
    > 302 |                         expect(infer(element)).toBe('float')
          |                                                ^
      303 |                 })
      304 |         })
      305 |

      at Object.<anonymous> (packages/core/test/node/1-0-node-operations.test.ts:302:48)

  ● Node Creation & Operations › Assignment Operations › should handle assignment operators correctly

    TypeError: Cannot read properties of undefined (reading 'type')

      350 |                         const addAssign = x.addAssign(y)
      351 |                         const mulAssign = x.mulAssign(y)
    > 352 |                         expect(addAssign.type).toBe('operator')
          |                                          ^
      353 |                         expect(mulAssign.type).toBe('operator')
      354 |                 })
      355 |         })

      at Object.<anonymous> (packages/core/test/node/1-0-node-operations.test.ts:352:42)

FAIL test/node/0-0-type-inference.test.ts (19.984 s)
  ● Type Inference Engine › Swizzle Type Inference › should infer integer vector swizzles correctly

    expect(received).toBe(expected) // Object.is equality

    Expected: "int"
    Received: "float"

      149 |                 it('should infer integer vector swizzles correctly', () => {
      150 |                         const x = ivec3(1, 2, 3)
    > 151 |                         expect(infer(x.x)).toBe('int')
          |                                            ^
      152 |                         expect(infer(x.xy)).toBe('ivec2')
      153 |                         expect(infer(x.xyz)).toBe('ivec3')
      154 |                 })

      at Object.<anonymous> (packages/core/test/node/0-0-type-inference.test.ts:151:44)

  ● Type Inference Engine › Swizzle Type Inference › should infer unsigned vector swizzles correctly

    expect(received).toBe(expected) // Object.is equality

    Expected: "uint"
    Received: "float"

      156 |                 it('should infer unsigned vector swizzles correctly', () => {
      157 |                         const x = uvec2(1, 2)
    > 158 |                         expect(infer(x.x)).toBe('uint')
          |                                            ^
      159 |                         expect(infer(x.xy)).toBe('uvec2')
      160 |                 })
      161 |

      at Object.<anonymous> (packages/core/test/node/0-0-type-inference.test.ts:158:44)

  ● Type Inference Engine › Swizzle Type Inference › should infer boolean vector swizzles correctly

    expect(received).toBe(expected) // Object.is equality

    Expected: "bool"
    Received: "float"

      162 |                 it('should infer boolean vector swizzles correctly', () => {
      163 |                         const x = bvec4(true, false, true, false)
    > 164 |                         expect(infer(x.x)).toBe('bool')
          |                                            ^
      165 |                         expect(infer(x.xy)).toBe('bvec2')
      166 |                         expect(infer(x.xyz)).toBe('bvec3')
      167 |                         expect(infer(x.xyzw)).toBe('bvec4')

      at Object.<anonymous> (packages/core/test/node/0-0-type-inference.test.ts:164:44)

  ● Type Inference Engine › Function Return Type Inference › should infer reduction function returns correctly

    expect(received).toBe(expected) // Object.is equality

    Expected: "int"
    Received: "float"

      182 |                         expect(infer(x.dot(vec3(4, 5, 6)))).toBe('float')
      183 |                         const y = ivec3(1, 2, 3)
    > 184 |                         expect(infer(y.dot(ivec3(4, 5, 6)))).toBe('int')
          |                                                              ^
      185 |                 })
      186 |
      187 |                 it('should infer cross product as vec3', () => {

      at Object.<anonymous> (packages/core/test/node/0-0-type-inference.test.ts:184:62)

FAIL test/node/0-2-code-generation.test.ts (19.993 s)
  ● Code Generation Engine › Variable Reference Code Generation › should generate correct builtin variable references for WGSL

    expect(received).toBe(expected) // Object.is equality

    Expected: "in.position"
    Received: "out.position"

      191 |                         const context = createWGSLContext()
      192 |                         context.label = 'frag'
    > 193 |                         expect(code(pos, context)).toBe('in.position')
          |                                                    ^
      194 |                 })
      195 |         })
      196 |

      at Object.<anonymous> (packages/core/test/node/0-2-code-generation.test.ts:193:52)

  ● Code Generation Engine › Assignment Operation Code Generation › should generate correct assignment operations

    expect(received).toBe(expected) // Object.is equality

    Expected: "1.0 += 2.0;"
    Received: ""

      244 |                         const y = float(2.0)
      245 |                         const context = createWGSLContext()
    > 246 |                         expect(code(x.addAssign(y), context)).toBe('1.0 += 2.0;')
          |                                                               ^
      247 |                         expect(code(x.mulAssign(y), context)).toBe('1.0 *= 2.0;')
      248 |                 })
      249 |         })

      at Object.<anonymous> (packages/core/test/node/0-2-code-generation.test.ts:246:63)

  ● Code Generation Engine › Element Access Code Generation › should generate correct array element access

    expect(received).toBe(expected) // Object.is equality

    Expected: "vec3f(1.0, 2.0, 3.0)[i32(0)]"
    Received: "vec3f(1.0, 2.0, 3.0)[0]"

      254 |                         const index = int(0)
      255 |                         const context = createWGSLContext()
    > 256 |                         expect(code(arr.element(index), context)).toBe('vec3f(1.0, 2.0, 3.0)[i32(0)]')
          |                                                                   ^
      257 |                 })
      258 |         })
      259 | })

      at Object.<anonymous> (packages/core/test/node/0-2-code-generation.test.ts:256:67)

A worker process has failed to exit gracefully and has been force exited. This is likely caused by tests leaking due to improper teardown. Try running with --detectOpenHandles to find leaks. Active timers can also cause this, ensure that .unref() was called on them.
------------|---------|----------|---------|---------|----------------------------------------------------------------------------------
File        | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s                                                                
------------|---------|----------|---------|---------|----------------------------------------------------------------------------------
All files   |   72.42 |    54.19 |    67.2 |   75.96 |                                                                                  
 node       |   74.93 |    64.92 |   58.57 |   80.07 |                                                                                  
  build.ts  |   77.33 |    62.43 |     100 |   85.71 | 47-58,127-133                                                                    
  create.ts |      80 |    62.96 |    64.7 |      95 | 45-47                                                                            
  scope.ts  |    66.1 |    82.05 |   34.61 |   63.04 | 50,54,58-62,75-77,81-95,99-102,106-121                                           
 node/utils |   70.19 |    47.34 |   78.18 |   72.53 |                                                                                  
  const.ts  |     100 |      100 |     100 |     100 |                                                                                  
  infer.ts  |   84.26 |    58.26 |     100 |   87.09 | 59-61,66-71                                                                      
  parse.ts  |   51.75 |    41.32 |   52.63 |   50.98 | 23,34-41,45-53,60-65,69-77,89-98,102-114,136-137,161-164,170,174-175,195-209,213 
  utils.ts  |   80.76 |    40.34 |   86.36 |   92.77 | 51-52,110,125-127                                                                
------------|---------|----------|---------|---------|----------------------------------------------------------------------------------

=============================== Coverage summary ===============================
Statements   : 72.42% ( 620/856 )
Branches     : 54.19% ( 452/834 )
Functions    : 67.2% ( 84/125 )
Lines        : 75.96% ( 452/595 )
================================================================================
Jest: "global" coverage threshold for statements (80%) not met: 72.42%
Jest: "global" coverage threshold for branches (80%) not met: 54.19%
Jest: "global" coverage threshold for lines (80%) not met: 75.96%
Jest: "global" coverage threshold for functions (80%) not met: 67.2%
Test Suites: 8 failed, 1 passed, 9 total
Tests:       59 failed, 141 passed, 200 total
Snapshots:   0 total
Time:        21.823 s, estimated 44 s
Ran all test suites.
error Command failed with exit code 1.
info Visit https://yarnpkg.com/en/docs/cli/run for documentation about this command.
