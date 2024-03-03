import { createRoute } from 'honox/factory'
import Counter from '../islands/counter'

export default createRoute((c) => {
        const name = c.req.query('name') ?? 'Hono'
        return c.render(
                <div className="font-sans">
                        <h1>Hello, {name}!</h1>
                        <Counter />
                </div>,
                { title: name }
        )
})
