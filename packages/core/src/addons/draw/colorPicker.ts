import { Fn, Vec2, Vec4, vec2, vec4, texture, step, float, vec3 } from '../../node'
import { nearest } from '../space/nearest'

const pickerSize = vec2(0.05)
const crosshairSize = float(0.003)

export const colorPickerSample = Fn(([tex, pos, texResolution]: [any, Vec2, Vec2]): Vec4 => {
        const nearestPos = nearest(pos, texResolution)
        return texture(tex, nearestPos)
}).setLayout({
        name: 'colorPickerSample',
        type: 'vec4',
        inputs: [
                { name: 'tex', type: 'sampler2D' },
                { name: 'pos', type: 'vec2' },
                { name: 'texResolution', type: 'vec2' },
        ],
})

export const colorPickerDisplay = Fn(([st, pickerPos, pickedColor]: [Vec2, Vec2, Vec4]): Vec4 => {
        const displayPos = pickerPos.add(vec2(0.08, 0.08)).toVar('displayPos')
        const distToDisplay = st.sub(displayPos).abs().toVar('distToDisplay')
        const inPatch = step(distToDisplay.x, pickerSize.x).mul(step(distToDisplay.y, pickerSize.y)).toVar('inPatch')
        const crosshair = step(st.sub(pickerPos).abs().x, crosshairSize)
                .mul(step(st.sub(pickerPos).abs().y, crosshairSize.mul(5)))
                .add(
                        step(st.sub(pickerPos).abs().y, crosshairSize).mul(
                                step(st.sub(pickerPos).abs().x, crosshairSize.mul(5))
                        )
                )
                .toVar('crosshair')
        const borderWidth = float(0.002).toVar('borderWidth')
        const inBorder = step(distToDisplay.x, pickerSize.x.add(borderWidth))
                .mul(step(distToDisplay.y, pickerSize.y.add(borderWidth)))
                .sub(inPatch)
                .toVar('inBorder')
        const result = vec4(0, 0, 0, 0).toVar('result')
        result.rgb.assign(pickedColor.rgb.mul(inPatch))
        result.a.assign(inPatch)
        result.rgb.assign(result.rgb.add(vec3(1, 1, 1).mul(crosshair)))
        result.a.assign(result.a.add(crosshair))
        result.a.assign(result.a.add(inBorder))
        return result
}).setLayout({
        name: 'colorPickerDisplay',
        type: 'vec4',
        inputs: [
                { name: 'st', type: 'vec2' },
                { name: 'pickerPos', type: 'vec2' },
                { name: 'pickedColor', type: 'vec4' },
        ],
})

export const colorPicker = Fn(([st, tex, pickerPos, texResolution]: [Vec2, any, Vec2, Vec2]): Vec4 => {
        const pickedColor = colorPickerSample(tex, pickerPos, texResolution)
        return colorPickerDisplay(st, pickerPos, pickedColor)
}).setLayout({
        name: 'colorPicker',
        type: 'vec4',
        inputs: [
                { name: 'st', type: 'vec2' },
                { name: 'tex', type: 'sampler2D' },
                { name: 'pickerPos', type: 'vec2' },
                { name: 'texResolution', type: 'vec2' },
        ],
})
