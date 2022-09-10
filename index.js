require('dotenv').config();
const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');

const RAPID_API_KEY = process.env["RAPID_API_KEY"];
const RAPID_API_HOST = process.env["RAPID_API_HOST"];
const USE_API = (process.env["USE_API"] == "true");

const options = {
	method: 'GET',
	headers: {
		'X-RapidAPI-Key': RAPID_API_KEY,
		'X-RapidAPI-Host': RAPID_API_HOST
	}
};

if (USE_API) {
    console.log("Using API Mode");
    // Using this API: https://rapidapi.com/flightlookup/api/timetable-lookup/
    // for running against the API (will count against the request quota)
    fetch('https://timetable-lookup.p.rapidapi.com/TimeTable/BOS/LAX/20220906/?7Day=Y', options)
        .then(response => response.text())
        .then(response => console.log(response))
        .catch(err => console.error(err));
} else {
    // Using the test data
    console.log("Using Test Data");
    const xml = fs.readFileSync(path.join(__dirname, "result.xml"), 'utf8');
    console.log(xml);
}
