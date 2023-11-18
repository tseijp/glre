import { render } from 'solid-js/web'
import { onGL } from 'glre/solid'

const App = () => {
        const self = onGL({
                render() {
                        self.clear()
                        self.viewport()
                        self.drawArrays()
                },
        })

        return (
                <canvas
                        ref={self.ref}
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
