import { useState, useEffect, useMemo } from 'react';

export const useTime = (updateInterval = 60000) => {
    const [currentTime, setCurrentTime] = useState(() => new Date());

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), updateInterval);
        return () => clearInterval(timer);
    }, [updateInterval]);

    const formatters = useMemo(() => ({
        formatTime: (date: Date) => date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        }),
        formatDate: (date: Date) => date.toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric'
        })
    }), []);

    return {
        currentTime,
        formattedTime: formatters.formatTime(currentTime),
        formattedDate: formatters.formatDate(currentTime)
    };
};