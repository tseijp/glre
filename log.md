yarn run v1.22.22
$ cd packages/core && npx jest --coverage --detectOpenHandles
ts-jest[config] (WARN) [94mmessage[0m[90m TS151001: [0mIf you have issues related to imports, you should consider setting `esModuleInterop` to `true` in your TypeScript configuration file (usually `tsconfig.json`). See https://blogs.msdn.microsoft.com/typescript/2018/01/31/announcing-typescript-2-7/#easier-ecmascript-module-interoperability for more information.
FAIL test/node/1-2-function-definition.test.ts
  ● Function Definition System › Basic Function Definition › should create simple function definitions correctly

    expect(received).toMatch(expected)

    Expected pattern: /\(.*\+.*\)/
    Received string:  "fn fn() -> f32 {
    return x0(1.0, 2.0);
    }"

      16 |                         expect(res).toContain('fn ')
      17 |                         expect(res).toContain('return ')
    > 18 |                         expect(res).toMatch(/\(.*\+.*\)/)
         |                                     ^
      19 |                 })
      20 |
      21 |                 it('should infer return types automatically', () => {

      at Object.<anonymous> (packages/core/test/node/1-2-function-definition.test.ts:18:37)

  ● Function Definition System › Basic Function Definition › should infer return types automatically

    expect(received).toContain(expected) // indexOf

    Expected substring: "normalize"
    Received string:    "fn fn() -> vec3f {
    return x2(vec3f(1.0, 2.0, 3.0));
    }"

      27 |                                 return vectorFunc(v)
      28 |                         })
    > 29 |                         expect(res).toContain('normalize')
         |                                     ^
      30 |                         expect(res).toContain('vec3f')
      31 |                 })
      32 |

      at Object.<anonymous> (packages/core/test/node/1-2-function-definition.test.ts:29:37)

  ● Function Definition System › Basic Function Definition › should handle void functions correctly

    expect(received).not.toContain(expected) // indexOf

    Expected substring: not "return"
    Received string:        "fn fn() -> f32 {
    var value: f32 = 5.0;
    return value;
    }"

      41 |                         })
      42 |                         expect(res).toContain('fn ')
    > 43 |                         expect(res).not.toContain('return')
         |                                         ^
      44 |                 })
      45 |         })
      46 |

      at Object.<anonymous> (packages/core/test/node/1-2-function-definition.test.ts:43:41)

  ● Function Definition System › Function Layout Specification › should handle explicit layout specification correctly

    expect(received).toContain(expected) // indexOf

    Expected substring: "first"
    Received string:    "fn fn() -> f32 {
    return multiply(3.0, 4.0);
    }"

      61 |                         })
      62 |                         expect(res).toContain('multiply')
    > 63 |                         expect(res).toContain('first')
         |                                     ^
      64 |                         expect(res).toContain('second')
      65 |                         expect(res).toContain('f32')
      66 |                 })

      at Object.<anonymous> (packages/core/test/node/1-2-function-definition.test.ts:63:37)

  ● Function Definition System › Function Layout Specification › should handle auto type inference in layout

    expect(received).toContain(expected) // indexOf

    Expected substring: "input"
    Received string:    "fn fn() -> vec3f {
    return trigFunc(vec3f(1.0, 2.0, 3.0));
    }"

      78 |                         })
      79 |                         expect(res).toContain('trigFunc')
    > 80 |                         expect(res).toContain('input')
         |                                     ^
      81 |                         expect(res).toContain('sin')
      82 |                 })
      83 |

      at Object.<anonymous> (packages/core/test/node/1-2-function-definition.test.ts:80:37)

  ● Function Definition System › Function Layout Specification › should validate layout name consistency

    expect(received).toContain(expected) // indexOf

    Expected substring: "vectorA"
    Received string:    "fn fn() -> f32 {
    return dotProduct(vec3f(1.0, 0.0, 0.0), vec3f(0.0, 1.0, 0.0));
    }"

       99 |                         })
      100 |                         expect(res).toContain('dotProduct')
    > 101 |                         expect(res).toContain('vectorA')
          |                                     ^
      102 |                         expect(res).toContain('vectorB')
      103 |                 })
      104 |         })

      at Object.<anonymous> (packages/core/test/node/1-2-function-definition.test.ts:101:37)

  ● Function Definition System › Parameter Handling › should handle multiple parameter types correctly

    expect(received).toContain(expected) // indexOf

    Expected substring: "scale"
    Received string:    "fn fn() -> vec3f {
    return conditionalScale(2.0, vec3f(1.0, 2.0, 3.0), true);
    }"

      121 |                                 return mixedFunc(float(2.0), vec3(1, 2, 3), bool(true))
      122 |                         })
    > 123 |                         expect(res).toContain('scale')
          |                                     ^
      124 |                         expect(res).toContain('vec')
      125 |                         expect(res).toContain('doScale')
      126 |                         expect(res).toContain('select')

      at Object.<anonymous> (packages/core/test/node/1-2-function-definition.test.ts:123:37)

  ● Function Definition System › Parameter Handling › should handle parameter binding correctly

    expect(received).toContain(expected) // indexOf

    Expected substring: "temp"
    Received string:    "fn fn() -> f32 {
    return x14(1.0, 3.0);
    }"

      135 |                                 return paramFunc(float(1.0), float(3.0))
      136 |                         })
    > 137 |                         expect(res).toContain('temp')
          |                                     ^
      138 |                         expect(res).toMatch(/p0.*p1/)
      139 |                 })
      140 |

      at Object.<anonymous> (packages/core/test/node/1-2-function-definition.test.ts:137:37)

  ● Function Definition System › Parameter Handling › should handle single parameter functions

    expect(received).toContain(expected) // indexOf

    Expected substring: "abs"
    Received string:    "fn fn() -> f32 {
    return x16(-4.0);
    }"

      146 |                                 return unaryFunc(float(-4.0))
      147 |                         })
    > 148 |                         expect(res).toContain('abs')
          |                                     ^
      149 |                         expect(res).toContain('sqrt')
      150 |                 })
      151 |

      at Object.<anonymous> (packages/core/test/node/1-2-function-definition.test.ts:148:37)

  ● Function Definition System › Parameter Handling › should handle zero parameter functions

    expect(received).toContain(expected) // indexOf

    Expected substring: "3.14159"
    Received string:    "fn fn() -> f32 {
    return x18();
    }"

      157 |                                 return constantFunc()
      158 |                         })
    > 159 |                         expect(res).toContain('3.14159')
          |                                     ^
      160 |                 })
      161 |         })
      162 |

      at Object.<anonymous> (packages/core/test/node/1-2-function-definition.test.ts:159:37)

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
    > 197 |                         expect(res).toContain('normalize')
          |                                     ^
      198 |                         expect(res).toContain('0.5')
      199 |                 })
      200 |         })

      at Object.<anonymous> (packages/core/test/node/1-2-function-definition.test.ts:197:37)

  ● Function Definition System › Nested Function Definitions › should handle nested function calls correctly

    expect(received).toContain(expected) // indexOf

    Expected substring: "sin"
    Received string:    "fn fn() -> f32 {
    return x26(1.0);
    }"

      211 |                                 return outerFunc(float(1.0))
      212 |                         })
    > 213 |                         expect(res).toContain('sin')
          |                                     ^
      214 |                         expect(res).toContain('cos')
      215 |                 })
      216 |

      at Object.<anonymous> (packages/core/test/node/1-2-function-definition.test.ts:213:37)

  ● Function Definition System › Nested Function Definitions › should handle recursive-like function structures

    expect(received).toContain(expected) // indexOf

    Expected substring: "step"
    Received string:    "fn fn() -> f32 {
    return x29(0.75);
    }"

      226 |                                 return processFunc(float(0.75))
      227 |                         })
    > 228 |                         expect(res).toContain('step')
          |                                     ^
      229 |                 })
      230 |         })
      231 |

      at Object.<anonymous> (packages/core/test/node/1-2-function-definition.test.ts:228:37)

  ● Function Definition System › Function Scope and Variable Access › should isolate function variable scope correctly

    expect(received).toContain(expected) // indexOf

    Expected substring: "localVar"
    Received string:    "fn fn() -> f32 {
    var external: f32 = 5.0;
    return x31(external);
    }"

      242 |                                 return computed
      243 |                         })
    > 244 |                         expect(res).toContain('localVar')
          |                                     ^
      245 |                         expect(res).toContain('external')
      246 |                 })
      247 |

      at Object.<anonymous> (packages/core/test/node/1-2-function-definition.test.ts:244:37)

  ● Function Definition System › Function Scope and Variable Access › should handle parameter shadowing correctly

    expect(received).toContain(expected) // indexOf

    Expected substring: "var x:"
    Received string:    "fn fn() -> f32 {
    return x33(2.0);
    }"

      253 |                                 return shadowFunc(float(2.0))
      254 |                         })
    > 255 |                         expect(res).toContain('var x:')
          |                                     ^
      256 |                 })
      257 |
      258 |                 it('should handle closure-like behavior with parameter access', () => {

      at Object.<anonymous> (packages/core/test/node/1-2-function-definition.test.ts:255:37)

  ● Function Definition System › Function Scope and Variable Access › should handle closure-like behavior with parameter access

    expect(received).toMatch(expected)

    Expected pattern: /.*\*.*/
    Received string:  "fn fn() -> f32 {
    return x35(3.0);
    }"

      266 |                                 return closureFunc(float(3.0))
      267 |                         })
    > 268 |                         expect(res).toMatch(/.*\*.*/)
          |                                     ^
      269 |                 })
      270 |         })
      271 |

      at Object.<anonymous> (packages/core/test/node/1-2-function-definition.test.ts:268:37)

  ● Function Definition System › Complex Function Combinations › should handle mathematical function composition

    expect(received).toContain(expected) // indexOf

    Expected substring: "abs"
    Received string:    "fn fn() -> f32 {
    return complexMath(3.0, 4.0);
    }"

      319 |                         })
      320 |                         expect(res).toContain('complexMath')
    > 321 |                         expect(res).toContain('abs')
          |                                     ^
      322 |                 })
      323 |
      324 |                 it('should handle vector processing functions', () => {

      at Object.<anonymous> (packages/core/test/node/1-2-function-definition.test.ts:321:37)

  ● Function Definition System › Complex Function Combinations › should handle vector processing functions

    expect(received).toContain(expected) // indexOf

    Expected substring: "mix"
    Received string:    "fn fn() -> vec3f {
    return processVectors(vec3f(1.0, 0.0, 0.0), vec3f(0.0, 1.0, 0.0), 0.5);
    }"

      344 |                         })
      345 |                         expect(res).toContain('processVectors')
    > 346 |                         expect(res).toContain('mix')
          |                                     ^
      347 |                         expect(res).toContain('normalize')
      348 |                 })
      349 |

      at Object.<anonymous> (packages/core/test/node/1-2-function-definition.test.ts:346:37)

  ● Function Definition System › Complex Function Combinations › should handle conditional function logic

    expect(received).toContain(expected) // indexOf

    Expected substring: "select"
    Received string:    "fn fn() -> f32 {
    return x46(0.75, 0.5);
    }"

      358 |                                 return conditionalFunc(float(0.75), float(0.5))
      359 |                         })
    > 360 |                         expect(res).toContain('select')
          |                                     ^
      361 |                         expect(res).toContain('>')
      362 |                 })
      363 |         })

      at Object.<anonymous> (packages/core/test/node/1-2-function-definition.test.ts:360:37)

