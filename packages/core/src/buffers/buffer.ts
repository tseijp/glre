import { attribute, float, vec3 } from '../node'

export interface Attributes {
        vertex: number[]
        normal: number[]
        indice: number[]
}

export const buffer = <T extends object>(fun: (props: T, out: Attributes) => void) => {
        return (props: T = {} as T) => {
                const attributes = { vertex: [], normal: [], indice: [] }
                fun(props, attributes)
                return {
                        attributes,
                        count: Math.round(attributes.vertex.length / 3),
                        vertex: (id = 'vertex') => attribute(vec3(attributes.vertex), id),
                        normal: (id = 'normal') => attribute(vec3(attributes.normal), id),
                        indice: (id = 'indice') => attribute(float(attributes.indice), id),
                }
        }
}
