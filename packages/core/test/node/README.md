# GLRE Node System Test Design Specification

## Why This Design Specification is Necessary

The GLRE node system is an intermediate language that generates GLSL/WGSL code from JavaScript and bears responsibility as a shader compiler. The type inference engine, abstract syntax tree construction processing, code generation functionality, and scope management features of this system directly impact rendering results, making comprehensive testing essential for quality assurance.

Type inference failures cause incorrect type generation in shader code, varying processing bugs break data transfer between vertex and fragment stages, and type misalignment in swizzling operations leads to unintended changes in GPU computation results. These issues are only detected at runtime and the root cause identification is difficult.

Therefore, it is necessary to verify the operation of each function in detail through unit tests, clarify the scope of impact from changes, and enable rapid cause identification when problems occur.

## What to Test

### Abstract Conceptual Design Framework

The test targets are classified into three abstract layers for the approach.

```
Layer 1: Foundation System Layer
├── Type Inference Engine
├── Abstract Syntax Tree Construction (AST Construction)
└── Code Generation Engine

Layer 2: Language Feature Layer
├── Node Creation & Operations
├── Scope Management System
└── Function Definition System

Layer 3: Integration Feature Layer
├── Varying Processing System
├── Storage Buffer Management
└── Struct Processing System
```

### Foundation System Layer Verification Scope

#### Asymptotic Type Determination Function of Type Inference Engine

Verify that the dynamic type inference functionality in JavaScript runtime is accurately determined as shader types. Confirm automatic type inference from primitive values, asymptotic determination of function return values, type promotion rules in operators, and accurate type determination in swizzle operations.

Particularly focus on verifying that ivec2.x is inferred as int and not float, that type determination from stride calculation in attributes is accurate, that type determination of Loop variables functions properly based on operator type, and that type determination through early return in Fn functions operates appropriately.

#### Accuracy Confirmation of Abstract Syntax Tree Construction

Verify that method chaining by NodeProxy constructs the intended abstract syntax tree. Confirm operator precedence maintenance, nested function call structuring, AST representation of conditional branching, and tree construction of Loop structures.

Verify that the type/props/children structure of each node conforms to specifications, that parent-child relationships are accurately maintained, and that dependency graphs avoid cyclic references.

#### Output Precision Assurance of Code Generation Engine

Verify that conversion from abstract syntax trees to GLSL/WGSL code conforms to syntax specifications. Confirm accurate mapping of operator symbols, parameter order in function calls, appropriate processing of variable scopes, and dependency order in header generation.

Focus on verifying difference handling between WebGL/WebGPU, appropriate mapping of builtin variables, and dependency resolution through topological sort.

### Language Feature Layer Verification Scope

#### Reliability Assurance of Node Creation and Operations

Verify node generation by factory functions, operations through method chaining, automatic handling of type conversion, and swizzling operation behavior.

Confirm generation of uniform/attribute/storage/constant nodes, automatic wrapping from primitive values, operation of arithmetic/comparison/logical operations, and impact of assignment operations on scope.

#### Operation Guarantee of Scope Management System

Verify variable declaration through toVar, statement addition through addToScope, context switching through scoped functions, and variable visibility in nested scopes.

Focus on confirming scope hierarchy in If/Loop/Switch, scope termination through early return, prevention of variable shadowing, and avoidance of side effects through scope crossing.

#### Accuracy Confirmation of Function Definition System

Verify function definition through Fn, type inference of parameters, asymptotic determination of return type, and explicit specification through setLayout.

Confirm variable access within closures, accuracy of parameter binding, scope isolation in nested function calls, and consistency between layout specification and runtime inference.

### Integration Feature Layer Verification Scope

#### Robustness Assurance of Varying Processing System

Verify detection of varying variables, generation of input struct in fragment shader, generation of output struct in vertex shader, and input/output determination.

Focus on confirming varying detection through fragment shader build precedence, automatic assignment of location numbers, type consistency of struct fields, and differences in declaration formats between WebGL/WebGPU.

#### Reliability Assurance of Storage Buffer Management

Verify WebGL/WebGPU implementation of gather/scatter operations, type inference of storage buffers, index calculation in element access, and differentiation between texture buffers and storage buffers.

Confirm texture buffer based implementation in WebGL, storage buffer API utilization in WebGPU, and appropriate handling of index boundaries.

#### Complexity Control of Struct Processing System

Verify header generation of struct definitions, dependency resolution of field types, parameter order in constructors, and header ordering through topological sort.