FAIL test/node/1-1-scope-management.test.ts
  ● Scope Management System › Scope Creation with Scope › should create isolated scopes correctly

    expect(received).toContain(expected) // indexOf

    Expected substring: "var inner: f32 = 2.0;"
    Received string:    "fn fn() -> f32 {
    var outer: f32 = 1.0;
    return outer;
    }"

      62 |                                 return x
      63 |                         })
    > 64 |                         expect(res).toContain('var inner: f32 = 2.0;')
         |                                     ^
      65 |                         expect(res).toContain('outer = inner;')
      66 |                 })
      67 |

      at Object.<anonymous> (packages/core/test/node/1-1-scope-management.test.ts:64:37)

  ● Scope Management System › Scope Creation with Scope › should handle nested scopes correctly

    expect(received).toContain(expected) // indexOf

    Expected substring: "var level1: f32 = 2.0;"
    Received string:    "fn fn() -> f32 {
    var level0: f32 = 1.0;
    return level0;
    }"

      78 |                                 return x
      79 |                         })
    > 80 |                         expect(res).toContain('var level1: f32 = 2.0;')
         |                                     ^
      81 |                         expect(res).toContain('var level2: f32 = 3.0;')
      82 |                         expect(res).toContain('level0 = (level1 + level2);')
      83 |                 })

      at Object.<anonymous> (packages/core/test/node/1-1-scope-management.test.ts:80:37)

  ● Scope Management System › Switch Scopes › should create switch statements with proper scope isolation

    TypeError: (0 , node_1.Switch)(...).Case(...).Case is not a function

      215 |                                         })
      216 |                                         // @ts-ignore @TODO FIX #127 `Property 'Case' does not exist on type '(fun: () => void) => { Case: (...values: X[]) => (fun: () => void) => ...; Default: (fun: () => void) => void; }'.`
    > 217 |                                         .Case(int(2), () => {
          |                                          ^
      218 |                                                 res.assign(float(20.0))
      219 |                                         })
      220 |                                         .Default(() => {

      at packages/core/test/node/1-1-scope-management.test.ts:217:42
      at fun (packages/core/src/node/scope.ts:131:33)
      at fun (packages/core/src/node/scope.ts:58:19)
      at ret (packages/core/src/node/scope.ts:131:23)
      at build (packages/core/test-utils.ts:7:68)
      at Object.<anonymous> (packages/core/test/node/1-1-scope-management.test.ts:208:42)

  ● Scope Management System › Switch Scopes › should handle multiple case values correctly

    TypeError: (0 , node_1.Switch)(...).Case(...).Default is not a function

      240 |                                         })
      241 |                                         // @ts-ignore @TODO FIX #127 `Property 'Default' does not exist on type '(fun: () => void) => { Case: (...values: X[]) => (fun: () => void) => ...; Default: (fun: () => void) => void; }'.`
    > 242 |                                         .Default(() => {
          |                                          ^
      243 |                                                 output.assign(float(-1.0))
      244 |                                         })
      245 |                                 return output

      at packages/core/test/node/1-1-scope-management.test.ts:242:42
      at fun (packages/core/src/node/scope.ts:131:33)
      at fun (packages/core/src/node/scope.ts:58:19)
      at ret (packages/core/src/node/scope.ts:131:23)
      at build (packages/core/test-utils.ts:7:68)
      at Object.<anonymous> (packages/core/test/node/1-1-scope-management.test.ts:233:42)

  ● Scope Management System › Function Scope Isolation › should isolate function scope from outer scope

    expect(received).toContain(expected) // indexOf

    Expected substring: "innerVar"
    Received string:    "fn fn() -> f32 {
    return x22(outerVar);
    }"

      260 |                                 return callResult
      261 |                         })
    > 262 |                         expect(res).toContain('innerVar')
          |                                     ^
      263 |                         expect(res).toMatch(/fn.*innerVar/)
      264 |                 })
      265 |

      at Object.<anonymous> (packages/core/test/node/1-1-scope-management.test.ts:262:37)

  ● Scope Management System › Function Scope Isolation › should handle parameter scope correctly

    expect(received).toContain(expected) // indexOf

    Expected substring: "first"
    Received string:    "fn fn() -> f32 {
    return addNumbers(1.0, 2.0);
    }"

      282 |                         })
      283 |                         expect(res).toContain('addNumbers')
    > 284 |                         expect(res).toContain('first')
          |                                     ^
      285 |                         expect(res).toContain('second')
      286 |                 })
      287 |         })

      at Object.<anonymous> (packages/core/test/node/1-1-scope-management.test.ts:284:37)

