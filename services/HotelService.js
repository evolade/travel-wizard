const fetch = require('node-fetch')

const fetchIt = async (host, url) => {
    const options = {
        method: 'GET',
        headers: {
            'X-RapidAPI-Key': process.env.API_KEY,
            'X-RapidAPI-Host': host
        }
    };
    const res = await fetch(url, options)
    return res.json()
}

const HotelService = {
    search: async (city) => {
        const searchRes = await fetchIt("hotels4.p.rapidapi.com", `https://hotels4.p.rapidapi.com/locations/v2/search?query=${city}&locale=en_US&currency=USD`)
        return searchRes.suggestions[0].entities[0].destinationId
    },

    rate: async (currency) => {
        const rateRes = await fetchIt("fixer-fixer-currency-v1.p.rapidapi.com", "https://fixer-fixer-currency-v1.p.rapidapi.com/latest?base=USD&symbols=" + currency)
        return rateRes.rates[currency]
    },

    country: async (city) => {
        const countryRes = await fetchIt("spott.p.rapidapi.com", `https://spott.p.rapidapi.com/places/autocomplete?limit=2&skip=0&q=${city}&type=CITY`)
        return countryRes[0].country.name
    },

    list: async (destinationId) => {
        //TODO! checkin out
        return await fetchIt("hotels4.p.rapidapi.com", `https://hotels4.p.rapidapi.com/properties/list?destinationId=${destinationId}&pageNumber=1&pageSize=4&checkIn=2022-08-13&checkOut=2022-08-20&adults1=1&sortOrder=BEST_SELLER&locale=en_US&currency=USD`)
    },

    images: async (id) => {
        return await fetchIt("hotels4.p.rapidapi.com", 'https://hotels4.p.rapidapi.com/properties/get-hotel-photos?id=' + id)
    },

    covid: async (country) => {
        return await fetchIt("covid-19-tracking.p.rapidapi.com", `https://covid-19-tracking.p.rapidapi.com/v1/${country}`)
    },

    population: async (country) => {
        return await fetchIt("world-population.p.rapidapi.com", `https://world-population.p.rapidapi.com/population?country_name=${country}`)
    }
}

module.exports = HotelService