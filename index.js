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
        const response = await fetch('https://timetable-lookup.p.rapidapi.com/TimeTable/BOS/LAX/20220906/?7Day=Y', options);
        return await response.text();
    } else {
        // Using the test data
        console.log("Using Test Data");
        return fs.readFileSync(path.join(__dirname, "result.xml"), 'utf8');
    }
}

getData();