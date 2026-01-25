import icons from './icons'
import images from './images'

const onBoardingData = [
    {
        title: "Eat Any where. At your location",
        description: "Select location and see near by restaurants for eating thali.",
        image: images.onboard1,
    },
    {
        title: "See Monthly plans and Genuine reviews.",
        description: "Purchase any restaurant monthly plans by see reviews and plans.",
        image: images.onboard2,
    },
    {
        title: "Refer And get 20% OFF in Monthly Plans",
        description: "Refer and invite your friend and eating both Apna Thali.",
        image: images.onboard3,
    }
]


const filter = [
    {
        id: 0,
        name: "Tiffin Center",
        value: "tiffin",
        pName: "Type",
    },
    {
        id: 1,
        name: "Pure Veg",
        value: "veg",
        pName: "Veg/Non-Veg",
    },
    {
        id: 2,
        name: "Non-Veg",
        value: "non-veg",
        pName: "Veg/Non-Veg",
    },
]

const slider = [
    {
        id: 1,
        image: images?.Banner
    },
    {
        id: 2,
        image: images?.Banner
    },
]

const planList = [
    {
        id: 1,
        name: "7 Days | 7 Thali",
        price: "350"
    },
    {
        id: 2,
        name: "7 Days | 14 Thali",
        price: "700"
    },
    {
        id: 3,
        name: "14 Days | 14 Thali",
        price: "700"
    },
    {
        id: 4,
        name: "14 Days | 30 Thali",
        price: "1500"
    },
    {
        id: 5,
        name: "30 Days | 30 Thali",
        price: "1500"
    },


]

const planBenefits = [
    "20 Restaurants Unlock",
    "50 Points Redeem",
    "Instant Thali Taken",
    "Scan & Eat",
    "Thali’s variety"
]

const faqs = [
    {
        id: 1,
        question: "What is Apna Thali?",
        answer: "Apna Thali is a monthly plan for eating thali in any restaurant. You can purchase any plan and eat thali in any restaurant."
    },
    {
        id: 2,
        question: "How to purchase plan?",
        answer: "You can purchase plan by selecting plan and click on buy button. You can pay by online payment or cash on delivery."
    },
    {
        id: 3,
        question: "How to use plan?",
        answer: "You can use plan by scanning QR code in restaurant. After scanning you can eat thali in restaurant."
    },
    {
        id: 4,
        question: "How to refer friend?",
        answer: "You can refer friend by sharing your referral code. When your friend purchase plan by your referral code you will get 20% off in your next plan."
    }
]


const filterData = [
    {
        id: 1,
        name: "Veg/Non-Veg"
    },
    {
        id: 2,
        name: "Ratings"
    },
    {
        id: 3,
        name: "Type"
    }
]


const filterBy = [
    {
        id: 1,
        pName: "Veg/Non-Veg",
        name: "Pure Veg",
        value: "veg"
    },
    {
        id: 2,
        pName: "Veg/Non-Veg",
        name: "Non Veg",
        value: "non-veg"
    },
    {
        id: 3,
        pName: "Ratings",
        name: "Rating 1.0",
        value: 1
    },
    {
        id: 4,
        pName: "Ratings",
        name: 'Rating 2.0',
        value: 2
    },
    {
        id: 5,
        pName: "Ratings",
        name: 'Rating 3.0',
        value: 3
    },
    {
        id: 6,
        pName: "Ratings",
        name: 'Rating 4.0',
        value: 4
    },
    {
        id: 7,
        pName: "Ratings",
        name: 'Rating 4.5',
        value: 4.5
    },
    {
        id: 8,
        pName: "Ratings",
        name: 'Rating 5.0',
        value: 5
    },
    {
        id: 9,
        pName: "Type",
        name: "Restaurant",
        value: "restaurant"
    },
    {
        id: 10,
        pName: "Type",
        name: "Tiffin Center",
        value: "tiffin"
    },
    {
        id: 10,
        pName: "Type",
        name: "Both",
        value: "both"
    },
]



const sortData = [
    {
        id: 0,
        name: "Rating: Low To High",
        value: "RATING_LOW_TO_HIGH"
    },
    {
        id: 1,
        name: "Rating: High To Low",
        value: "RATING_HIGH_TO_LOW"
    },
    {
        id: 2,
        name: "Cost: Low To High",
        value: "COST_LOW_TO_HIGH"
    },
    {
        id: 3,
        name: "Cost: High To Low",
        value: "COST_HIGH_TO_LOW"
    },
    {
        id: 4,
        name: "Distance: Low To High",
        value: "DISTANCE_LOW_TO_HIGH"
    },
    {
        id: 5,
        name: "Distance: High To Low",
        value: "DISTANCE_HIGH_TO_LOW"
    },
    {
        id: 6,
        name: "Popularity: Low To High",
        value: "POPULARITY_LOW_TO_HIGH"
    },
    {
        id: 7,
        name: "Popularity: High To Low",
        value: "POPULARITY_HIGH_TO_LOW"
    },
    {
        id: 8,
        name: "Tiffin Center",
        value: "TIFFIN_CENTER"
    }
]

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
    {
        id: 5,
        name: 'Special Meal',
        icon: images.thali3
    },
]


const thaliPlan = [
    {
        id: 1,
        name: 'Regular Thali',
        icon: images.planThali1
    },
    {
        id: 2,
        name: 'Delux Thali',
        icon: images.planThali2
    },
    {
        id: 3,
        name: 'Special Thali',
        icon: images.planThali1
    },
    {
        id: 4,
        name: 'Special Meal',
        icon: images.thali3
    },
    {
        id: 5,
        name: 'Special Meal',
        icon: images.thali3
    },
]


const reloadVector = [
    images.noAttendanceFound,
    images.noNotification,
    images.noPlanFound,
    images.noRestro,
    icons.noLocation,
    icons.noSearchFound,
    images.login,
]

export default {
    onBoardingData,
    slider,
    filter,
    planList,
    planBenefits,
    faqs,
    filterData,
    filterBy,
    sortData,
    reloadVector,
    serveThali,
    thaliPlan
}