FAIL test/node/2-2-struct-processing.test.ts
  ● Struct Processing System › Struct Definition › should handle struct instantiation without initial values

    TypeError: Cannot read properties of undefined (reading '1')

      10 | // Unified logic with types.ts inferArrayElement type
      11 | const inferSwizzleType = <T extends C>(L: T, len: 1 | 2 | 3 | 4): T => {
    > 12 |         return SWIZZLE_RESULT_MAP[SWIZZLE_BASE_MAP[L as 'float']][len] as T
         |                                                                  ^
      13 | }
      14 |
      15 | // Unified logic with types.ts InferOperator type

      at inferSwizzleType (packages/core/src/node/utils/infer.ts:12:66)
      at inferSwizzleType (packages/core/src/node/utils/infer.ts:71:42)
      at infer (packages/core/src/node/utils/infer.ts:89:30)
      at inferImpl (packages/core/src/node/utils/infer.ts:55:60)
      at infer (packages/core/src/node/utils/infer.ts:89:30)
      at inferFromArray (packages/core/src/node/utils/infer.ts:40:26)
      at inferFromArray (packages/core/src/node/utils/infer.ts:79:31)
      at infer (packages/core/src/node/utils/infer.ts:89:30)
      at inferFromArray (packages/core/src/node/utils/infer.ts:40:26)
      at inferFromArray (packages/core/src/node/utils/infer.ts:61:24)
      at infer (packages/core/src/node/utils/infer.ts:89:30)
      at parseDefine (packages/core/src/node/utils/parse.ts:132:33)
      at code (packages/core/src/node/utils/index.ts:85:82)
      at build (packages/core/test-utils.ts:8:13)
      at Object.<anonymous> (packages/core/test/node/2-2-struct-processing.test.ts:19:42)

  ● Struct Processing System › Struct Definition › should handle struct instantiation with initial values

    expect(received).toContain(expected) // indexOf

    Expected substring: "struct Transform {"
    Received string:    "fn fn() -> f32 {
    var x3: Transform = Transform(vec3f(1.0, 2.0, 3.0), 2.0);
    return length(x3.position);
    }"

      41 |                                 return t.position.length()
      42 |                         })
    > 43 |                         expect(res).toContain('struct Transform {')
         |                                     ^
      44 |                         expect(res).toContain('position: vec3f')
      45 |                         expect(res).toContain('scale: f32')
      46 |                         expect(res).toContain('Transform(vec3f(1.0, 2.0, 3.0), 2.0)')

      at Object.<anonymous> (packages/core/test/node/2-2-struct-processing.test.ts:43:37)

  ● Struct Processing System › Struct Definition › should auto-generate struct names when not provided

    expect(received).toMatch(expected)

    Expected pattern: /struct x\d+ \{/
    Received string:  "fn fn() -> f32 {
    var x6: x4 = x4();
    return length(x6.color);
    }"

      56 |                                 return m.color.length()
      57 |                         })
    > 58 |                         expect(res).toMatch(/struct x\d+ \{/)
         |                                     ^
      59 |                 })
      60 |         })
      61 |

      at Object.<anonymous> (packages/core/test/node/2-2-struct-processing.test.ts:58:37)

  ● Struct Processing System › Struct Header Generation › should generate correct WGSL struct headers

    expect(received).toContain(expected) // indexOf

    Matcher error: received value must not be null nor undefined

    Received has value: undefined

      68 |                         code(instance, c)
      69 |                         const header = c.code?.headers.get('Particle')
    > 70 |                         expect(header).toContain('struct Particle {')
         |                                        ^
      71 |                         expect(header).toContain('position: vec3f,')
      72 |                         expect(header).toContain('velocity: vec3f,')
      73 |                         expect(header).toContain('mass: f32,')

      at Object.<anonymous> (packages/core/test/node/2-2-struct-processing.test.ts:70:40)

  ● Struct Processing System › Struct Header Generation › should generate correct GLSL struct headers

    expect(received).toContain(expected) // indexOf

    Matcher error: received value must not be null nor undefined

    Received has value: undefined

      82 |                         code(instance, c)
      83 |                         const header = c.code?.headers.get('Light')
    > 84 |                         expect(header).toContain('struct Light {')
         |                                        ^
      85 |                         expect(header).toContain('vec3 position;')
      86 |                         expect(header).toContain('vec3 color;')
      87 |                         expect(header).toContain('float intensity;')

      at Object.<anonymous> (packages/core/test/node/2-2-struct-processing.test.ts:84:40)

  ● Struct Processing System › Struct Header Generation › should handle complex nested field types

    expect(received).toContain(expected) // indexOf

    Matcher error: received value must not be null nor undefined

    Received has value: undefined

       96 |                         code(instance, c)
       97 |                         const header = c.code?.headers.get('Material')
    >  98 |                         expect(header).toContain('albedo: vec4f,')
          |                                        ^
       99 |                         expect(header).toContain('normal: vec3f,')
      100 |                         expect(header).toContain('metallic: f32,')
      101 |                         expect(header).toContain('roughness: f32,')

      at Object.<anonymous> (packages/core/test/node/2-2-struct-processing.test.ts:98:40)

  ● Struct Processing System › Struct Field Access › should handle field access correctly

    expect(received).toContain(expected) // indexOf

    Expected substring: "cam.position"
    Received string:    "fn fn() -> f32 {
    var x11: Camera = Camera(vec3f(0.0, 0.0, 5.0), vec3f(0.0, 0.0, 0.0), 45.0);
    return length(x11.position);
    }"

      115 |                                 return cam.position.length()
      116 |                         })
    > 117 |                         expect(res).toContain('cam.position')
          |                                     ^
      118 |                         expect(res).toContain('length(cam.position)')
      119 |                 })
      120 |

      at Object.<anonymous> (packages/core/test/node/2-2-struct-processing.test.ts:117:37)

  ● Struct Processing System › Struct Field Access › should handle field assignment correctly

    expect(received).toContain(expected) // indexOf

    Expected substring: "transform.position = vec3f(1.0, 2.0, 3.0);"
    Received string:    "fn fn() -> f32 {
    var x13: Transform = Transform();
    x13.position = vec3f(1.0, 2.0, 3.0);
    x13.rotation = vec3f(0.0, 0.0, 0.0);
    return x13.position.x;
    }"

      127 |                                 return transform.position.x
      128 |                         })
    > 129 |                         expect(res).toContain('transform.position = vec3f(1.0, 2.0, 3.0);')
          |                                     ^
      130 |                         expect(res).toContain('transform.rotation = vec3f(0.0, 0.0, 0.0);')
      131 |                 })
      132 |

      at Object.<anonymous> (packages/core/test/node/2-2-struct-processing.test.ts:129:37)

  ● Struct Processing System › Struct Field Access › should handle chained field access operations

    expect(received).toContain(expected) // indexOf

    Expected substring: "normalize(sphere.center)"
    Received string:    "fn fn() -> vec3f {
    var x15: Sphere = Sphere(vec3f(1.0, 2.0, 3.0), 2.5);
    return (normalize(x15.center) * x15.radius);
    }"

      140 |                                 return sphere.center.normalize().mul(sphere.radius)
      141 |                         })
    > 142 |                         expect(res).toContain('normalize(sphere.center)')
          |                                     ^
      143 |                         expect(res).toContain('sphere.radius')
      144 |                 })
      145 |

      at Object.<anonymous> (packages/core/test/node/2-2-struct-processing.test.ts:142:37)

  ● Struct Processing System › Struct Field Access › should handle field swizzling operations

    expect(received).toContain(expected) // indexOf

    Expected substring: "rect.position.xy"
    Received string:    "fn fn() -> vec2f {
    var x17: Rect = Rect(vec4f(0.0, 0.0, 100.0, 100.0), vec2f(50.0, 25.0));
    return (x17.position.xy + x17.size);
    }"

      153 |                                 return rect.position.xy.add(rect.size)
      154 |                         })
    > 155 |                         expect(res).toContain('rect.position.xy')
          |                                     ^
      156 |                         expect(res).toContain('rect.size')
      157 |                 })
      158 |         })

      at Object.<anonymous> (packages/core/test/node/2-2-struct-processing.test.ts:155:37)

  ● Struct Processing System › Struct Constructor Generation › should generate struct constructors with parameters

    TypeError: Cannot read properties of undefined (reading '1')

      10 | // Unified logic with types.ts inferArrayElement type
      11 | const inferSwizzleType = <T extends C>(L: T, len: 1 | 2 | 3 | 4): T => {
    > 12 |         return SWIZZLE_RESULT_MAP[SWIZZLE_BASE_MAP[L as 'float']][len] as T
         |                                                                  ^
      13 | }
      14 |
      15 | // Unified logic with types.ts InferOperator type

      at inferSwizzleType (packages/core/src/node/utils/infer.ts:12:66)
      at inferSwizzleType (packages/core/src/node/utils/infer.ts:71:42)
      at infer (packages/core/src/node/utils/infer.ts:89:30)
      at inferFromArray (packages/core/src/node/utils/infer.ts:40:26)
      at inferFromArray (packages/core/src/node/utils/infer.ts:79:31)
      at infer (packages/core/src/node/utils/infer.ts:89:30)
      at inferFromArray (packages/core/src/node/utils/infer.ts:40:26)
      at inferFromArray (packages/core/src/node/utils/infer.ts:61:24)
      at infer (packages/core/src/node/utils/infer.ts:89:30)
      at parseDefine (packages/core/src/node/utils/parse.ts:132:33)
      at code (packages/core/src/node/utils/index.ts:85:82)
      at build (packages/core/test-utils.ts:8:13)
      at Object.<anonymous> (packages/core/test/node/2-2-struct-processing.test.ts:163:42)

  ● Struct Processing System › Nested Struct Support › should handle structs with struct fields

    TypeError: Cannot read properties of undefined (reading '1')

      10 | // Unified logic with types.ts inferArrayElement type
      11 | const inferSwizzleType = <T extends C>(L: T, len: 1 | 2 | 3 | 4): T => {
    > 12 |         return SWIZZLE_RESULT_MAP[SWIZZLE_BASE_MAP[L as 'float']][len] as T
         |                                                                  ^
      13 | }
      14 |
      15 | // Unified logic with types.ts InferOperator type

      at inferSwizzleType (packages/core/src/node/utils/infer.ts:12:66)
      at inferSwizzleType (packages/core/src/node/utils/infer.ts:71:42)
      at infer (packages/core/src/node/utils/infer.ts:89:30)
      at inferFromArray (packages/core/src/node/utils/infer.ts:40:26)
      at inferFromArray (packages/core/src/node/utils/infer.ts:79:31)
      at infer (packages/core/src/node/utils/infer.ts:89:30)
      at inferFromArray (packages/core/src/node/utils/infer.ts:40:26)
      at inferFromArray (packages/core/src/node/utils/infer.ts:61:24)
      at infer (packages/core/src/node/utils/infer.ts:89:30)
      at parseDefine (packages/core/src/node/utils/parse.ts:132:33)
      at code (packages/core/src/node/utils/index.ts:85:82)
      at build (packages/core/test-utils.ts:8:13)
      at Object.<anonymous> (packages/core/test/node/2-2-struct-processing.test.ts:203:42)

  ● Struct Processing System › Nested Struct Support › should handle complex nested structures

    expect(received).toContain(expected) // indexOf

    Expected substring: "struct Material"
    Received string:    "fn fn() -> f32 {
    var x32: Material = Material(vec3f(1.0, 0.0, 0.0), 0.8);
    var x33: Mesh = Mesh(x32, 1000);
    return length(x33.material.color);
    }"

      224 |                                 return mesh.material.color.length()
      225 |                         })
    > 226 |                         expect(res).toContain('struct Material')
          |                                     ^
      227 |                         expect(res).toContain('struct Mesh')
      228 |                         expect(res).toContain('mesh.material.color')
      229 |                 })

      at Object.<anonymous> (packages/core/test/node/2-2-struct-processing.test.ts:226:37)

  ● Struct Processing System › Struct Type Inference › should infer struct types correctly

    TypeError: Cannot read properties of undefined (reading '1')

      10 | // Unified logic with types.ts inferArrayElement type
      11 | const inferSwizzleType = <T extends C>(L: T, len: 1 | 2 | 3 | 4): T => {
    > 12 |         return SWIZZLE_RESULT_MAP[SWIZZLE_BASE_MAP[L as 'float']][len] as T
         |                                                                  ^
      13 | }
      14 |
      15 | // Unified logic with types.ts InferOperator type

      at inferSwizzleType (packages/core/src/node/utils/infer.ts:12:66)
      at inferSwizzleType (packages/core/src/node/utils/infer.ts:71:42)
      at infer (packages/core/src/node/utils/infer.ts:89:30)
      at inferImpl (packages/core/src/node/utils/infer.ts:55:60)
      at infer (packages/core/src/node/utils/infer.ts:89:30)
      at inferFromArray (packages/core/src/node/utils/infer.ts:40:26)
      at inferFromArray (packages/core/src/node/utils/infer.ts:79:31)
      at infer (packages/core/src/node/utils/infer.ts:89:30)
      at inferFromArray (packages/core/src/node/utils/infer.ts:40:26)
      at inferFromArray (packages/core/src/node/utils/infer.ts:61:24)
      at infer (packages/core/src/node/utils/infer.ts:89:30)
      at parseDefine (packages/core/src/node/utils/parse.ts:132:33)
      at code (packages/core/src/node/utils/index.ts:85:82)
      at build (packages/core/test-utils.ts:8:13)
      at Object.<anonymous> (packages/core/test/node/2-2-struct-processing.test.ts:235:42)

  ● Struct Processing System › Struct Type Inference › should handle field type inference within structs

    expect(received).toContain(expected) // indexOf

    Expected substring: "particle.position = vec3f(0.0, 1.0, 0.0);"
    Received string:    "fn fn() -> f32 {
    var x38: Particle = Particle();
    x38.position = vec3f(0.0, 1.0, 0.0);
    x38.velocity = normalize(x38.position);
    return length(x38.velocity);
    }"

      250 |                                 return particle.velocity.length()
      251 |                         })
    > 252 |                         expect(res).toContain('particle.position = vec3f(0.0, 1.0, 0.0);')
          |                                     ^
      253 |                         expect(res).toContain('particle.velocity = normalize(particle.position);')
      254 |                 })
      255 |         })

      at Object.<anonymous> (packages/core/test/node/2-2-struct-processing.test.ts:252:37)

  ● Struct Processing System › Struct Operations and Functions › should handle struct instances in function parameters

    expect(received).toContain(expected) // indexOf

    Expected substring: "vec: Vector2"
    Received string:    "fn fn() -> f32 {
    var x41: Vector2 = Vector2(3.0, 4.0);
    return vectorLength(x41);
    }"

      271 |                         })
      272 |                         expect(res).toContain('vectorLength')
    > 273 |                         expect(res).toContain('vec: Vector2')
          |                                     ^
      274 |                 })
      275 |
      276 |                 it('should handle struct return values from functions', () => {

      at Object.<anonymous> (packages/core/test/node/2-2-struct-processing.test.ts:273:37)

  ● Struct Processing System › Struct Operations and Functions › should handle struct return values from functions

    TypeError: Cannot read properties of undefined (reading '1')

      10 | // Unified logic with types.ts inferArrayElement type
      11 | const inferSwizzleType = <T extends C>(L: T, len: 1 | 2 | 3 | 4): T => {
    > 12 |         return SWIZZLE_RESULT_MAP[SWIZZLE_BASE_MAP[L as 'float']][len] as T
         |                                                                  ^
      13 | }
      14 |
      15 | // Unified logic with types.ts InferOperator type

      at inferSwizzleType (packages/core/src/node/utils/infer.ts:12:66)
      at inferSwizzleType (packages/core/src/node/utils/infer.ts:71:42)
      at infer (packages/core/src/node/utils/infer.ts:89:30)
      at inferFromArray (packages/core/src/node/utils/infer.ts:40:26)
      at inferFromArray (packages/core/src/node/utils/infer.ts:79:31)
      at infer (packages/core/src/node/utils/infer.ts:89:30)
      at inferFromArray (packages/core/src/node/utils/infer.ts:40:26)
      at inferFromArray (packages/core/src/node/utils/infer.ts:61:24)
      at infer (packages/core/src/node/utils/infer.ts:89:30)
      at parseDefine (packages/core/src/node/utils/parse.ts:132:33)
      at code (packages/core/src/node/utils/index.ts:85:82)
      at build (packages/core/test-utils.ts:8:13)
      at Object.<anonymous> (packages/core/test/node/2-2-struct-processing.test.ts:282:42)

  ● Struct Processing System › Struct Operations and Functions › should handle struct copying and assignment

    expect(received).toContain(expected) // indexOf

    Expected substring: "t2 = t1;"
    Received string:    "fn fn() -> f32 {
    var x46: Transform = Transform(vec3f(1.0, 2.0, 3.0), 45.0);
    var x47: Transform = Transform();
    x47 = x46;
    return x47.position.x;
    }"

      297 |                         })
      298 |
    > 299 |                         expect(res).toContain('t2 = t1;')
          |                                     ^
      300 |                 })
      301 |         })
      302 |

      at Object.<anonymous> (packages/core/test/node/2-2-struct-processing.test.ts:299:37)

  ● Struct Processing System › Dependency Resolution and Ordering › should handle forward struct declarations

    expect(received).toContain(expected) // indexOf

    Expected substring: "struct Node {"
    Received string:    "fn fn() -> f32 {
    var x50: Node = Node(1, 0);
    var x51: List = List(x50, 1);
    return f32(x51.head.value);
    }"

      311 |                                 return list.head.value.toFloat()
      312 |                         })
    > 313 |                         expect(res).toContain('struct Node {')
          |                                     ^
      314 |                         expect(res).toContain('struct List {')
      315 |                 })
      316 |

      at Object.<anonymous> (packages/core/test/node/2-2-struct-processing.test.ts:313:37)

  ● Struct Processing System › Dependency Resolution and Ordering › should resolve complex dependency chains

    expect(received).toBeLessThan(expected)

    Expected: < -1
    Received:   -1

      329 |                         const vertexIndex = lines.findIndex((line) => line.includes('struct Vertex'))
      330 |                         const triangleIndex = lines.findIndex((line) => line.includes('struct Triangle'))
    > 331 |                         expect(vector3Index).toBeLessThan(vertexIndex)
          |                                              ^
      332 |                         expect(vertexIndex).toBeLessThan(triangleIndex)
      333 |                 })
      334 |         })

      at Object.<anonymous> (packages/core/test/node/2-2-struct-processing.test.ts:331:46)

  ● Struct Processing System › Platform-Specific Struct Generation › should generate different struct syntax for WGSL vs GLSL

    expect(received).toContain(expected) // indexOf

    Matcher error: received value must not be null nor undefined

    Received has value: undefined

      346 |                         const wgslHeader = wgslContext.code?.headers.get('Material')
      347 |                         const glslHeader = glslContext.code?.headers.get('Material')
    > 348 |                         expect(wgslHeader).toContain('diffuse: vec3f,')
          |                                            ^
      349 |                         expect(wgslHeader).toContain('specular: f32,')
      350 |                         expect(glslHeader).toContain('vec3 diffuse;')
      351 |                         expect(glslHeader).toContain('float specular;')

      at Object.<anonymous> (packages/core/test/node/2-2-struct-processing.test.ts:348:44)

  ● Struct Processing System › Platform-Specific Struct Generation › should handle struct constructors differently in WGSL vs GLSL

    TypeError: Cannot read properties of undefined (reading '1')

      10 | // Unified logic with types.ts inferArrayElement type
      11 | const inferSwizzleType = <T extends C>(L: T, len: 1 | 2 | 3 | 4): T => {
    > 12 |         return SWIZZLE_RESULT_MAP[SWIZZLE_BASE_MAP[L as 'float']][len] as T
         |                                                                  ^
      13 | }
      14 |
      15 | // Unified logic with types.ts InferOperator type

      at inferSwizzleType (packages/core/src/node/utils/infer.ts:12:66)
      at inferSwizzleType (packages/core/src/node/utils/infer.ts:71:42)
      at infer (packages/core/src/node/utils/infer.ts:89:30)
      at inferFromArray (packages/core/src/node/utils/infer.ts:40:26)
      at inferFromArray (packages/core/src/node/utils/infer.ts:79:31)
      at infer (packages/core/src/node/utils/infer.ts:89:30)
      at inferFromArray (packages/core/src/node/utils/infer.ts:40:26)
      at inferFromArray (packages/core/src/node/utils/infer.ts:61:24)
      at infer (packages/core/src/node/utils/infer.ts:89:30)
      at parseDefine (packages/core/src/node/utils/parse.ts:132:33)
      at code (packages/core/src/node/utils/index.ts:85:82)
      at build (packages/core/test-utils.ts:8:13)
      at Object.<anonymous> (packages/core/test/node/2-2-struct-processing.test.ts:356:49)

  ● Struct Processing System › Error Cases and Edge Conditions › should handle empty struct definitions

    expect(received).toContain(expected) // indexOf

    Expected substring: "struct Empty"
    Received string:    "fn fn() -> f32 {
    var x63: Empty = Empty();
    return 1.0;
    }"

      369 |                                 return float(1.0)
      370 |                         })
    > 371 |                         expect(res).toContain('struct Empty')
          |                                     ^
      372 |                 })
      373 |
      374 |                 it('should handle structs with single fields', () => {

      at Object.<anonymous> (packages/core/test/node/2-2-struct-processing.test.ts:371:37)

  ● Struct Processing System › Error Cases and Edge Conditions › should handle structs with single fields

    expect(received).toContain(expected) // indexOf

    Expected substring: "struct Wrapper {"
    Received string:    "fn fn() -> f32 {
    var x65: Wrapper = Wrapper(42.0);
    return x65.value;
    }"

      378 |                                 return w.value
      379 |                         })
    > 380 |                         expect(res).toContain('struct Wrapper {')
          |                                     ^
      381 |                         expect(res).toContain('value: f32')
      382 |                         expect(res).toContain('Wrapper(42.0)')
      383 |                 })

      at Object.<anonymous> (packages/core/test/node/2-2-struct-processing.test.ts:380:37)

