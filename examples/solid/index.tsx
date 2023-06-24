import { render } from 'solid-js/web'

const root = document.getElementById('root')

if (import.meta.env.DEV && !(root instanceof HTMLElement)) {
        throw new Error(
                'Root element not found. Did you forget to add it to your index.html? Or maybe the id attribute got misspelled?'
        )
}

const App = () => {
        return (
                <canvas
                        style={{
                                top: 0,
                                left: 0,
                                width: '100%',
                                height: '100%',
                                position: 'fixed',
                                background: '#e2e2e2',
                        }}
                />
        )
}

render(() => <App />, root!)
