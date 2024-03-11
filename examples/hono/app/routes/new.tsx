import { z } from 'zod'
import { createRoute } from 'honox/factory'
import { basicAuth } from 'hono/basic-auth'
import { zValidator } from '@hono/zod-validator'
import { cors } from 'hono/cors'
import App from '../islands/new'
import { DefaultFragmentShader } from '../constants'

const AUTH = basicAuth({
        username: 'username',
        password: 'password',
})

export const GET = createRoute(cors(), AUTH, async (c) => {
        return c.render(<App defaultFragmentShader={DefaultFragmentShader} />)
})

const schema = z.object({
        title: z.string().min(1),
        content: z.string().min(1),
})

export const POST = createRoute(
        cors(),
        zValidator('form', schema, (result, c) => {
                if (!result.success) {
                        return c.render('Error', {
                                hasScript: true,
                        })
                }
        }),
        async (c) => {
                const name = c.req.query('name') ?? 'hono'
                const { title, content } = c.req.valid('form')
                const id = crypto.randomUUID()
                const { success } = await c.env?.DB?.prepare?.(
                        `insert into creation (id, title, content) values (?, ?, ?)`
                )
                        .bind(id, title, content)
                        .run()
                if (success) {
                        c.status(201)
                        return c.redirect(`/${name}/${id}`, 303)
                } else {
                        c.status(500)
                        return c.text('Something went wrong')
                }
        }
)
