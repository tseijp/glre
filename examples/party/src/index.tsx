import { Hono } from 'hono'
const app = new Hono().get('/api/v1/res', (c) => c.text('ok'))
export default app
