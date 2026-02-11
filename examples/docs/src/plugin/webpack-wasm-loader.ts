export default function wasmDebugPlugin() {
        return {
                name: 'wasm-debug-plugin',
                configureWebpack(_: any, isServer: boolean) {
                        return {
                                experiments: { asyncWebAssembly: true },
                                module: {
                                        rules: [{
                                                test: /\.wasm$/,
                                                type: isServer ? 'asset/resource' : 'webassembly/async',
                                        }],
                                },
                        }
                },
        }
}