FAIL test/node/1-0-node-operations.test.ts
  ● Console

    console.warn
      GLRE Type Warning: Invalid operator 'not' between types 'bool' and 'void'

      15 | // Unified logic with types.ts InferOperator type
      16 | const inferOperator = <T extends C>(L: T, R: T, op: string): T => {
    > 17 |         if (!validateOperatorTypes(L, R, op)) console.warn(`GLRE Type Warning: Invalid operator '${op}' between types '${L}' and '${R}'`)
         |                                                       ^
      18 |         return getOperatorResultType(L, R, op) as T
      19 | }
      20 |

      at warn (packages/core/src/node/utils/infer.ts:17:55)
      at inferOperator (packages/core/src/node/utils/infer.ts:55:41)
      at infer (packages/core/src/node/utils/infer.ts:89:30)
      at Object.<anonymous> (packages/core/test/node/1-0-node-operations.test.ts:175:37)

  ● Node Creation & Operations › Element Access Operations › should handle array element access correctly

    expect(received).toBe(expected) // Object.is equality

    Expected: "float"
    Received: "vec3"

      297 |                         const element = arr.element(index)
      298 |                         expect(element.type).toBe('element')
    > 299 |                         expect(infer(element)).toBe('float')
          |                                                ^
      300 |                 })
      301 |         })
      302 |

      at Object.<anonymous> (packages/core/test/node/1-0-node-operations.test.ts:299:48)

