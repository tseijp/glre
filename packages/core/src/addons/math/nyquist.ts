import { Fn, Float, X, mix, smoothstep } from "../../node"

export const nyquist = Fn(([x, width]: [X, Float]): X => {
        const cutoffStart = 0.25 // NYQUIST_FILTER_CENTER - NYQUIST_FILTER_WIDTH = 0.5 - 0.25
        const cutoffEnd = 0.75   // NYQUIST_FILTER_CENTER + NYQUIST_FILTER_WIDTH = 0.5 + 0.25
        const f = smoothstep(cutoffEnd, cutoffStart, width)
        return mix(0.5, x, f)
}).setLayout({
        name: "nyquist",
        type: "auto",
        inputs: [
                { name: "x", type: "auto" },
                { name: "width", type: "float" }
        ]
})