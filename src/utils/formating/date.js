export const dateFormate = (date) => {
    if (!date) return null
    const value = new Date(date)
    return value?.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })

}

export const timeFormate = (date) => {
    if (!date) return null
    const value = new Date(date)
    return value?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })
}


export const getNextMidnightISO = () => {
    const now = new Date()
    const nextMidnight = new Date(now)

    // Move to next day
    nextMidnight.setDate(now.getDate() + 1)
    nextMidnight.setHours(0, 0, 0, 0)

    return nextMidnight
}

export const dateOrTimeFormat = (date) => {
    if (!date) return null;

    const value = new Date(date);
    const now = new Date();

    // Check if same day
    const isToday =
        value.getDate() === now.getDate() &&
        value.getMonth() === now.getMonth() &&
        value.getFullYear() === now.getFullYear();

    if (isToday) {
        // Return time if today
        return value.toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
        });
    } else {
        // Return formatted date if not today
        return value.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        });
    }
};