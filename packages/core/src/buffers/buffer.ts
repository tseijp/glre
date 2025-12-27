import { attribute, float, vec3 } from '../node'

export interface Attributes {
        vertex: number[]
        normal: number[]
        indice: number[]
}

export const buffer = <T extends object>(fun: (props: T, out: Attributes) => void) => {
        return (props: T) => {
                const attributes = { vertex: [], normal: [], indice: [] }
                fun(props, attributes)
                return {
                        attributes,
                        count: attributes.vertex.length / 3,
                        vertex: attribute(vec3(attributes.vertex)),
                        normal: attribute(vec3(attributes.normal)),
                        indice: attribute(float(attributes.indice)),
                }
        }
}