FAIL test/node/2-1-storage-buffer.test.ts
  ● Storage Buffer Management › Storage Buffer Header Generation - WGPU › should assign binding numbers automatically

    expect(received).toContain(expected) // indexOf

    Expected substring: "@binding(1)"
    Received string:    "@group(0) @binding(0) var<storage, read_write> buffer2: array<vec3f>;"

      73 |                         const header2 = c.code?.headers.get('buffer2')
      74 |                         expect(header1).toContain('@binding(0)')
    > 75 |                         expect(header2).toContain('@binding(1)')
         |                                         ^
      76 |                 })
      77 |         })
      78 |

      at Object.<anonymous> (packages/core/test/node/2-1-storage-buffer.test.ts:75:41)

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

    Expected: "buffer[3] = 1.5;"
    Received: "buffer[3]"

      168 |                         const assignment = data.element(index).assign(value)
      169 |                         const res = code(assignment, c)
    > 170 |                         expect(res).toBe('buffer[3] = 1.5;')
          |                                     ^
      171 |                 })
      172 |
      173 |                 it('should generate correct WebGL scatter code', () => {

      at Object.<anonymous> (packages/core/test/node/2-1-storage-buffer.test.ts:170:37)

  ● Storage Buffer Management › Element Assignment Operations › should generate correct WebGL scatter code

    expect(received).toBe(expected) // Object.is equality

    Expected: "_buffer = vec4(3.14, 0.0, 0.0, 1.0);"
    Received: "texelFetch(buffer, ivec2(int(7) % 32, int(7) / 32), 0).x"

      178 |                         const assignment = data.element(index).assign(value)
      179 |                         const res = code(assignment, c)
    > 180 |                         expect(res).toBe('_buffer = vec4(3.14, 0.0, 0.0, 1.0);')
          |                                     ^
      181 |                 })
      182 |
      183 |                 it('should handle vector storage assignment in WebGL', () => {

      at Object.<anonymous> (packages/core/test/node/2-1-storage-buffer.test.ts:180:37)

  ● Storage Buffer Management › Element Assignment Operations › should handle vector storage assignment in WebGL

    expect(received).toBe(expected) // Object.is equality

    Expected: "_vec2Buffer = vec4(vec2(1.0, 2.0), 0.0, 1.0);"
    Received: "texelFetch(vec2Buffer, ivec2(int(2) % 32, int(2) / 32), 0).xy"

      188 |                         const assignment = data.element(index).assign(value)
      189 |                         const res = code(assignment, c)
    > 190 |                         expect(res).toBe('_vec2Buffer = vec4(vec2(1.0, 2.0), 0.0, 1.0);')
          |                                     ^
      191 |                 })
      192 |
      193 |                 it('should handle vec3 storage assignment in WebGL', () => {

      at Object.<anonymous> (packages/core/test/node/2-1-storage-buffer.test.ts:190:37)

  ● Storage Buffer Management › Element Assignment Operations › should handle vec3 storage assignment in WebGL

    expect(received).toBe(expected) // Object.is equality

    Expected: "_vec3Buffer = vec4(vec3(1.0, 2.0, 3.0), 1.0);"
    Received: "texelFetch(vec3Buffer, ivec2(int(1) % 32, int(1) / 32), 0).xyz"

      198 |                         const assignment = data.element(index).assign(value)
      199 |                         const res = code(assignment, c)
    > 200 |                         expect(res).toBe('_vec3Buffer = vec4(vec3(1.0, 2.0, 3.0), 1.0);')
          |                                     ^
      201 |                 })
      202 |
      203 |                 it('should handle vec4 storage assignment correctly', () => {

      at Object.<anonymous> (packages/core/test/node/2-1-storage-buffer.test.ts:200:37)

  ● Storage Buffer Management › Element Assignment Operations › should handle vec4 storage assignment correctly

    expect(received).toBe(expected) // Object.is equality

    Expected: "vec4Buffer[0] = vec4f(1.0, 2.0, 3.0, 4.0);"
    Received: "vec4Buffer[0]"

      208 |                         const assignment = data.element(index).assign(value)
      209 |                         const res = code(assignment, c)
    > 210 |                         expect(res).toBe('vec4Buffer[0] = vec4f(1.0, 2.0, 3.0, 4.0);')
          |                                     ^
      211 |                 })
      212 |         })
      213 |

      at Object.<anonymous> (packages/core/test/node/2-1-storage-buffer.test.ts:210:37)

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

      225 |                         const res = compute(computeFunc(id), c)
      226 |                         expect(res).toContain('@group(0) @binding(0) var<storage, read_write> input: array<f32>;')
    > 227 |                         expect(res).toContain('@group(0) @binding(1) var<storage, read_write> output: array<f32>;')
          |                                     ^
      228 |                         expect(res).toContain('input[')
      229 |                         expect(res).toContain('output[')
      230 |                 })

      at Object.<anonymous> (packages/core/test/node/2-1-storage-buffer.test.ts:227:37)

