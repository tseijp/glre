yarn run v1.22.22
$ cd packages/core && npx jest --coverage --detectOpenHandles
ts-jest[config] (WARN) [94mmessage[0m[90m TS151001: [0mIf you have issues related to imports, you should consider setting `esModuleInterop` to `true` in your TypeScript configuration file (usually `tsconfig.json`). See https://blogs.msdn.microsoft.com/typescript/2018/01/31/announcing-typescript-2-7/#easier-ecmascript-module-interoperability for more information.
PASS test/node/0-2-code-generation.test.ts
PASS test/node/1-0-node-operations.test.ts
PASS test/node/2-2-struct-processing.test.ts
PASS test/node/0-0-type-inference.test.ts
PASS test/node/0-1-ast-construction.test.ts
PASS test/node/2-1-storage-buffer.test.ts
PASS test/node/1-2-function-definition.test.ts
PASS test/node/1-1-scope-management.test.ts
FAIL test/node/2-0-varying-processing.test.ts
  ● Test suite failed to run

    [96mtest/node/2-0-varying-processing.test.ts[0m:[93m85[0m:[93m25[0m - [91merror[0m[90m TS2304: [0mCannot find name 'vertex'.

    [7m85[0m                         vertex(vs, ctx())
    [7m  [0m [91m                        ~~~~~~[0m

------------|---------|----------|---------|---------|----------------------------------------------------------------------------------
File        | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s                                                                
------------|---------|----------|---------|---------|----------------------------------------------------------------------------------
All files   |   71.29 |    47.41 |   70.63 |      75 |                                                                                  
 node       |   64.64 |    41.44 |   62.85 |   68.38 |                                                                                  
  build.ts  |   34.81 |    25.33 |      40 |   40.33 | 5-19,26-27,41,46-58,67-74,89-118,127-133                                         
  create.ts |    78.1 |    60.49 |   58.82 |    91.8 | 8,46-48,63                                                                       
  scope.ts  |   88.98 |    94.87 |   76.92 |   89.13 | 95-110                                                                           
 node/utils |   77.29 |    51.47 |   80.35 |   80.48 |                                                                                  
  const.ts  |     100 |    95.45 |     100 |     100 | 278                                                                              
  infer.ts  |   87.09 |    65.48 |   88.88 |   89.23 | 32-34,66-68,78                                                                   
  parse.ts  |   67.83 |    47.95 |   68.42 |   69.28 | 23,34-41,45-53,69-77,108,114,136-137,157,161-164,170,174-175,199-203,206-209,213 
  utils.ts  |   78.46 |     40.9 |   81.81 |   87.95 | 50-56,110,125-127                                                                
------------|---------|----------|---------|---------|----------------------------------------------------------------------------------

=============================== Coverage summary ===============================
Statements   : 71.29% ( 621/871 )
Branches     : 47.41% ( 404/852 )
Functions    : 70.63% ( 89/126 )
Lines        : 75% ( 450/600 )
================================================================================
Jest: "global" coverage threshold for statements (80%) not met: 71.29%
Jest: "global" coverage threshold for branches (80%) not met: 47.41%
Jest: "global" coverage threshold for lines (80%) not met: 75%
Jest: "global" coverage threshold for functions (80%) not met: 70.63%
Test Suites: 1 failed, 8 passed, 9 total
Tests:       215 passed, 215 total
Snapshots:   0 total
Time:        4.711 s
Ran all test suites.
error Command failed with exit code 1.
info Visit https://yarnpkg.com/en/docs/cli/run for documentation about this command.
