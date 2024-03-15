import { createRoute } from 'honox/factory'
import { cors } from 'hono/cors'
import Layout from '../containers/Container'
import App from '../islands/home'

export const GET = createRoute(cors(), async (c) => {
        // @ts-ignore
        const { results } = await c.env?.DB?.prepare?.(
                `select * from creation`
        ).all()

        return c.render(
                <Layout>
                        <App creationItems={results} />
                </Layout>
        )
})
