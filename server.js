const express = require('express')
const cors = require("cors")
const app = express()
app.use(cors())
require("dotenv").config()

const HotelService = require("./services/HotelService")

app.get("/", (req, res) => {
    res.send("/ <br /> /search?city=Berlin & currency=EUR <br /> /other?id=123456&country=Germany <br /> /fake")
})

app.get("/search", async (req, res) => {
    const city = req.query.city
    const currency = req.query.currency

    let rate
    let list
    let country

    try {
        const destinationId = await HotelService.search(city)
        rate = await HotelService.rate(currency)
        list = await HotelService.list(destinationId)
        country = await HotelService.country(city)

    } catch (e) {
        res.send("USER ERROR: " + e)
        return
    }
    let result = {
        hotels: [],
    }

    for (let i = 0; i < list.length; i++) {
        const results = list[i]

        const imagesRes = await HotelService.images(results.id)

        result.hotels.push({
            id: results.id,
            name: results.name,
            star: results.starRating,
            price: `${results.ratePlan.price.exactCurrent * rate} ${currency}`,
            oldPrice: results.ratePlan.price.old * rate ?? results.ratePlan.price.exactCurrent * rate,
            address: results.address,
            image: imagesRes.hotelImages[0].baseUrl.slice(0, -10) + "g.jpg",
            country: country,
        })
    }
    if (result.hotels.length == 0) {
        res.send("USER ERROR")
        return
    }
    res.send(result)
})

app.get("/other", async (req, res) => {
    const id = req.query.id
    const country = req.query.country

    let imagesRes
    let covidRes
    let populationRes

    try {
        populationRes = await HotelService.population(country)
        covidRes = await HotelService.covid(country)
        imagesRes = await HotelService.images(id)

    } catch (e) {
        res.send("USER ERROR: " + e)
        return
    }

    result = {
        images: []
    }

    const deadliness = (parseInt(covidRes["Total Deaths_text"].replaceAll(",", "")) / parseInt(covidRes["Total Cases_text"].replaceAll(",", ""))) * 100
    let ratio

    try {
        ratio = parseInt(covidRes["Total Cases_text"].replaceAll(",", "")) / parseInt(populationRes.body.population)

    } catch (e) {
        res.send("COUNTRY NOT FOUND: " + e)
        return
    }

    result.covid = {
        cases: covidRes["Total Cases_text"],
        deaths: covidRes["Total Deaths_text"],
        recovered: covidRes["Total Recovered_text"],
        ratio: (deadliness + ratio) / 2
    }
    //const len = imagesResj.hotelImages.length
    const len = 5

    try {
        for (let i = 0; i < len; i++) {
            result.images.push(imagesRes.hotelImages[i].baseUrl.slice(0, -10) + "g.jpg")
        }

    } catch (e) {
        res.send("USER ERROR: " + e)
        return
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

app.get("/otherfake", (req, res) => {
    const result = {

        covid: {
            cases: 1234,
            deaths: 12,
            recovered: 123,
            ratio: 0.8,

        },

        images: [
            "https://exp.cdn-hotels.com/hotels/37000000/36790000/36789900/36789845/d4aada11_l.jpg",
            "https://exp.cdn-hotels.com/hotels/37000000/36790000/36789900/36789845/a6dcbfc2_l.jpg",
            "https://exp.cdn-hotels.com/hotels/37000000/36790000/36789900/36789845/29d90922_l.jpg",
            "https://exp.cdn-hotels.com/hotels/37000000/36790000/36789900/36789845/895ded4a_l.jpg",
            "https://exp.cdn-hotels.com/hotels/37000000/36790000/36789900/36789845/d4b10c49_l.jpg"
        ],


    }
    res.send(result)
})

app.listen(8080, () => console.log("http://localhost:8080"))

module.exports = app; // vercel