FAIL test/node/2-0-varying-processing.test.ts
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

      49 |                         const res = vertex(vertexFunc(), c)
      50 |                         expect(res).toContain('struct Out {')
    > 51 |                         expect(res).toContain('@location(0) worldPosition: vec3f')
         |                                     ^
      52 |                         expect(res).toContain('out.worldPosition =')
      53 |                 })
      54 |

      at Object.<anonymous> (packages/core/test/node/2-0-varying-processing.test.ts:51:37)

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

      61 |                         const c = createGLSLVertexContext()
      62 |                         const res = vertex(vertexFunc(), c)
    > 63 |                         expect(res).toContain('out vec3 worldPosition;')
         |                                     ^
      64 |                         expect(res).toContain('worldPosition =')
      65 |                 })
      66 |

      at Object.<anonymous> (packages/core/test/node/2-0-varying-processing.test.ts:63:37)

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

      77 |                         const c = createVertexContext()
      78 |                         const res = vertex(vertexFunc(), c)
    > 79 |                         expect(res).toContain('@location(0) vPosition: vec3f')
         |                                     ^
      80 |                         expect(res).toContain('@location(1) vNormal: vec3f')
      81 |                         expect(res).toContain('@location(2) vColor: vec3f')
      82 |                         expect(res).toContain('out.vPosition =')

      at Object.<anonymous> (packages/core/test/node/2-0-varying-processing.test.ts:79:37)

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

      152 |                         const vertexResult = vertex(vertexFunc(), vertexContext)
      153 |                         const fragmentResult = fragment(fragmentFunc(), fragmentContext)
    > 154 |                         expect(vertexResult).toContain('vertexColor: vec3f')
          |                                              ^
      155 |                         expect(fragmentResult).toContain('vertexColor: vec3f')
      156 |                 })
      157 |

      at Object.<anonymous> (packages/core/test/node/2-0-varying-processing.test.ts:154:46)

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

      164 |                         const c = createVertexContext()
      165 |                         const res = vertex(vertexFunc(), c)
    > 166 |                         expect(res).toContain('depth: f32')
          |                                     ^
      167 |                         expect(res).toContain('out.depth =')
      168 |                 })
      169 |

      at Object.<anonymous> (packages/core/test/node/2-0-varying-processing.test.ts:166:37)

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

      176 |                         const c = createVertexContext()
      177 |                         const res = vertex(vertexFunc(), c)
    > 178 |                         expect(res).toContain('data: vec4f')
          |                                     ^
      179 |                 })
      180 |         })
      181 |

      at Object.<anonymous> (packages/core/test/node/2-0-varying-processing.test.ts:178:37)

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

      193 |                         const c = createVertexContext()
      194 |                         const res = vertex(vertexFunc(), c)
    > 195 |                         expect(res).toContain('@location(0) first')
          |                                     ^
      196 |                         expect(res).toContain('@location(1) second')
      197 |                         expect(res).toContain('@location(2) third')
      198 |                 })

      at Object.<anonymous> (packages/core/test/node/2-0-varying-processing.test.ts:195:37)

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

      206 |                         const c = createVertexContext()
      207 |                         const res = vertex(vertexFunc(), c)
    > 208 |                         expect(res).toContain('@location(0) normal')
          |                                     ^
      209 |                 })
      210 |         })
      211 |

      at Object.<anonymous> (packages/core/test/node/2-0-varying-processing.test.ts:208:37)

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

      221 |                         const wgslResult = vertex(vertexFunc(), wgslContext)
      222 |                         const glslResult = vertex(vertexFunc(), glslContext)
    > 223 |                         expect(wgslResult).toContain('@location(0) texCoord: vec3f')
          |                                            ^
      224 |                         expect(wgslResult).toContain('out.texCoord =')
      225 |                         expect(glslResult).toContain('out vec3 texCoord;')
      226 |                         expect(glslResult).toContain('texCoord =')

      at Object.<anonymous> (packages/core/test/node/2-0-varying-processing.test.ts:223:44)

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

      252 |                         const c = createVertexContext()
      253 |                         const res = vertex(vertexFunc(), c)
    > 254 |                         expect(res).toContain('computed: vec3f')
          |                                     ^
      255 |                         expect(res).toContain('normalize')
      256 |                         expect(res).toContain('* 2.0')
      257 |                 })

      at Object.<anonymous> (packages/core/test/node/2-0-varying-processing.test.ts:254:37)

  ● Varying Processing System › Varying Processing Edge Cases › should handle varying with function call ress

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

      269 |                         const c = createVertexContext()
      270 |                         const res = vertex(vertexFunc(), c)
    > 271 |                         expect(res).toContain('processed: vec3f')
          |                                     ^
      272 |                         expect(res).toContain('sin')
      273 |                         expect(res).toContain('cos')
      274 |                 })

      at Object.<anonymous> (packages/core/test/node/2-0-varying-processing.test.ts:271:37)

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

      291 |                         const vertexResult = vertex(vertexFunc(), vertexContext)
      292 |                         const fragmentResult = fragment(fragmentFunc(), fragmentContext)
    > 293 |                         expect(vertexResult).toContain('sharedData: vec3f')
          |                                              ^
      294 |                         expect(fragmentResult).toContain('sharedData: vec3f')
      295 |                 })
      296 |

      at Object.<anonymous> (packages/core/test/node/2-0-varying-processing.test.ts:293:46)

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

      307 |                         const fragmentResult = fragment(fragmentFunc(), fragmentContext)
      308 |                         expect(vertexResult).not.toContain('@location(')
    > 309 |                         expect(fragmentResult).not.toContain('@location(')
          |                                                    ^
      310 |                 })
      311 |         })
      312 | })

      at Object.<anonymous> (packages/core/test/node/2-0-varying-processing.test.ts:309:52)

