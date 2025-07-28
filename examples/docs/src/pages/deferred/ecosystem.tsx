import {
        clamp,
        cos,
        exp,
        float,
        floor,
        Fn,
        fract,
        fwidth,
        int,
        iResolution,
        iTime,
        Loop,
        max,
        min,
        mod,
        pow,
        select,
        sin,
        smoothstep,
        uniform,
        useGL,
        uv,
        vec2,
        vec3,
        vec4,
} from 'glre/src/react'
import { useControls } from 'leva'

// Living Ecosystem Deferred Shading Demo
// G-Buffer stores: species populations, nutrient levels, terrain height, ecosystem health

// Ecosystem parameters
const growthRate = uniform(float(), 'growthRate')
const carryingCapacity = uniform(float(), 'carryingCapacity')
const migrationSpeed = uniform(float(), 'migrationSpeed')

// Procedural hash function for ecosystem variation
const hash = Fn(([coord]) => {
        const dotResult = vec2(127.1, 311.7).dot(coord).toVar('dotResult')
        return dotResult.sin().mul(43758.5453).fract().toVar('hashResult')
})

// Geometry pass - ecosystem state calculation
const ecosystemGeometry = Fn(([uv]) => {
        uv.y = uv.y.mul(iResolution.y).div(iResolution.x)
        const time = iTime.mul(growthRate).toVar('time')
        const gridSize = float(100.0).toVar('gridSize')
        const cell = uv.mul(gridSize).toVar('cell')
        const cellCoord = floor(cell).toVar('cellCoord')
        const localPos = fract(cell).toVar('localPos')

        // Terrain height using noise-like function
        const terrainSeed = vec2(1000, 2000).add(cellCoord).toVar('terrainSeed')
        const height1 = hash(terrainSeed).toVar('height1')
        const height2 = hash(terrainSeed.add(vec2(0.1, 0.2))).toVar('height2')
        const terrainHeight = height1.mul(0.7).add(height2.mul(0.3)).toVar('terrainHeight')

        // Water availability (inverse of height)
        const waterLevel = terrainHeight.oneMinus().toVar('waterLevel')

        // Species population dynamics (Lotka-Volterra inspired)
        const timeSeed = time.mul(0.1).toVar('timeSeed')
        const prey = hash(cellCoord.add(timeSeed)).toVar('basePrey')
        const predator = hash(cellCoord.add(timeSeed.add(100.0))).toVar('basePredator')

        // Environmental carrying capacity
        const capacity = waterLevel.mul(terrainHeight.add(0.2)).mul(carryingCapacity).toVar('capacity')

        // Population growth with competition
        const preyGrowth = prey.mul(waterLevel).mul(predator.oneMinus().mul(0.5).add(0.5)).toVar('preyGrowth')
        const predatorGrowth = predator.mul(prey).mul(0.8).toVar('predatorGrowth')

        // Logistic growth limiting
        const preyPop = min(preyGrowth, capacity).toVar('preyPop')
        const predatorPop = min(predatorGrowth, capacity.mul(0.3)).toVar('predatorPop')

        // Migration effects from neighboring cells
        const migrationEffect = float(0.0).toVar('migrationEffect')

        Loop(int(8), ({ i }) => {
                const direction = float(i).mul(0.785).toVar('direction') // 45 degree increments
                const neighborCoord = cellCoord.add(vec2(cos(direction), sin(direction))).toVar('neighborCoord')
                const neighborPrey = hash(neighborCoord.add(timeSeed)).toVar('neighborPrey')
                const distance = float(1.0).toVar('distance')
                const migration = neighborPrey.div(distance.add(1.0)).mul(migrationSpeed).toVar('migration')
                migrationEffect.assign(migrationEffect.add(migration))
        })

        // Total ecosystem health
        const biodiversity = preyPop.add(predatorPop).mul(0.5).toVar('biodiversity')
        const stability = min(preyPop, predatorPop.mul(3.0)).toVar('stability')
        const ecosystemHealth = biodiversity.mul(stability).add(migrationEffect.mul(0.1)).toVar('ecosystemHealth')

        // Anti-aliased ecosystem boundaries
        const cellCenter = localPos.sub(0.5).toVar('cellCenter')
        const cellDist = cellCenter.length().toVar('cellDist')
        const cellRadius = float(0.4).toVar('cellRadius')
        const edge = fwidth(cellDist).toVar('edge')
        const cellMask = smoothstep(cellRadius.add(edge), cellRadius.sub(edge), cellDist).toVar('cellMask')

        // Store ecosystem state in G-Buffer
        return vec4(
                preyPop.mul(cellMask), // Prey population
                predatorPop.mul(cellMask), // Predator population
                ecosystemHealth, // Overall health
                cellMask // Cell mask
        )
})

