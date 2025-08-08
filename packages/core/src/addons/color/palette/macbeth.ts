import { Fn, vec3, Int, Vec3, If, select } from '../../../node'

const colors = [
        vec3(0.46017, 0.33059, 0.27477), // DARK_SKIN
        vec3(0.769, 0.576, 0.506), // LIGHT_SKIN
        vec3(0.356, 0.472, 0.609), // BLUE_SKY
        vec3(0.357, 0.427, 0.247), // FOLIAGE
        vec3(0.518, 0.506, 0.694), // BLUE_FLOWER
        vec3(0.384, 0.749, 0.675), // BLUISH_GREEN
        vec3(0.867, 0.487, 0.184), // ORANGE
        vec3(0.290, 0.357, 0.671), // PURPLISH_BLUE
        vec3(0.769, 0.333, 0.384), // MODERATE_RED
        vec3(0.365, 0.231, 0.420), // PURPLE
        vec3(0.624, 0.745, 0.227), // YELLOW_GREEN
        vec3(0.894, 0.635, 0.160), // ORANGE_YELLOW
        vec3(0.176, 0.247, 0.584), // BLUE
        vec3(0.239, 0.588, 0.290), // GREEN
        vec3(0.690, 0.224, 0.227), // RED
        vec3(0.925, 0.784, 0.094), // YELLOW
        vec3(0.749, 0.309, 0.598), // MAGENTA
        vec3(0.000, 0.537, 0.659), // CYAN
        vec3(0.956, 0.956, 0.945), // WHITE
        vec3(0.789, 0.797, 0.797), // NEUTRAL_80
        vec3(0.635, 0.643, 0.643), // NEUTRAL_65
        vec3(0.475, 0.478, 0.478), // NEUTRAL_50
        vec3(0.329, 0.333, 0.337), // NEUTRAL_35
        vec3(0.200, 0.200, 0.204)  // BLACK
]

export const macbeth = Fn(([index]: [Int]): Vec3 => {
        let result = vec3(0)
        for (let i = 0; i < colors.length; i++) {
                result = select(result, colors[i], index.equal(i))
        }
        return result
}).setLayout({
        name: 'macbeth',
        type: 'vec3',
        inputs: [
                { name: 'index', type: 'int' }
        ]
})