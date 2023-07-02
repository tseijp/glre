import React from 'react'
import { GLView } from 'expo-gl'
import { useGL } from 'glre/native'

export default function App() {
        const self = useGL({
                render() {
                        self.clear()
                        self.viewport()
                        self.drawArrays()
                },
        })
        return <GLView style={{ flex: 1 }} onContextCreate={self.ref} />
}
