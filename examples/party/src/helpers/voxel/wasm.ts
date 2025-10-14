export const importWasm = async () => {
        const wasm: any = await import('../../../voxelizer/pkg/voxelizer')
        await wasm.default()
        return wasm
}

export const cancelVoxelizer = async () => {
        const wasm = await importWasm()
        if ((wasm as any).cancel) (wasm as any).cancel()
}
