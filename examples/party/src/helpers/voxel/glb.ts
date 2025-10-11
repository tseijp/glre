import type { RegionConfig } from './tiles'

export const parseGLBFromTiles = async (glbBuffer: ArrayBuffer, config: RegionConfig): Promise<any> => {
        // Validate GLB header
        const header = new Uint32Array(glbBuffer, 0, 3)
        if (header[0] !== 0x46546c67) { // 'glTF'
                throw new Error('Invalid GLB format')
        }
        
        // Extract geometry data and create voxelizer-compatible structure
        const { lat, lng, zoom } = config
        const bounds = config.bounds
        
        // Calculate world bounds based on geographic coordinates
        const worldSize = Math.pow(2, zoom) * 16 // Scale based on zoom level
        const centerX = (bounds.min[0] + bounds.max[0]) * 0.5
        const centerY = (bounds.min[1] + bounds.max[1]) * 0.5
        const centerZ = (bounds.min[2] + bounds.max[2]) * 0.5
        
        return {
                tris: [], // Will be populated from actual tile geometry
                materials: [
                        {
                                base: [0.8, 0.8, 0.8, 1.0], // Default material
                                tex: undefined
                        }
                ],
                textures: [],
                aabb: {
                        min: [centerX - worldSize * 0.5, centerY - worldSize * 0.5, centerZ - worldSize * 0.5],
                        max: [centerX + worldSize * 0.5, centerY + worldSize * 0.5, centerZ + worldSize * 0.5]
                },
                model: {
                        extent: [worldSize, worldSize, worldSize],
                        center: [centerX, centerY, centerZ]
                }
        }
}

export const createGLBFromGeometry = (vertices: number[], normals: number[], indices: number[]): ArrayBuffer => {
        // Create minimal GLB structure with geometry data
        const headerSize = 12
        const jsonChunkHeaderSize = 8
        const binChunkHeaderSize = 8
        
        // Calculate buffer sizes
        const vertexBufferSize = vertices.length * 4 // Float32
        const normalBufferSize = normals.length * 4 // Float32
        const indexBufferSize = indices.length * 2 // Uint16
        const totalBinSize = vertexBufferSize + normalBufferSize + indexBufferSize
        
        // Align to 4-byte boundary
        const alignedBinSize = Math.ceil(totalBinSize / 4) * 4
        
        // Create minimal glTF JSON
        const gltfJson = {
                asset: { version: "2.0" },
                scene: 0,
                scenes: [{ nodes: [0] }],
                nodes: [{ mesh: 0 }],
                meshes: [{
                        primitives: [{
                                attributes: {
                                        POSITION: 0,
                                        NORMAL: 1
                                },
                                indices: 2
                        }]
                }],
                accessors: [
                        {
                                bufferView: 0,
                                componentType: 5126, // FLOAT
                                count: vertices.length / 3,
                                type: "VEC3",
                                max: [Math.max(...vertices.filter((_, i) => i % 3 === 0)),
                                      Math.max(...vertices.filter((_, i) => i % 3 === 1)),
                                      Math.max(...vertices.filter((_, i) => i % 3 === 2))],
                                min: [Math.min(...vertices.filter((_, i) => i % 3 === 0)),
                                      Math.min(...vertices.filter((_, i) => i % 3 === 1)),
                                      Math.min(...vertices.filter((_, i) => i % 3 === 2))]
                        },
                        {
                                bufferView: 1,
                                componentType: 5126, // FLOAT
                                count: normals.length / 3,
                                type: "VEC3"
                        },
                        {
                                bufferView: 2,
                                componentType: 5123, // UNSIGNED_SHORT
                                count: indices.length,
                                type: "SCALAR"
                        }
                ],
                bufferViews: [
                        {
                                buffer: 0,
                                byteOffset: 0,
                                byteLength: vertexBufferSize
                        },
                        {
                                buffer: 0,
                                byteOffset: vertexBufferSize,
                                byteLength: normalBufferSize
                        },
                        {
                                buffer: 0,
                                byteOffset: vertexBufferSize + normalBufferSize,
                                byteLength: indexBufferSize
                        }
                ],
                buffers: [{
                        byteLength: alignedBinSize
                }]
        }
        
        const jsonString = JSON.stringify(gltfJson)
        const jsonBuffer = new TextEncoder().encode(jsonString)
        const alignedJsonSize = Math.ceil(jsonBuffer.length / 4) * 4
        
        // Calculate total GLB size
        const totalSize = headerSize + jsonChunkHeaderSize + alignedJsonSize + binChunkHeaderSize + alignedBinSize
        
        // Create GLB buffer
        const glb = new ArrayBuffer(totalSize)
        const view = new DataView(glb)
        let offset = 0
        
        // GLB header
        view.setUint32(offset, 0x46546c67, true) // magic: 'glTF'
        offset += 4
        view.setUint32(offset, 2, true) // version
        offset += 4
        view.setUint32(offset, totalSize, true) // length
        offset += 4
        
        // JSON chunk header
        view.setUint32(offset, alignedJsonSize, true) // chunk length
        offset += 4
        view.setUint32(offset, 0x4e4f534a, true) // chunk type: 'JSON'
        offset += 4
        
        // JSON chunk data
        const jsonView = new Uint8Array(glb, offset, jsonBuffer.length)
        jsonView.set(jsonBuffer)
        offset += alignedJsonSize
        
        // Binary chunk header
        view.setUint32(offset, alignedBinSize, true) // chunk length
        offset += 4
        view.setUint32(offset, 0x004e4942, true) // chunk type: 'BIN\0'
        offset += 4
        
        // Binary chunk data
        const vertexView = new Float32Array(glb, offset, vertices.length)
        vertexView.set(vertices)
        offset += vertexBufferSize
        
        const normalView = new Float32Array(glb, offset, normals.length)
        normalView.set(normals)
        offset += normalBufferSize
        
        const indexView = new Uint16Array(glb, offset, indices.length)
        indexView.set(indices)
        
        return glb
}

export const combineVoxelChunksToAtlas = async (items: any[], size: number): Promise<{ data: Uint8Array, raw: Uint8Array }> => {
        const atlasSize = 4096 // Standard atlas size
        const atlas = new Uint8Array(atlasSize * atlasSize * 4)
        
        // Process each voxel chunk
        for (const item of items) {
                if (item.key && item.rgba) {
                        const [ci, cj, ck] = item.key.split('.').map((v: string) => parseInt(v) || 0)
                        
                        // Calculate atlas position using blitChunk64ToWorld logic
                        const chunkData = new Uint8Array(item.rgba)
                        blitChunkToAtlas(chunkData, ci, cj, ck, atlas)
                }
        }
        
        return { data: atlas, raw: atlas }
}

const blitChunkToAtlas = (src: Uint8Array, ci: number, cj: number, ck: number, dst: Uint8Array) => {
        // Use same atlas layout as existing system
        const planeX = cj & 3
        const planeY = cj >> 2
        const ox = planeX * 1024 + ci * 64
        const oy = planeY * 1024 + ck * 64
        
        for (let y = 0; y < 64; y++) {
                const dy = oy + y
                const di = (dy * 4096 + ox) * 4
                const si = y * 64 * 4
                
                if (di >= 0 && di + 64 * 4 <= dst.length && si + 64 * 4 <= src.length) {
                        dst.set(src.subarray(si, si + 64 * 4), di)
                }
        }
}