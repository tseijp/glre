import { createRoute } from 'honox/factory'
import { basicAuth } from 'hono/basic-auth'
import { cors } from 'hono/cors'
import App from '../islands/new'
import Layout from '../containers/Layout'

const AUTH = basicAuth({
        username: 'username',
        password: 'password',
})

const defaultFragmentShader = `
void main() {
  gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
}
`.trim()

export const GET = createRoute(cors(), AUTH, async (c) => {
        return c.render(
                <Layout>
                        <App defaultFragmentShader={defaultFragmentShader} />
                </Layout>
        )
})

export const POST = createRoute(cors(), async (c) => {
        const name = c.req.query('name') ?? 'hono'
        const id = crypto.randomUUID()
        const { success } = await c.env?.DB?.prepare?.(
                `insert into creation (id) values (?)`
        )
                .bind(id)
                .run()
        if (success) {
                c.status(201)
                return c.redirect(`/${name}/${id}`, 303)
        } else {
                c.status(500)
                return c.text('Something went wrong')
        }
})
