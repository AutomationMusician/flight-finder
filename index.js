require('dotenv').config();
const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');
const express = require('express');

const RAPID_API_KEY = process.env["RAPID_API_KEY"];
const RAPID_API_HOST = process.env["RAPID_API_HOST"];
const USE_API = (process.env["USE_API"] == "true");
const PORT = process.env.PORT || "3000";
const API_CACHE_FILEPATH=path.join(__dirname, "data", "api-cache.json"); // assume this file already exists

const app = express();
app.listen(PORT, () => console.log('listening on port ' + PORT));
app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded( { extended: true } ));

async function getData(from, to, date) {
    const queryParams = `from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}&date=${encodeURIComponent(date)}&adult=1&type=economy&currency=USD`;
    if (USE_API) {
        // Using this API: https://rapidapi.com/flightlookup/api/timetable-lookup/
        // for running against the API (will count against the request quota)

        const options = {
            method: 'GET',
            headers: {
                'X-RapidAPI-Key': RAPID_API_KEY,
                'X-RapidAPI-Host': RAPID_API_HOST
            }
        };

        // TODO: add some error handling logic in case of 400 of 500 http code
        const response = await fetch(`https://flight-fare-search.p.rapidapi.com/v2/flight/?${queryParams}`, options);
        console.log(response);
        const responseJson = await response.json();
        console.log(responseJson);
        
        // Store this response in the cache for later so that I have more data to test with
        // might not be thread safe, but it works for the single user use-case
        const jsonFile = fs.readFileSync(API_CACHE_FILEPATH, 'utf8');
        const jsonObj = JSON.parse(jsonFile);
        jsonObj[queryParams] = responseJson;
        fs.writeFileSync(API_CACHE_FILEPATH, JSON.stringify(jsonObj, null, 2));

        return responseJson;

    } else {
        // Using the test data to reduce API usage (so that I don't go over the quota)
        console.log("Using Cache Data");
        const jsonFile = fs.readFileSync(API_CACHE_FILEPATH, 'utf8');
        const jsonObj = JSON.parse(jsonFile);
        return jsonObj[queryParams];
    }
}

// Get answers from database
app.get('/api/get-flights/:from/:to/:date/', async (request, response) => {
    const from = request.params.from;
    const to = request.params.to;
    const date = request.params.date;
    const data = await getData(from, to, date);
    response.json(data);
  });

// getData()
    // .then(data => console.log(data));