Focus on confirming detection and avoidance of cyclic dependencies, recursive processing of nested structs, and type matching of initialization values.

## How to Execute Tests

### Test Execution Strategy

Adopt test case design based on symmetry principles. Comprehensively verify each function with combinations of basic cases, boundary conditions, and error conditions.

#### Type Inference Test Execution Patterns

```
Base Pattern:
Input value → Type inference execution → Comparison with expected type

Extension Pattern:
Complex expression → Stepwise inference → Type confirmation at each step

Edge Pattern:
Boundary value → Inference processing → Exception handling confirmation
```

Apply base/extension/edge patterns for each category of primitive values, array lengths, operator combinations, function returns, and swizzle operations.

#### AST Construction Test Execution Patterns

```
Structure Pattern:
expression → AST build → tree structure verification

Nesting Pattern:
nested expression → recursive build → depth verification

Composition Pattern:
multiple expression → composition → relationship verification
```

Expand patterns for each structure of arithmetic operations, function calls, conditional expressions, and loop statements.

#### Code Generation Test Execution Patterns

```
Translation Pattern:
AST → code generation → syntax verification

Context Pattern:
context variation → code adaptation → output difference verification

Cross-Platform Pattern:
same AST → WebGL/WebGPU → platform difference verification
```

Execute pattern application in GLSL/WGSL syntax rules, builtin variable mapping, and header dependency ordering.

#### Scope Management Test Execution Patterns

```
Isolation Pattern:
scope operation → isolation verification → side effect check

Hierarchy Pattern:
nested scope → hierarchy verification → visibility check

Lifecycle Pattern:
scope creation/destruction → lifecycle verification → cleanup check
```

Execute verification with patterns in variable declaration, statement addition, and context switching.

#### Varying Processing Test Execution Patterns

```
Detection Pattern:
varying usage → detection verification → registration check

Generation Pattern:
detected varying → struct generation → field verification

Integration Pattern:
vertex/fragment → integration verification → data consistency check
```

Execute pattern application in context switching, location assignment, and type consistency.

#### Storage Processing Test Execution Patterns

```
Platform Pattern:
storage operation → platform detection → implementation verification

Access Pattern:
element access → index calculation → boundary verification

Consistency Pattern:
gather/scatter → operation consistency → data integrity verification
```

Execute verification with patterns in WebGL texture buffers, WebGPU storage buffers, and index calculation.

#### Struct Processing Test Execution Patterns

```
Definition Pattern:
field definition → struct generation → type verification

Dependency Pattern:
struct dependency → topological sort → order verification

Construction Pattern:
struct construction → initialization → field verification
```

Execute pattern application in header generation, dependency resolution, and constructor parameters.

### Test Case Execution Order and Dependency Management

Establish execution order considering inter-layer dependencies in test execution. Proceed with stepwise verification starting from foundation system layer confirmation, followed by language feature layer, then integration feature layer.

Prioritize critical path functions in each layer, progressing from unit functions with fewer dependencies to composite functions. Based on the failing fast principle, stop execution of dependent tests when foundation function failures occur, enabling efficient debugging.

### Regression Test Strategy and Continuous Verification

Build a mechanism to prioritize execution of test cases related to changed components to identify change impact scope. Execute all type-related tests when the type inference engine changes, and all output-related tests when the code generation engine changes.

Maintain independence between test cases, ensuring that one test failure does not affect other test executions. Ensure a reproducible test environment through shared state avoidance, clean setup/teardown execution, and deterministic result guarantee.

### Measurable Quality Indicator Setting

Conduct quality measurement from three perspectives: function coverage, code path coverage, and edge case coverage. Achieve comprehensive verification through combinations of normal cases, abnormal cases, and boundary values for each function.

Quantify type inference accuracy, AST structure validity, code generation correctness, and scope management integrity for continuous quality improvement.

## Test Design Implementation Policy

Design each test category to achieve comprehensive functional verification while maintaining mutual independence. Clearly define responsibility boundaries to distinguish whether foundation system layer test failures are issues in the language feature layer or integration feature layer.

Maintain appropriate granularity that confirms complex shader code generation capability while not exceeding unit test scope. Each test case has a single responsibility, facilitating cause identification during failures.

In test implementation, avoid using mocks or stubs as much as possible, directly verifying actual GLRE node system operation to maintain consistency with real environments. Test cases themselves function as usage examples of the GLRE node system, providing documentation value.
