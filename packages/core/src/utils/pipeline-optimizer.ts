export const createPipelineOptimizer = () => {
        const sortPipelinesByState = (pipelineIds: string[], getPipelineState: (id: string) => any) => {
                return pipelineIds.sort((a, b) => {
                        const stateA = getPipelineState(a)
                        const stateB = getPipelineState(b)
                        
                        if (stateA?.pipeline?.label && stateB?.pipeline?.label) {
                                return stateA.pipeline.label.localeCompare(stateB.pipeline.label)
                        }
                        
                        return a.localeCompare(b)
                })
        }

        const groupByMaterial = (pipelineIds: string[], getMaterialHash: (id: string) => string) => {
                const groups = new Map<string, string[]>()
                
                pipelineIds.forEach(id => {
                        const materialHash = getMaterialHash(id)
                        if (!groups.has(materialHash)) {
                                groups.set(materialHash, [])
                        }
                        groups.get(materialHash)!.push(id)
                })
                
                return Array.from(groups.values())
        }

        const batchRenderCommands = (
                groups: string[][],
                renderCallback: (pipelineId: string) => void
        ) => {
                groups.forEach(group => {
                        group.forEach(pipelineId => {
                                renderCallback(pipelineId)
                        })
                })
        }

        const optimizeWebGPURender = (
                pipelineIds: string[],
                multiPipeline: any,
                pass: GPURenderPassEncoder,
                instanceCount: number,
                vertexCount: number
        ) => {
                if (pipelineIds.length === 0) return

                const sortedIds = sortPipelinesByState(pipelineIds, (id) => 
                        multiPipeline.pipelines.map.get(id)
                )
                
                let currentPipeline: GPURenderPipeline | null = null
                
                sortedIds.forEach(pipelineId => {
                        const config = multiPipeline.pipelines(pipelineId)
                        multiPipeline.updatePipeline(pipelineId)
                        
                        if (!config.pipeline) return

                        if (currentPipeline !== config.pipeline) {
                                pass.setPipeline(config.pipeline)
                                currentPipeline = config.pipeline
                        }
                        
                        config.bindGroups.forEach((bindGroup: GPUBindGroup, index: number) => {
                                if (bindGroup) pass.setBindGroup(index, bindGroup)
                        })
                        
                        config.vertexBuffers.forEach((buffer: GPUBuffer, index: number) => {
                                if (buffer) pass.setVertexBuffer(index, buffer)
                        })
                        
                        const actualVertexCount = config.attributes.size > 0 ? vertexCount : 3
                        pass.draw(actualVertexCount, instanceCount, 0, 0)
                })
        }

        const optimizeWebGLRender = (
                programIds: string[],
                multiProgram: any,
                instanceCount: number,
                vertexCount: number
        ) => {
                if (programIds.length === 0) return

                const sortedIds = sortPipelinesByState(programIds, (id) => 
                        multiProgram.programs.map.get(id)
                )
                
                let currentProgram: WebGLProgram | null = null
                
                sortedIds.forEach(programId => {
                        const config = multiProgram.programs(programId)
                        multiProgram.updateProgram(programId)
                        
                        if (!config.program) return

                        if (currentProgram !== config.program) {
                                const gl = multiProgram.gl || (window as any).gl
                                gl.useProgram(config.program)
                                currentProgram = config.program
                        }
                        
                        if (instanceCount > 1) {
                                const gl = multiProgram.gl || (window as any).gl
                                gl.drawArraysInstanced(gl.TRIANGLES, 0, vertexCount, instanceCount)
                        } else {
                                const gl = multiProgram.gl || (window as any).gl
                                gl.drawArrays(gl.TRIANGLES, 0, vertexCount)
                        }
                })
        }

        const calculateStateChangeCount = (pipelineIds: string[], getPipelineState: (id: string) => any) => {
                if (pipelineIds.length === 0) return 0
                
                let stateChanges = 1
                let previousState = getPipelineState(pipelineIds[0])
                
                for (let i = 1; i < pipelineIds.length; i++) {
                        const currentState = getPipelineState(pipelineIds[i])
                        if (currentState !== previousState) {
                                stateChanges++
                                previousState = currentState
                        }
                }
                
                return stateChanges
        }

        const optimizeBatching = (renderObjects: Array<{ pipelineId: string; materialId: string }>) => {
                const materialGroups = new Map<string, Array<{ pipelineId: string; materialId: string }>>()
                
                renderObjects.forEach(obj => {
                        if (!materialGroups.has(obj.materialId)) {
                                materialGroups.set(obj.materialId, [])
                        }
                        materialGroups.get(obj.materialId)!.push(obj)
                })
                
                return Array.from(materialGroups.values()).flat()
        }

        return {
                sortPipelinesByState,
                groupByMaterial,
                batchRenderCommands,
                optimizeWebGPURender,
                optimizeWebGLRender,
                calculateStateChangeCount,
                optimizeBatching
        }
}