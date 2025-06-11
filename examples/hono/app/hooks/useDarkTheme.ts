/**
 * https://julesblom.com/writing/usesyncexternalstore
 */
import { useSyncExternalStore } from 'react'

export const subscribeDarkTheme = (onChange: () => void) => {
        const mql = window.matchMedia('(prefers-color-scheme: dark)')
        mql.addEventListener('change', onChange)

        return () => {
                mql.removeEventListener('change', onChange)
        }
}

export const getDarkThemeSnapshot = () => {
        return window.matchMedia('(prefers-color-scheme: dark)').matches
}

export const useDarkTheme = () => {
        return useSyncExternalStore(
                subscribeDarkTheme,
                getDarkThemeSnapshot,
                () => null
        )
}
