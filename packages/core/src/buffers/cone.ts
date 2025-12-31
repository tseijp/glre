import { buffer } from './buffer'
import type { Attributes } from './buffer'
import { cylinder } from './cylinder'

interface ConeProps {
        radius?: number
        height?: number
        radialSegments?: number
        heightSegments?: number
        openEnded?: boolean
        thetaStart?: number
        thetaLength?: number
        needNormal?: boolean
        needIndice?: boolean
}

export const cone = ({ radius = 1, height = 1, radialSegments = 32, heightSegments = 1, openEnded = false, thetaStart = 0, thetaLength = Math.PI * 2, needNormal = true, needIndice = false }: ConeProps) => {
        return cylinder({
                radiusTop: 0,
                radiusBottom: radius,
                height,
                radialSegments,
                heightSegments,
                openEnded,
                thetaStart,
                thetaLength,
                needNormal,
                needIndice,
        })
}
