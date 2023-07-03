import { component$ } from '@builder.io/qwik'
import { useGL } from 'glre/qwik'

import type { DocumentHead } from '@builder.io/qwik-city'

export default component$(() => {
        useGL()
        return (
                <canvas
                        style={{
                                top: 0,
                                left: 0,
                                position: 'fixed',
                                background: '#e2e2e2',
                        }}
                />
        )
})

export const head: DocumentHead = {
        title: 'Welcome to Qwik',
        meta: [
                {
                        name: 'description',
                        content: 'Qwik site description',
                },
        ],
}
