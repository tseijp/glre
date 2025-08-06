import { Fn, Float, step } from "../../node"

export const adaptiveThreshold = Fn(([v, blur_v, b]: [Float, Float, Float]): Float => {
        return step(blur_v.add(b), v)
}).setLayout({
        name: "adaptiveThreshold",
        type: "float",
        inputs: [
                {
                        name: "v",
                        type: "float"
                },
                {
                        name: "blur_v",
                        type: "float"
                },
                {
                        name: "b",
                        type: "float"
                }
        ]
})

export const adaptiveThresholdSimple = Fn(([v, blur_v]: [Float, Float]): Float => {
        return step(blur_v.sub(0.05), v)
}).setLayout({
        name: "adaptiveThresholdSimple",
        type: "float",
        inputs: [
                {
                        name: "v",
                        type: "float"
                },
                {
                        name: "blur_v",
                        type: "float"
                }
        ]
})