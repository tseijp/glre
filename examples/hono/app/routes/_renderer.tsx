import { reactRenderer } from '@hono/react-renderer'

export default reactRenderer(({ children, title }) => {
        const src = (import.meta as any).env.PROD
                ? '/static/client.js'
                : '/app/client.ts'
        return (
                <html lang="en">
                        <head>
                                <meta charSet="UTF-8" />
                                <meta
                                        name="viewport"
                                        content="width=device-width, initial-scale=1.0"
                                />
                                <script type="module" src={src}></script>
                        </head>
                        <body>{children}</body>
                </html>
        )
})
