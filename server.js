const express = require('express')
const fetch = require('node-fetch')
const cors = require("cors")
const app = express()
app.use(cors())
require("dotenv").config()


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

app.get("/search", async (req, res) => {
    const city = req.query.city
    const currency = req.query.currency


    const searchRes = await fetchIt("hotels4.p.rapidapi.com", `https://hotels4.p.rapidapi.com/locations/v2/search?query=${city}&locale=en_US&currency=USD`)
    const destinationId = searchRes.suggestions[0].entities[0].destinationId


    const listRes = await fetchIt("hotels4.p.rapidapi.com", `https://hotels4.p.rapidapi.com/properties/list?destinationId=${destinationId}&pageNumber=1&pageSize=1&checkIn=2022-08-10&checkOut=2022-08-20&adults1=1&sortOrder=BEST_SELLER&locale=en_US&currency=USD`)

    let result = {
        hotels: [],

    }

    //const currencyResj = await fetchIt("fixer-fixer-currency-v1.p.rapidapi.com", `https://fixer-fixer-currency-v1.p.rapidapi.com/convert?from=USD&to=${currency}&amount=${now.ratePlan.price.exactCurrent}`)
    const rateRes = await fetchIt("fixer-fixer-currency-v1.p.rapidapi.com", "https://fixer-fixer-currency-v1.p.rapidapi.com/latest?base=USD&symbols=" + currency)
    const rate = rateRes.rates[currency]

    const countryRes = await fetchIt("spott.p.rapidapi.com", `https://spott.p.rapidapi.com/places/autocomplete?limit=2&skip=0&q=${city}&type=CITY`)
    const country = countryRes[0].country.name



    result.header = listRes.data.body.header



    for (let i = 0; i < listRes.data.body.searchResults.results.length; i++) {

        const results = listRes.data.body.searchResults.results[i] // hotel 


        const imagesRes = await fetchIt("hotels4.p.rapidapi.com", 'https://hotels4.p.rapidapi.com/properties/get-hotel-photos?id=' + results.id)

        result.hotels.push({
            id: results.id,
            name: results.name,
            star: results.starRating,
            price: `${results.ratePlan.price.exactCurrent * rate} ${currency}`,
            priceChanged: `${(results.ratePlan.price.old * rate) - (results.ratePlan.price.exactCurrent * rate)} ` ?? "null",
            coors: results.coordinate,
            address: results.address,
            image: imagesRes.hotelImages[0].baseUrl.slice(0, -10) + "l.jpg",
            country: country,
        })

    }
    res.send(result)



})




app.get("/other", async (req, res) => {
    const id = req.query.id
    const country = req.query.country

    const imagesUrl = 'https://hotels4.p.rapidapi.com/properties/get-hotel-photos?id=' + id;

    const imagesOptions = {
        method: 'GET',
        headers: {
            'X-RapidAPI-Key': process.env.API_KEY,
            'X-RapidAPI-Host': 'hotels4.p.rapidapi.com'
        }
    };


    const imagesRes = await fetch(imagesUrl, imagesOptions)
    const imagesResj = await imagesRes.json()

    const covidRes = await fetchIt("covid-19-tracking.p.rapidapi.com", `https://covid-19-tracking.p.rapidapi.com/v1/${country}`)

    const populationRes = await fetchIt("world-population.p.rapidapi.com", `https://world-population.p.rapidapi.com/population?country_name=${country}`)

    result = {
        images: []
    }

    const deadliness = (parseInt(covidRes["Total Deaths_text"].replaceAll(",", "")) / parseInt(covidRes["Total Cases_text"].replaceAll(",", ""))) * 100
    const rate = parseInt(covidRes["Total Cases_text"].replaceAll(",", "")) / parseInt(populationRes.body.population)
    console.log(deadliness)
    console.log(rate)

    result.covid = {
        cases: covidRes["Total Cases_text"],
        deaths: covidRes["Total Deaths_text"],
        recovered: covidRes["Total Recovered_text"],
        rate: (deadliness + rate) / 2
    }
    //const len = imagesResj.hotelImages.length
    const len = 5

    for (let i = 0; i < len; i++) {
        result.images.push(imagesResj.hotelImages[i].baseUrl.slice(0, -10) + "l.jpg")

    }
    res.send(result)
})

app.get("/fake", (req, res) => {
    const result = {
        header: "Miami USA",
        hotels: [
            {
                id: 12345,
                name: "Miami Hotel 1",
                star: 4.5,
                price: 150,
                oldPrice: 165,
                coors: "lat long",
                address: "adress {}",
                image: "www.hotel/42.com",
                country: "Germany"
            },
            {
                id: 12345,
                name: "Miami Hotel 2",
                star: 4.5,
                price: 150,
                oldPrice: 165,
                coors: "lat long",
                address: "adress {}",
                image: "www.hotel/42.com",
                country: "Germany"
            },
            {
                id: 12345,
                name: "Miami Hotel 3",
                star: 4.5,
                price: 150,
                oldPrice: 165,
                coors: "lat long",
                address: "adress {}",
                image: "www.hotel/42.com",
                country: "Germany"
            },
        ]
    }
    res.send(result)
})



app.listen(8080, () => console.log("localhost:8080"))





module.exports = app;