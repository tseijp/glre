import { Fn, vec3, Int, Vec3, If, int } from '../../../node'

const colors = [
        [0.46017, 0.33059, 0.27477], // DARK_SKIN
        [0.769, 0.576, 0.506], // LIGHT_SKIN
        [0.356, 0.472, 0.609], // BLUE_SKY
        [0.357, 0.427, 0.247], // FOLIAGE
        [0.518, 0.506, 0.694], // BLUE_FLOWER
        [0.384, 0.749, 0.675], // BLUISH_GREEN
        [0.867, 0.487, 0.184], // ORANGE
        [0.29, 0.357, 0.671], // PURPLISH_BLUE
        [0.769, 0.333, 0.384], // MODERATE_RED
        [0.365, 0.231, 0.42], // PURPLE
        [0.624, 0.745, 0.227], // YELLOW_GREEN
        [0.894, 0.635, 0.16], // ORANGE_YELLOW
        [0.176, 0.247, 0.584], // BLUE
        [0.239, 0.588, 0.29], // GREEN
        [0.69, 0.224, 0.227], // RED
        [0.925, 0.784, 0.094], // YELLOW
        [0.749, 0.309, 0.598], // MAGENTA
        [0.0, 0.537, 0.659], // CYAN
        [0.956, 0.956, 0.945], // WHITE
        [0.789, 0.797, 0.797], // NEUTRAL_80
        [0.635, 0.643, 0.643], // NEUTRAL_65
        [0.475, 0.478, 0.478], // NEUTRAL_50
        [0.329, 0.333, 0.337], // NEUTRAL_35
        [0.2, 0.2, 0.204], // BLACK
]

export const macbeth = Fn(([index]: [Int]): Vec3 => {
        const result = vec3(0).toVar()
        let ifChain = If(index.equal(int(0)), () => void result.assign(vec3(...colors[0])))
        for (let i = 1; i < colors.length; i++)
                ifChain = ifChain.ElseIf(index.equal(int(i)), () => void result.assign(vec3(...colors[i])))
        return result
}).setLayout({
        name: 'macbeth',
        type: 'vec3',
        inputs: [{ name: 'index', type: 'int' }],
})
