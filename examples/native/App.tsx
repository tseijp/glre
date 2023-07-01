import React from 'react'
import { View, StyleSheet, useWindowDimensions } from 'react-native'
import { GLView } from 'expo-gl'
import { useGL } from 'glre/native'

const styles = StyleSheet.create({
        container: {
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
        },
        canvas: {
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100vw',
                height: '100vh',
        },
})

export default function App() {
        const { width, height } = useWindowDimensions()
        const self = useGL({
                render() {
                        self.clear()
                        self.viewport()
                        self.drawArrays()
                },
        })

        return (
                <View style={styles.container}>
                        <GLView
                                style={{ width, height }}
                                onContextCreate={self.ref}
                        />
                </View>
        )
}
