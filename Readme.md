# Flight Finder
A GUI to inquire about real-time flight costs

## Getting started
1. Install node and npm if not already installed
1. Create a `.env` file with the following variables set
    1. `USE_API`: set to `true` unless you want to use an json file as a cache
    1. `PORT`: port to host the application on
    1. `RAPID_API_HOST`: The API host for the flight fare search. Should be `flight-fare-search.p.rapidapi.com` in most cases.
    1. `RAPID_API_KEY`: The API key for the flight fare search API.
1. Run `npm install` to download all node modules
1. Run `npm start` to start the server

## How to Regenerate the Airport Code List
- can be found here: https://www.transportation.gov/sites/dot.gov/files/docs/airports_codes.txt
- paste into excel
- Use this converter to turn in into json: https://products.aspose.app/cells/conversion/excel-to-json#:~:text=How%20to%20convert%20EXCEL%20to,a%20download%20link%20to%20email.

