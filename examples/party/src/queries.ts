import { eq } from 'drizzle-orm'
import { drizzle } from 'drizzle-orm/d1'
import { users } from './schema'

export const getUserBySub = (DB: D1Database, sub: string) =>
        drizzle(DB).select().from(users).where(eq(users.id, sub)).limit(1)

