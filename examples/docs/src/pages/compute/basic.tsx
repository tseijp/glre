/**
 * ref: https://webgpu.github.io/webgpu-samples/?sample=gameOfLife
@binding(0) @group(0) var<storage, read> size: vec2u;
@binding(1) @group(0) var<storage, read> current: array<u32>;
@binding(2) @group(0) var<storage, read_write> next: array<u32>;

override blockSize = 8;

fn getIndex(x: u32, y: u32) -> u32 {
        let h = size.y;
        let w = size.x;
        return (y % h) * w + (x % w);
}

fn getCell(x: u32, y: u32) -> u32 {
        return current[getIndex(x, y)];
}

fn countNeighbors(x: u32, y: u32) -> u32 {
        return getCell(x - 1, y - 1) + getCell(x, y - 1) + getCell(x + 1, y - 1) +
               getCell(x - 1, y)     +                     getCell(x + 1, y) +
               getCell(x - 1, y + 1) + getCell(x, y + 1) + getCell(x + 1, y + 1);
}

@compute @workgroup_size(blockSize, blockSize)
fn main(@builtin(global_invocation_id) grid: vec3u) {
        let x = grid.x;
        let y = grid.y;
        let n = countNeighbors(x, y);
        next[getIndex(x, y)] = select(u32(n == 3u), u32(n == 2u || n == 3u), getCell(x, y) == 1u);
}
 */
import { float, Float, Fn, id, storage, uv, UVec3, vec3, Vec2, vec4 } from 'glre/src/node'
import { useGL, isServer } from 'glre/src/react'

export default function GPGPUBasicApp() {
        const [w, h] = isServer() ? [0, 0].fill(Math.pow(2, 8)) : [window.innerWidth, window.innerHeight]
        const particleCount = w * h

        const data = storage(float(), 'data')

        const index = (x: Float, y: Float) => x.mul(w).add(y).toUInt()

        const cell = (x: Float, y: Float) => data.element(index(x, y))

        const neighbors = (x: Float, y: Float) => {
                return cell(x.sub(1), y.sub(1))
                        .add(cell(x.sub(1), y.add(1)))
                        .add(cell(x.add(1), y.sub(1)))
                        .add(cell(x.add(1), y.add(1)))
                        .add(cell(x, y.sub(2)))
                        .add(cell(x, y.add(2)))
                        .add(cell(x.sub(2), y))
                        .add(cell(x.add(2), y))
                        .toVar()
        }

        const cs = Fn(([id]: [UVec3]) => {
                const index = id.x.toFloat().toVar('index')
                const x = index.mod(w).toVar('x')
                const y = index.div(w).toVar('y')
                const n = neighbors(x, y).toVar('n')
                const alive = cell(x, y).equal(1).toVar('alive')
                const survive = n.equal(2).or(n.equal(7)).toVar('survive')
                const born = n.equal(3).toVar('born')
                const next = alive.and(survive).or(born).toFloat().toVar('next')
                data.element(id.x).assign(next)
        })

        const fs = Fn(([uv]: [Vec2]) => {
                const x = uv.x.mul(h).floor()
                const y = uv.y.mul(h).floor()
                const index = y.mul(w).add(x)
                const color = data.element(index.toUInt())
                return vec4(vec3(color), 1)
        })

        const gl = useGL({
                particleCount: [w, h],
                isWebGL: false,
                cs: cs(id),
                fs: fs(uv),
        })

        const init = new Float32Array(particleCount)
        for (let i = 0; i < particleCount; i++) init[i] = Math.random() < 0.1 ? 0 : 1
        gl.storage(data.props.id!, init)

        return <canvas ref={gl.ref} />
}
