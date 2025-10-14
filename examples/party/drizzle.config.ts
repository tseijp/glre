// drizzle.config.ts
import type { Config } from 'drizzle-kit'

export default {
        schema: './src/schema.ts',
        out: './drizzle',
        dialect: 'sqlite',
} satisfies Config
