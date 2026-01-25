import icons from "./icons"
import images from "./images"

export const ASYNC_DATA = {
    USER_ACTIVITY: '@USER_ACTIVITY',
    USER_LANGUAGE: '@USER_LANGUAGE',
    USER_THEME: '@USER_THEME',
    USER_SEARCH_HISTORY: '@USER_SEARCH_HISTORY',
    USER_COUNTRY: '@USER_COUNTRY',
    FCM_TOKEN: '@FCM_TOKEN'
}

const serveThali = [
    {
        id: 1,
        name: 'Regular Thali',
        icon: images.thali2
    },
    {
        id: 2,
        name: 'Delux Thali',
        icon: images.thali3
    },
    {
        id: 3,
        name: 'Special Thali',
        icon: images.thali2
    },
    {
        id: 4,
        name: 'Special Meal',
        icon: images.thali3
    },
]

export default {
    serveThali
}