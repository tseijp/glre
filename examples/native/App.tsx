import React from 'react'
import { Text } from 'react-native'
import { GLView } from 'expo-gl'
import { useGL } from 'glre/native'

export default function App() {
        // return <Text></Text>
        const self = useGL({
                render() {
                        self.clear()
                        self.viewport()
                        self.drawArrays()
                        self.gl.flush()
                        self.gl.endFrameEXP()
                },
        })
        return <GLView style={{ flex: 1 }} onContextCreate={self.ref} />
}
