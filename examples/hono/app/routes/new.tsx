import { z } from 'zod'
import { createRoute } from 'honox/factory'
import { basicAuth } from 'hono/basic-auth'
import { zValidator } from '@hono/zod-validator'
import { cors } from 'hono/cors'
import App from '../islands/new'

const AUTH = basicAuth({
        username: 'username',
        password: 'password',
})

export const GET = createRoute(cors(), AUTH, async (c) => {
        return c.render(<App />)
})

const schema = z.object({
        title: z.string().min(1),
        content: z.string().min(1),
})

export const POST = createRoute(
        cors(),
        zValidator('json', schema, (result, c) => {
                if (!result.success) return c.render('Error')
        }),
        async (c) => {
                // const name = c.req.query('name') ?? 'hono'
                const { title, content } = c.req.valid('json')
                const id = crypto.randomUUID()
                const { success } = await c.env?.DB?.prepare?.(
                        `INSERT INTO creation (id, title, content) VALUES (?, ?, ?)`
                )
                        .bind(id, title, content)
                        .run()
                if (success) {
                        c.status(201)
                        return c.json({ id })
                } else {
                        c.status(500)
                        return c.json({ message: 'Something went wrong' })
                }
        }
)

export type CreateAppType = typeof POST