// Lighting pass - ecosystem visualization
const ecosystemLighting = Fn(([uv]) => {
        const gData = ecosystemGeometry(uv).toVar('gData')
        const preyPop = gData.x.toVar('preyPop')
        const predatorPop = gData.y.toVar('predatorPop')
        const health = gData.z.toVar('health')
        const mask = gData.w.toVar('mask')

        // Ecosystem flow visualization (nutrients, energy transfer)
        const flowIntensity = float(0.0).toVar('flowIntensity')
        const nutrientFlow = float(0.0).toVar('nutrientFlow')

        Loop(int(12), ({ i }) => {
                const flowAngle = float(i).mul(0.524).toVar('flowAngle') // 30 degrees
                const flowRadius = float(0.1).toVar('flowRadius')
                const flowOffset = vec2(flowAngle.cos().mul(flowRadius), flowAngle.sin().mul(flowRadius)).toVar(
                        'flowOffset'
                )
                const flowPos = uv.add(flowOffset).toVar('flowPos')

                // Sample neighboring ecosystem
                const neighborData = ecosystemGeometry(flowPos).toVar('neighborData')
                const neighborHealth = neighborData.z.toVar('neighborHealth')
                const healthGradient = neighborHealth.sub(health).toVar('healthGradient')

                // Energy flow (from high to low health)
                const energyFlow = max(healthGradient, 0.0).toVar('energyFlow')
                flowIntensity.assign(flowIntensity.add(energyFlow))

                // Nutrient cycling
                const neighborPrey = neighborData.x.toVar('neighborPrey')
                const nutrientExchange = neighborPrey.mul(0.1).toVar('nutrientExchange')
                nutrientFlow.assign(nutrientFlow.add(nutrientExchange))
        })

        // Color mapping for different species and states
        const preyColor = vec3(0.2, 0.8, 0.3).toVar('preyColor') // Green for prey (plants)
        const predatorColor = vec3(0.8, 0.4, 0.1).toVar('predatorColor') // Orange for predators
        const healthyColor = vec3(0.1, 0.6, 0.9).toVar('healthyColor') // Blue for healthy
        const stressedColor = vec3(0.9, 0.2, 0.2).toVar('stressedColor') // Red for stressed

        // Population-based color mixing
        const populationColor = preyColor.mul(preyPop).add(predatorColor.mul(predatorPop)).toVar('populationColor')

        // Health-based color mixing
        const healthRatio = health.mul(2.0).clamp(0.0, 1.0).toVar('healthRatio')
        const healthColor = stressedColor
                .mul(healthRatio.oneMinus())
                .add(healthyColor.mul(healthRatio))
                .toVar('healthColor')

        // Flow visualization
        const flowColor = vec3(0.9, 0.9, 0.2).mul(flowIntensity.mul(0.5)).toVar('flowColor')
        const nutrientColor = vec3(0.6, 0.3, 0.9).mul(nutrientFlow.mul(0.3)).toVar('nutrientColor')

        // Ecosystem composition
        const ecosystemColor = populationColor
                .mul(0.4)
                .add(healthColor.mul(0.3))
                .add(flowColor)
                .add(nutrientColor)
                .toVar('ecosystemColor')

        // Background (barren land)
        const barrenColor = vec4(0.1, 0.08, 0.05, 1.0).toVar('barrenColor')
        const livingEcosystem = vec4(ecosystemColor, 1.0).toVar('livingEcosystem')

        return barrenColor.mul(mask.oneMinus()).add(livingEcosystem.mul(mask))
})

export default function EcosystemDeferred() {
        const gl = useGL({
                fs: ecosystemLighting(uv),
                error: (msg) => {
                        throw new Error(msg)
                },
        })

        // Set ecosystem parameters
        gl.uniform(
                useControls({
                        growthRate: 1,
                        carryingCapacity: 1,
                        migrationSpeed: 1,
                })
        )

        return <canvas ref={gl.ref} width={800} height={600} />
}
