/**
 * Author: Joshua Fishman
 * License: ISC
 * Pennsylvania State University Great Valley
 * SWENG 861
 * 
 * This file contains all of the server-side logic for the application 
 * including handling requests from the client and making queries to 
 * the external API.
 */

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

/**
 * React to a get-flights query from the client
 * @param {any} request express request for a get-flights request
 * @param {any} response express response for a get-flights request
 */
function getFlights(request, response) {
    const from = request.params.from;
    const to = request.params.to;
    const date = request.params.date;

    const queryParams = `from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}&date=${encodeURIComponent(date)}&adult=1&type=economy&currency=USD`;
    if (USE_API) {
        // Using this API: https://rapidapi.com/flightlookup/api/timetable-lookup/
        // for running against the API (will count against the request quota)
        queryAPI(queryParams, response);
    } else {
        // Using the test data to reduce API usage (so that I don't go over the quota)
        queryCache(queryParams, response);
    }
}

/**
 * Query the API using the queryParams and respond to the user using the response object
 * @param {string} queryParams url parameters to use for the API GET request
 * @param {*} response express response object for the request from the client
 */
async function queryAPI(queryParams, response) {
    const options = {
        method: 'GET',
        headers: {
            'X-RapidAPI-Key': RAPID_API_KEY,
            'X-RapidAPI-Host': RAPID_API_HOST
        }
    };

    const api_response = await fetch(`https://flight-fare-search.p.rapidapi.com/v2/flight/?${queryParams}`, options);
    if (api_response.ok) {
        const responseJson = await api_response.json();
        response.json(responseJson);

        // Store this response in the cache for later so that I have more data to test with
        // might not be thread safe, but it works for the single user use-case
        const jsonFile = fs.readFileSync(API_CACHE_FILEPATH, 'utf8');
        const jsonObj = JSON.parse(jsonFile);
        jsonObj[queryParams] = responseJson;
        fs.writeFileSync(API_CACHE_FILEPATH, JSON.stringify(jsonObj, null, 2));
    }
    else {
        let statusText;
        try {
            const responseJson = await api_response.json();
            console.error(`Error JSON: ${JSON.stringify(responseJson, null, 2)}`)
            statusText = responseJson.error;
        }
        catch (e) {
            statusText = api_response.statusText;
        }
        console.error(`Error using the API. ${api_response.status} ${statusText}`);
        response.status(api_response.status).json({status: api_response.status, statusText: statusText});
        
    }
}

/**
 * Query the cache using the queryParams and respond to the user using the response object
 * @param {string} queryParams url parameters to use for the API GET request
 * @param {*} response express response object for the request from the client
 */
function queryCache(queryParams, response) {
    console.log("Using Cache Data");
    const jsonFile = fs.readFileSync(API_CACHE_FILEPATH, 'utf8');
    const jsonObj = JSON.parse(jsonFile);
    if (jsonObj[queryParams]) {
        response.json(jsonObj[queryParams]);
    }
    else {
        response.status(500).json({status: 500, statusText: "Data not available"});
    }
}

// attach getFlights method to the endpoint
app.get('/api/get-flights/:from/:to/:date/', getFlights);
