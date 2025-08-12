import { Fn, Vec3 } from '../../../node'

// AABB centroid calculation
// Equivalent to: vec3 centroid(const in AABB _box) { return (_box.min + _box.max) * 0.5; }
// Since GLRE uses separate min/max parameters instead of struct, we adapt the interface
export const aabbCentroid = Fn(([minVal, maxVal]: [Vec3, Vec3]): Vec3 => {
        return minVal.add(maxVal).mul(0.5)
}).setLayout({
        name: 'aabbCentroid',
        type: 'vec3',
        inputs: [
                { name: 'minVal', type: 'vec3' },
                { name: 'maxVal', type: 'vec3' },
        ],
})
