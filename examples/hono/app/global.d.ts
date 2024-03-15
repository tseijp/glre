import {} from 'hono'

import '@hono/react-renderer'

declare module '@hono/react-renderer' {
        interface Props {
                title?: string
        }
}

declare module 'hono' {
        interface Env {
                Bindings: {
                        DB: D1Database
                }
        }
        interface ContextRenderer {
                (content: string | Promise<string>, head?: Head):
                        | Response
                        | Promise<Response>
        }
}
