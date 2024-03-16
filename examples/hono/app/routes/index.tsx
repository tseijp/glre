import { createRoute } from 'honox/factory'
import { cors } from 'hono/cors'
import App from '../islands/home'

export const GET = createRoute(cors(), async (c) => {
        // @ts-ignore
        const { results } = await c.env?.DB?.prepare?.(
                `select * from creation`
        ).all()
        const creationItems = results as any[]

        return c.render(<App creationItems={creationItems} />)
})
