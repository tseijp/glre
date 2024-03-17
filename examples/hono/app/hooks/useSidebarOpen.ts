import { useEffect, useSyncExternalStore } from 'react'

let sidebarOpenStore = false

const sidebarOpenListeners = new Set<Function>()

const subscribeSidebarOpen = (onChange: Function) => {
        sidebarOpenListeners.add(onChange)
        return () => {
                sidebarOpenListeners.delete(onChange)
        }
}

const getSidebarOpenSnapshot = () => sidebarOpenStore

const setSidebarOpenSnapshot = (value: boolean) => {
        sidebarOpenStore = value
        sidebarOpenListeners.forEach((listener) => listener(value))
}

export const useSidebarOpen = () => {
        const sidebarOpen = useSyncExternalStore(
                subscribeSidebarOpen,
                getSidebarOpenSnapshot,
                getSidebarOpenSnapshot
        )

        return [sidebarOpen, setSidebarOpenSnapshot] as const
}

export const useSidebarOpenEffect = (onChange: Function) => {
        useEffect(() => {
                return subscribeSidebarOpen(onChange)
        }, [onChange])
}
