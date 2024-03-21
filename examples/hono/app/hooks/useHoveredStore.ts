import { useEffect, useSyncExternalStore } from 'react'

let snapshotHoveredStore = false

const hoverCanvasListeners = new Set<Function>()

const subscribeHoveredStore = (onChange: Function) => {
        hoverCanvasListeners.add(onChange)

        return () => {
                hoverCanvasListeners.delete(onChange)
        }
}

const getSnapshotHoveredStore = () => {
        return snapshotHoveredStore
}

const setSnapshotHoveredStore = (snapshot: boolean) => {
        hoverCanvasListeners.forEach((listener) => listener(snapshot))
        snapshotHoveredStore = snapshot
}

export const useHoveredStore = () => {
        return [
                useSyncExternalStore(
                        subscribeHoveredStore,
                        getSnapshotHoveredStore,
                        getSnapshotHoveredStore
                ),
                setSnapshotHoveredStore,
        ] as const
}

export const useSetHoveredStore = () => {
        return setSnapshotHoveredStore
}

export const useHoveredStoreEffect = (onChange: Function) => {
        useEffect(() => subscribeHoveredStore(onChange))
}
