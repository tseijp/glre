import { render } from 'solid-js/web' // @ts-ignore
import { onGL } from 'glre/solid'

const App = () => {
        const gl = onGL()

        return (
                <canvas
                        ref={gl.ref}
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

render(() => <App />, document.getElementById('root')!)
