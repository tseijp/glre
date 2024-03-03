import { reactRenderer } from '@hono/react-renderer'

export default reactRenderer(({ children, title }) => {
        const href = (import.meta as any).env.PROD
                ? 'static/assets/style.css'
                : '/app/style.css'
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
                                <link href={href} rel="stylesheet" />
                                <script type="module" src={src}></script>
                                {title ? <title>{title}</title> : ''}
                        </head>
                        <body>{children}</body>
                </html>
        )
})
