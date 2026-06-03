import { useState, useEffect } from 'react'
import { formatDuration } from '../utils/format'

export function useLiveTimer(initialSeconds = 0) {
  const [seconds, setSeconds] = useState(initialSeconds)

  useEffect(() => {
    setSeconds(initialSeconds)
    const interval = setInterval(() => {
      setSeconds((prev) => prev + 1)
    }, 1000)
    return () => clearInterval(interval)
  }, [initialSeconds])

  return formatDuration(seconds)
}
