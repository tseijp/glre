export default function wasmDebugPlugin() {
        console.log('[wasmDebugPlugin] init')
        return {
                name: 'wasm-debug-plugin',
                configureWebpack(_: any, isServer: boolean) {
                        console.log('[wasmDebugPlugin] configureWebpack', { isServer })
                        return {
                                experiments: {
                                        asyncWebAssembly: true,
                                },
                        }
                },
        }
}
