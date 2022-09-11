require('dotenv').config();
const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');
const express = require('express');

const RAPID_API_KEY = process.env["RAPID_API_KEY"];
const RAPID_API_HOST = process.env["RAPID_API_HOST"];
const USE_API = (process.env["USE_API"] == "true");
const PORT = process.env.PORT || "3000";

const app = express();
app.listen(PORT, () => console.log('listening on port ' + PORT));
app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded( { extended: true } ));

async function getData() {
    const queryParams = "from=LHR&to=DXB&date=2022-09-11&adult=1&type=economy&currency=USD" 
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
        const response = await fetch(`https://flight-fare-search.p.rapidapi.com/v2/flight/?${queryParams}`, options);
        return await response.json();
    } else {
        // Using the test data
        console.log("Using Test Data");
        const jsonFile = fs.readFileSync(path.join(__dirname, "test", "mock-results.json"), 'utf8');
        const jsonObj = JSON.parse(jsonFile);
        return jsonObj[queryParams];
    }
}

// Get answers from database
app.get('/api/get-flights/:from/:to/:date/', async (request, response) => {
    const from = request.params.from;
    const to = request.params.to;
    const date = request.params.date;
    const data = await getData()
    response.json(data);
  });

// getData()
    // .then(data => console.log(data));