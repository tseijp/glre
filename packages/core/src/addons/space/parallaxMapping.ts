import { Fn, Vec2, Vec3, Float, X, texture, float, vec2, vec3, int, Loop, If, Break } from '../../node'

const PARALLAXMAPPING_SCALE = float(0.01).constant('PARALLAXMAPPING_SCALE')
const PARALLAXMAPPING_NUMSEARCHES = float(10).constant('PARALLAXMAPPING_NUMSEARCHES')

export const parallaxMappingSimple = Fn(([tex, V, T]: [X, Vec3, Vec2]): Vec2 => {
        const initialHeight = texture(tex, T).r.toVar('initialHeight')
        const texCoordOffset = PARALLAXMAPPING_SCALE.mul(V.xy).mul(initialHeight).toVar('texCoordOffset')
        return T.sub(texCoordOffset)
}).setLayout({
        name: 'parallaxMappingSimple',
        type: 'vec2',
        inputs: [
                { name: 'tex', type: 'sampler2D' },
                { name: 'V', type: 'vec3' },
                { name: 'T', type: 'vec2' },
        ],
})

export const parallaxMappingSteep = Fn(([tex, V, T]: [X, Vec3, Vec2]): Vec2 => {
        const minLayers = PARALLAXMAPPING_NUMSEARCHES.mul(0.5).toVar('minLayers')
        const maxLayers = float(15).toVar('maxLayers')
        const numLayers = minLayers.mix(maxLayers, V.dot(vec3(0, 0, 1)).abs()).toVar('numLayers')
        const layerHeight = float(1).div(numLayers).toVar('layerHeight')
        const currentLayerHeight = float(0).toVar('currentLayerHeight')
        const dtex = PARALLAXMAPPING_SCALE.mul(V.xy).div(V.z).div(numLayers).toVar('dtex')
        const currentTextureCoords = T.toVar('currentTextureCoords')
        const heightFromTexture = texture(tex, currentTextureCoords).r.toVar('heightFromTexture')

        Loop(int(50), ({ i }) => {
                If(heightFromTexture.lessThanEqual(currentLayerHeight), () => {
                        Break()
                })
                currentLayerHeight.addAssign(layerHeight)
                currentTextureCoords.subAssign(dtex)
                heightFromTexture.assign(texture(tex, currentTextureCoords).r)
        })

        return currentTextureCoords
}).setLayout({
        name: 'parallaxMappingSteep',
        type: 'vec2',
        inputs: [
                { name: 'tex', type: 'sampler2D' },
                { name: 'V', type: 'vec3' },
                { name: 'T', type: 'vec2' },
        ],
})

export const parallaxMappingRelief = Fn(([tex, V, T]: [X, Vec3, Vec2]): Vec2 => {
        const minLayers = PARALLAXMAPPING_NUMSEARCHES.toVar('minLayers')
        const maxLayers = float(15).toVar('maxLayers')
        const numLayers = minLayers.mix(maxLayers, V.dot(vec3(0, 0, 1)).abs()).toVar('numLayers')
        const layerHeight = float(1).div(numLayers).toVar('layerHeight')
        const currentLayerHeight = float(0).toVar('currentLayerHeight')
        const dtex = PARALLAXMAPPING_SCALE.mul(V.xy).div(V.z).div(numLayers).toVar('dtex')
        const currentTextureCoords = T.toVar('currentTextureCoords')
        const heightFromTexture = texture(tex, currentTextureCoords).r.toVar('heightFromTexture')

        Loop(int(50), ({ i }) => {
                If(heightFromTexture.lessThanEqual(currentLayerHeight), () => {
                        Break()
                })
                currentLayerHeight.addAssign(layerHeight)
                currentTextureCoords.subAssign(dtex)
                heightFromTexture.assign(texture(tex, currentTextureCoords).r)
        })

        const deltaTexCoord = dtex.mul(0.5).toVar('deltaTexCoord')
        const deltaHeight = layerHeight.mul(0.5).toVar('deltaHeight')
        currentTextureCoords.addAssign(deltaTexCoord)
        currentLayerHeight.subAssign(deltaHeight)

        Loop(int(5), ({ i }) => {
                deltaTexCoord.mulAssign(0.5)
                deltaHeight.mulAssign(0.5)
                heightFromTexture.assign(texture(tex, currentTextureCoords).r)

                If(heightFromTexture.greaterThan(currentLayerHeight), () => {
                        currentTextureCoords.subAssign(deltaTexCoord)
                        currentLayerHeight.addAssign(deltaHeight)
                }).Else(() => {
                        currentTextureCoords.addAssign(deltaTexCoord)
                        currentLayerHeight.subAssign(deltaHeight)
                })
        })

        return currentTextureCoords
}).setLayout({
        name: 'parallaxMappingRelief',
        type: 'vec2',
        inputs: [
                { name: 'tex', type: 'sampler2D' },
                { name: 'V', type: 'vec3' },
                { name: 'T', type: 'vec2' },
        ],
})

export const parallaxMappingOcclusion = Fn(([tex, V, T]: [X, Vec3, Vec2]): Vec2 => {
        const minLayers = PARALLAXMAPPING_NUMSEARCHES.toVar('minLayers')
        const maxLayers = float(15).toVar('maxLayers')
        const numLayers = minLayers.mix(maxLayers, V.dot(vec3(0, 0, 1)).abs()).toVar('numLayers')
        const layerHeight = float(1).div(numLayers).toVar('layerHeight')
        const curLayerHeight = float(0).toVar('curLayerHeight')
        const dtex = PARALLAXMAPPING_SCALE.mul(V.xy).div(V.z).div(numLayers).toVar('dtex')
        const currentTextureCoords = T.toVar('currentTextureCoords')
        const heightFromTexture = texture(tex, currentTextureCoords).r.toVar('heightFromTexture')
        const prevTCoords = currentTextureCoords.toVar('prevTCoords')

        Loop(int(50), ({ i }) => {
                If(heightFromTexture.lessThanEqual(curLayerHeight), () => {
                        Break()
                })
                curLayerHeight.addAssign(layerHeight)
                prevTCoords.assign(currentTextureCoords)
                currentTextureCoords.subAssign(dtex)
                heightFromTexture.assign(texture(tex, currentTextureCoords).r)
        })

        const nextH = heightFromTexture.sub(curLayerHeight).toVar('nextH')
        const prevH = texture(tex, prevTCoords).r.sub(curLayerHeight).add(layerHeight).toVar('prevH')
        const weight = nextH.div(nextH.sub(prevH)).toVar('weight')
        const finalTexCoords = prevTCoords
                .mul(weight)
                .add(currentTextureCoords.mul(float(1).sub(weight)))
                .toVar('finalTexCoords')

        return finalTexCoords
}).setLayout({
        name: 'parallaxMappingOcclusion',
        type: 'vec2',
        inputs: [
                { name: 'tex', type: 'sampler2D' },
                { name: 'V', type: 'vec3' },
                { name: 'T', type: 'vec2' },
        ],
})

export const parallaxMapping = Fn(([tex, V, T]: [X, Vec3, Vec2]): Vec2 => {
        return parallaxMappingOcclusion(tex, V, T)
}).setLayout({
        name: 'parallaxMapping',
        type: 'vec2',
        inputs: [
                { name: 'tex', type: 'sampler2D' },
                { name: 'V', type: 'vec3' },
                { name: 'T', type: 'vec2' },
        ],
})
