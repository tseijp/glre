import { performance } from 'node:perf_hooks'
import { greedyMesh } from './examples/docs/src/greedyMesh'

const SIZE = 32
const RADIUS = SIZE * 0.4
const CENTER = (SIZE - 1) * 0.5

const vox = new Uint8Array(SIZE * SIZE * SIZE)
const idx = (x: number, y: number, z: number) => x + y * SIZE + z * SIZE * SIZE

for (let z = 0; z < SIZE; z++) {
        for (let y = 0; y < SIZE; y++) {
                for (let x = 0; x < SIZE; x++) {
                        const dx = x - CENTER
                        const dy = y - CENTER
                        const dz = z - CENTER
                        const inside = dx * dx + dy * dy + dz * dz <= RADIUS * RADIUS
                        if (inside) vox[idx(x, y, z)] = 1
                }
        }
}

type Sample = { time: number; count: number }

const sample = (): Sample => {
        const start = performance.now()
        const { count } = greedyMesh(vox, SIZE, [], [])
        const end = performance.now()
        return { time: end - start, count }
}

const run = (n = 10) => {
        const results: Sample[] = []
        for (let i = 0; i < n; i++) results.push(sample())
        const avg = results.reduce((sum, r) => sum + r.time, 0) / n
        const last = results[results.length - 1]
        console.log(`sphere SIZE=${SIZE} radius=${RADIUS.toFixed(1)} runs=${n}`)
        console.log(`last count=${last.count} time=${last.time.toFixed(3)}ms`)
        console.log(`avg time=${avg.toFixed(3)}ms`)
}

run()
