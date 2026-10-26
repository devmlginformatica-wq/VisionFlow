import { useEffect, useState } from 'react'

interface NetworkStatus {
    isOnline: boolean
}

export function useNetworkStatus(): NetworkStatus {
    const [isOnline, setIsOnline] = useState(
        () => typeof navigator === 'undefined' || navigator.onLine,
    )

    useEffect(() => {
        const updateNetworkStatus = (): void => setIsOnline(navigator.onLine)

        window.addEventListener('online', updateNetworkStatus)
        window.addEventListener('offline', updateNetworkStatus)
        updateNetworkStatus()

        return () => {
            window.removeEventListener('online', updateNetworkStatus)
            window.removeEventListener('offline', updateNetworkStatus)
        }
    }, [])

    return { isOnline }
}
