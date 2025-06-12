import { defineConfig } from 'tsup'
import { defaultConfig } from '../../tsup.config.base'

export default defineConfig((options) => {
        return defaultConfig(
                {
                        entry: ['src/index.ts', 'src/native.ts', 'src/react.ts', 'src/solid.ts'],
                },
                options
        )
})
