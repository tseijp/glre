/**
 * ref: https://julesblom.com/writing/usesyncexternalstore
 */
import { useSyncExternalStore } from 'react'

const subscribeWindowSize = (onChange: () => void) => {
        window.addEventListener('resize', onChange)
        return () => {
                window.removeEventListener('resize', onChange)
        }
}

const getWindowWidthSnapshot = () => window.innerWidth

const getWindowHeightSnapshot = () => window.innerHeight

export const useWindowSize = () => {
        const width = useSyncExternalStore(
                subscribeWindowSize,
                getWindowWidthSnapshot,
                () => null
        )
        const height = useSyncExternalStore(
                subscribeWindowSize,
                getWindowHeightSnapshot,
                () => null
        )

        return [width, height]
}
