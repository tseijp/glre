import { Fn, vec3, Int, Vec3, If, int } from '../../../node'

const colors = [
        vec3(0.46017, 0.33059, 0.27477), // DARK_SKIN
        vec3(0.769, 0.576, 0.506), // LIGHT_SKIN
        vec3(0.356, 0.472, 0.609), // BLUE_SKY
        vec3(0.357, 0.427, 0.247), // FOLIAGE
        vec3(0.518, 0.506, 0.694), // BLUE_FLOWER
        vec3(0.384, 0.749, 0.675), // BLUISH_GREEN
        vec3(0.867, 0.487, 0.184), // ORANGE
        vec3(0.29, 0.357, 0.671), // PURPLISH_BLUE
        vec3(0.769, 0.333, 0.384), // MODERATE_RED
        vec3(0.365, 0.231, 0.42), // PURPLE
        vec3(0.624, 0.745, 0.227), // YELLOW_GREEN
        vec3(0.894, 0.635, 0.16), // ORANGE_YELLOW
        vec3(0.176, 0.247, 0.584), // BLUE
        vec3(0.239, 0.588, 0.29), // GREEN
        vec3(0.69, 0.224, 0.227), // RED
        vec3(0.925, 0.784, 0.094), // YELLOW
        vec3(0.749, 0.309, 0.598), // MAGENTA
        vec3(0.0, 0.537, 0.659), // CYAN
        vec3(0.956, 0.956, 0.945), // WHITE
        vec3(0.789, 0.797, 0.797), // NEUTRAL_80
        vec3(0.635, 0.643, 0.643), // NEUTRAL_65
        vec3(0.475, 0.478, 0.478), // NEUTRAL_50
        vec3(0.329, 0.333, 0.337), // NEUTRAL_35
        vec3(0.2, 0.2, 0.204), // BLACK
]

export const macbeth = Fn(([index]: [Int]): Vec3 => {
        let result = vec3(0).toVar()
        If(index.equal(int(0)), () => {
                result.assign(colors[0])
        })
        If(index.equal(int(1)), () => {
                result.assign(colors[1])
        })
        If(index.equal(int(2)), () => {
                result.assign(colors[2])
        })
        If(index.equal(int(3)), () => {
                result.assign(colors[3])
        })
        If(index.equal(int(4)), () => {
                result.assign(colors[4])
        })
        If(index.equal(int(5)), () => {
                result.assign(colors[5])
        })
        If(index.equal(int(6)), () => {
                result.assign(colors[6])
        })
        If(index.equal(int(7)), () => {
                result.assign(colors[7])
        })
        If(index.equal(int(8)), () => {
                result.assign(colors[8])
        })
        If(index.equal(int(9)), () => {
                result.assign(colors[9])
        })
        If(index.equal(int(10)), () => {
                result.assign(colors[10])
        })
        If(index.equal(int(11)), () => {
                result.assign(colors[11])
        })
        If(index.equal(int(12)), () => {
                result.assign(colors[12])
        })
        If(index.equal(int(13)), () => {
                result.assign(colors[13])
        })
        If(index.equal(int(14)), () => {
                result.assign(colors[14])
        })
        If(index.equal(int(15)), () => {
                result.assign(colors[15])
        })
        If(index.equal(int(16)), () => {
                result.assign(colors[16])
        })
        If(index.equal(int(17)), () => {
                result.assign(colors[17])
        })
        If(index.equal(int(18)), () => {
                result.assign(colors[18])
        })
        If(index.equal(int(19)), () => {
                result.assign(colors[19])
        })
        If(index.equal(int(20)), () => {
                result.assign(colors[20])
        })
        If(index.equal(int(21)), () => {
                result.assign(colors[21])
        })
        If(index.equal(int(22)), () => {
                result.assign(colors[22])
        })
        If(index.equal(int(23)), () => {
                result.assign(colors[23])
        })
        return result
}).setLayout({
        name: 'macbeth',
        type: 'vec3',
        inputs: [{ name: 'index', type: 'int' }],
})