PASS test/node/0-0-type-inference.test.ts
PASS test/node/0-1-ast-construction.test.ts
PASS test/node/0-2-code-generation.test.ts
------------|---------|----------|---------|---------|----------------------------------------------------------------------------------
File        | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s                                                                
------------|---------|----------|---------|---------|----------------------------------------------------------------------------------
All files   |   80.13 |    58.55 |   80.95 |   85.47 |                                                                                  
 node       |    83.2 |    66.46 |   78.57 |    90.8 |                                                                                  
  build.ts  |   77.33 |    62.43 |     100 |   85.71 | 47-58,127-133                                                                    
  create.ts |   80.29 |    62.96 |    64.7 |   95.08 | 46-48                                                                            
  scope.ts  |   94.06 |    94.87 |   88.46 |   94.56 | 100-107                                                                          
 node/utils |   77.41 |    53.46 |   83.92 |   81.03 |                                                                                  
  const.ts  |     100 |      100 |     100 |     100 |                                                                                  
  infer.ts  |   89.01 |    66.66 |   88.88 |   90.62 | 31-33,65-67                                                                      
  parse.ts  |   65.82 |    52.04 |   73.68 |   67.32 | 23,34-41,45-53,69-77,104-108,114,136-137,161-164,170,174-175,199-203,206-209,213 
  utils.ts  |   80.76 |     40.9 |   86.36 |   92.77 | 51-52,110,125-127                                                                
------------|---------|----------|---------|---------|----------------------------------------------------------------------------------

=============================== Coverage summary ===============================
Statements   : 80.13% ( 690/861 )
Branches     : 58.55% ( 486/830 )
Functions    : 80.95% ( 102/126 )
Lines        : 85.47% ( 512/599 )
================================================================================
Jest: "global" coverage threshold for branches (80%) not met: 58.55%

Test Suites: 6 failed, 3 passed, 9 total
Tests:       74 failed, 175 passed, 249 total
Snapshots:   0 total
Time:        3.746 s
Ran all test suites.
error Command failed with exit code 1.
info Visit https://yarnpkg.com/en/docs/cli/run for documentation about this command.
