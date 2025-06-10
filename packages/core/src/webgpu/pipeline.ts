// デフォルトの頂点シェーダー
const defaultVertexShader = `
@vertex
fn main(@builtin(vertex_index) vertexIndex: u32) -> @builtin(position) vec4<f32> {
    var pos = array<vec2<f32>, 6>(
        vec2<f32>(-1.0, -1.0),
        vec2<f32>( 1.0, -1.0),
        vec2<f32>(-1.0,  1.0),
        vec2<f32>(-1.0,  1.0),
        vec2<f32>( 1.0, -1.0),
        vec2<f32>( 1.0,  1.0)
    );
    return vec4<f32>(pos[vertexIndex], 0.0, 1.0);
}
`

// デフォルトのフラグメントシェーダー
const defaultFragmentShader = `
@fragment
fn main() -> @location(0) vec4<f32> {
    return vec4<f32>(1.0, 0.0, 0.0, 1.0);
}
`

// WebGPUパイプライン管理
export const createRenderPipeline = (
        device: any,
        vertexShader = defaultVertexShader,
        fragmentShader = defaultFragmentShader,
        format = 'bgra8unorm'
): any => {
        const v = device.createShaderModule({ code: vertexShader })
        const f = device.createShaderModule({ code: fragmentShader })
        return device.createRenderPipeline({
                layout: 'auto',
                vertex: {
                        module: v,
                        entryPoint: 'main',
                },
                fragment: {
                        module: f,
                        entryPoint: 'main',
                        targets: [
                                {
                                        format,
                                },
                        ],
                },
                primitive: {
                        topology: 'triangle-list',
                },
        })
}

// コンピュートパイプライン作成
export const createComputePipeline = (
        device: any,
        computeShader: string
): any => {
        const computeModule = device.createShaderModule({ code: computeShader })
        return device.createComputePipeline({
                layout: 'auto',
                compute: { module: computeModule, entryPoint: 'main' },
        })
}

// シェーダーモジュール作成
export const createShaderModule = (device: any, code: string): any => {
        return device.createShaderModule({ code })
}

// バインドグループレイアウト作成
export const createBindGroupLayout = (device: any, entries: any[]): any => {
        return device.createBindGroupLayout({ entries })
}

// バインドグループ作成
export const createBindGroup = (
        device: any,
        layout: any,
        entries: any[]
): any => {
        return device.createBindGroup({ layout, entries })
}

// レンダーパス作成
export const createRenderPass = (
        encoder: any,
        colorAttachment: any,
        depthStencilAttachment?: any
): any => {
        const descriptor: any = { colorAttachments: [colorAttachment] }
        if (depthStencilAttachment)
                descriptor.depthStencilAttachment = depthStencilAttachment
        return encoder.beginRenderPass(descriptor)
}

// コマンドエンコーダー作成
export const createCommandEncoder = (device: any): any => {
        return device.createCommandEncoder()
}
