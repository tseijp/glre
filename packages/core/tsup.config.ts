import { defineConfig } from 'tsup'
import { defaultConfig } from '../../tsup.config.base'

export default defineConfig((options) => {
        return defaultConfig(
                {
                        entry: [
                                'index.ts',
                                'native.ts',
                                'react.ts',
                                'solid.ts',
                        ],
                },
                options
        )
})
