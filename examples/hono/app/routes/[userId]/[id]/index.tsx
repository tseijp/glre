import { z } from 'zod'
import { createRoute } from 'honox/factory'
import { basicAuth } from 'hono/basic-auth'
import { zValidator } from '@hono/zod-validator'
import { cors } from 'hono/cors'
import App from '../../../islands/edit'

const AUTH = basicAuth({
        username: 'username',
        password: 'password',
})

export const GET = createRoute(cors(), AUTH, async (c) => {
        const { id } = c.req.param()
        // @ts-ignore
        const { results } = await c.env?.DB?.prepare?.(
                `select * from creation where id = ?`
        )
                .bind(id)
                .all()
        const item = results[0]

        return c.render(
                <App
                        creationId={id}
                        creationTitle={item.title}
                        creationContent={item.content}
                />
        )
})

const schema = z.object({
        title: z.string().min(1),
        content: z.string().min(1),
})

export const PUT = createRoute(
        cors(),
        zValidator('json', schema, (result, c) => {
                if (!result.success) {
                        return c.render('Error', {
                                hasScript: true,
                        })
                }
        }),
        async (c) => {
                // const name = c.req.query('name') ?? 'hono'
                const { id } = c.req.param()
                const { title, content } = c.req.valid('json')

                // @ts-ignore
                const { success } = await c.env?.DB?.prepare?.(
                        `UPDATE creation SET title = ?, content = ? WHERE id = ?`
                )
                        .bind(title, content, id)
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

export type UpdateAppType = typeof PUT

export const DELETE = createRoute(cors(), async (c) => {
        const { id } = c.req.param()
        // @ts-ignore
        const { success } = await c.env?.DB?.prepare?.(
                `DELETE FROM creation WHERE id = ?`
        )
                .bind(id)
                .run()
        if (success) {
                c.status(201)
                return c.json({ message: 'Deleted' })
        } else {
                c.status(500)
                return c.json({ message: 'Something went wrong' })
        }
})

export type DeleteAppType = typeof PUT

// import { createRoute } from 'honox/factory'
// import Layout from '../../../containers/Container'
// import { cors } from 'hono/cors'
// import App from '../../../islands/item'

// export const GET = createRoute(cors(), async (c) => {
//         const name = c.req.query('name') ?? 'Hono'
//         const { id } = c.req.param()
//         // @ts-ignore
//         const { results } = await c.env?.DB?.prepare?.(
//                 `select * from creation where id = ?`
//         )
//                 .bind(id)
//                 .all()

//         return c.render(
//                 <Layout>
//                         <App creationId={id} creationItems={results} />
//                 </Layout>,
//                 { title: name }
//         )
// })
