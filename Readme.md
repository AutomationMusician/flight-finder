# Flight Finder
A GUI to inquire about real-time flight costs

## Getting started
1. Install node and npm if not already installed on your computer
    - this application is known to work with npm 8.1.2 and node v16.13.2, but other versions will likely work too
1. Create a `.env` file with the following variables set
    - `USE_API`: 
        - Set to `true` to retrieve realtime flight data
        - Set to `false` if you want to use the `data/api-cache.json` to mock the results of the API for a given 
    - `PORT`: port to host the application on
    - `RAPID_API_HOST`: The API host for the flight fare search. Should be `flight-fare-search.p.rapidapi.com` in most cases.
    - `RAPID_API_KEY`: The API key for the flight fare search API.
1. Run `npm install` to download all node modules
1. Run `npm start` to start the server
1. Go to the URL `localhost:<PORT>` (where `<PORT>` is the value of `PORT` defined in `.env`) to view the application when running it locally 

## How to Regenerate the Airport Code List
- can be found here: https://www.transportation.gov/sites/dot.gov/files/docs/airports_codes.txt
- paste into excel
- Use this converter to turn in into json: https://products.aspose.app/cells/conversion/excel-to-json#:~:text=How%20to%20convert%20EXCEL%20to,a%20download%20link%20to%20email.

