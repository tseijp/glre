import { Fn, X } from "../../node"

export const map = Fn(([v, iMin, iMax]: [X, X, X]): X => {
        return v.sub(iMin).div(iMax.sub(iMin))
}).setLayout({
        name: "map",
        type: "auto",
        inputs: [
                { name: "v", type: "auto" },
                { name: "iMin", type: "auto" },
                { name: "iMax", type: "auto" },
        ],
})

export const mapRange = Fn(([v, iMin, iMax, oMin, oMax]: [X, X, X, X, X]): X => {
        return oMin.add(oMax.sub(oMin).mul(v.sub(iMin).div(iMax.sub(iMin))))
}).setLayout({
        name: "mapRange",
        type: "auto",
        inputs: [
                { name: "v", type: "auto" },
                { name: "iMin", type: "auto" },
                { name: "iMax", type: "auto" },
                { name: "oMin", type: "auto" },
                { name: "oMax", type: "auto" },
        ],
})