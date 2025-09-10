import { useState, useEffect } from 'react';

export function useTime(updateInterval = 60000) {
    const [currentTime, setCurrentTime] = useState(() => new Date());

    useEffect(function updateTimer() {
        const timer = setInterval(function tick() {
            setCurrentTime(new Date());
        }, updateInterval);

        return function cleanup() {
            clearInterval(timer);
        };
    }, [updateInterval]);

    function formatTime(date: Date) {
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        });
    }

    function formatDate(date: Date) {
        return date.toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric'
        });
    }

    return {
        currentTime,
        formattedTime: formatTime(currentTime),
        formattedDate: formatDate(currentTime)
    };
}
