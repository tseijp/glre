import { Fn, Float, X, atan, mod } from "../../node"

const PI = 3.1415926535897932384626433832795
const TAU = 6.2831853071795864769252867665590

export const atan2 = Fn(([y, x]: [X, X]): X => {
        return mod(atan(y.div(x)).add(PI), TAU)
}).setLayout({
        name: "atan2",
        type: "auto",
        inputs: [
                {
                        name: "y",
                        type: "auto",
                },
                {
                        name: "x", 
                        type: "auto",
                }
        ]
})