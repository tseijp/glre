import { is } from '../utils/helpers'
import { shader } from './code'
import { NodeState, X } from './types'

export const joins = (children: X[], state: NodeState) => {
        return children
                .filter((x) => !is.und(x) && !is.nul(x))
                .map((x) => shader(x, state))
                .join(', ')
}

export const generateFragmentMain = (body: string): string => {
        // if (isWebGL)
        if (true)
                return `
void main() {
        gl_FragColor = ${body};
}`.trim()
        else
                return `
@fragment
fn main(@builtin(position) position: vec4f) -> @location(0) vec4f {
        return ${body};
}`.trim()
}
