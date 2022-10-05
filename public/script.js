/**
 * Author: Joshua Fishman
 * License: ISC
 * Pennsylvania State University Great Valley
 * SWENG 861
 * 
 * This file contains all of the client-side logic for this project and is used by index.html
 */

const responseListElement = document.getElementById("response-list");

/**
 * Validate input, query server, and populate output date on submitting the form
 */
async function onSubmit() {
    // get data from the form
    const form = document.getElementById("form");
    const formData = new FormData(form);

    const from = formData.get("from").toUpperCase();
    const to = formData.get("to").toUpperCase();
    const date = formData.get("date");

    // clear out the response list element
    responseListElement.innerHTML = "";

    // validate airport code
    const airportCodesAreValid = await validateAirportCodes(from, to);
    if (!airportCodesAreValid) return;

    // validate date
    const dateIsValid = validateDate(date);
    if (!dateIsValid) return;

    // make query
    await getFlights(from, to, date);
}

/**
 * Validate the arrival and departure airport codes
 * @param {string} from departrue airport code
 * @param {string} to arrival airport code
 * @returns {boolean} true if valid, false if invalid
 */
async function validateAirportCodes(from, to) {
    const airportResponse = await fetch(`/airports.json`);
    const airports = await airportResponse.json();
    // check that the airport codes are valid
    if (!validateAirportCode(airports, from) || !validateAirportCode(airports, to)) {
        return false;
    }

    // check that the airport codes aren't the same
    if (to === from) {
        addErrorMessage("Invalid Input: The airports cannot be the same");
        return false;
    }
    return true;
}

/**
 * Validate that an airport code is a valid. If it is, return the airport associated with the code.
 * @param {any[]} airports an array of airport objects to validate against
 * @param {string} code the airport code to validate
 * @returns {any | null} the airport that uses the given airport code or null if it doesn't exist
 */
function validateAirportCode(airports, code) {
    const airport = airports.find((airport) => airport["AirportCode"] === code);
    if (!airport) {
        addErrorMessage(`Invalid Input: '${code}' is not a valid airport code`);
        return null;
    }
    return airport;
}

/**
 * Validate the depature date of the flight
 * @param {string} date a string representation of the departure date
 * @returns {boolean} true if valid, false if invalid
 */
function validateDate(date) {
    /*
     * new Date() isn't working with "-" in the date, so we will attempt to
     * 1. split the string into [YYYY, MM, DD]
     * 2. validate the lengths of the elements (the HTML date input allows years with 5 digits. We need to catch that.)
     * 3. convert the date to YYYY/MM/DD and save it as a Date object
     */ 
    const filteredDate = date.split("-");
    if (filteredDate[0].length !== 4) {
        addErrorMessage("Invalid Input: The year must be a 4 digit string");
        return false;
    }
    if (filteredDate[1].length !== 2) {
        addErrorMessage("Invalid Input: The month must be a 2 digit string");
        return false;
    }
    if (filteredDate[2].length !== 2) {
        addErrorMessage("Invalid Input: The day must be a 2 digit string");
        return false;
    }
    const requestedDate = new Date(filteredDate.join("/"));

    // compare aginst todays date
    const todaysDate = new Date(); // gets the current datetime
    todaysDate.setHours(0, 0, 0, 0); // make todaysDate midnight of the current day
    if (requestedDate < todaysDate) {
        addErrorMessage("Invalid Input: The date cannot be in the past");
        return false;
    }
    return true;
}

/**
 * Query the server for flight information and show the output in the GUI
 * @param {string} from sanitized departure airport code
 * @param {string} to sanitized arrival airport code
 * @param {string} date sanitized date
 */
async function getFlights(from, to, date) {
    const response = await fetch(`/api/get-flights/${encodeURIComponent(from)}/${encodeURIComponent(to)}/${encodeURIComponent(date)}/`);
    if (response.ok) {
        const responseJson = await response.json();
        responseJson.results.forEach((result) => {
            addResult(result);
        });
    }
    else {
        let statusText;
        try {
            const responseJson = await response.json();
            statusText = responseJson.statusText;
        }
        catch (e) {
            statusText = response.statusText;
        }
        addErrorMessage(`Error retrieving data. Message from server '${response.status} ${statusText}'`);
    }
}

/**
 * Add a query result to the GUI
 * @param {any} result a result object from the API to be displayed
 */
function addResult(result) {
    const div = document.createElement("div");
    div.className = "bubble-container";
    div.innerHTML = `
        <div class="bubble">
            <div class="item">
                <table>
                    <tbody>
                        <tr>
                            <td class="airline">${escapeHtml(result.flight_name)}</td>
                            <td class="price">\$${escapeHtml(result.totals.total.toFixed(2))}</td>
                            ${generateAirportCellHtml(result.departureAirport)}
                            <td class="flight-icon"><img src="/images/logo.png"></td>
                            ${generateAirportCellHtml(result.arrivalAirport)}
                            ${generateDownloadButtonHtml(result)}
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    `;
    responseListElement.appendChild(div);
}

/**
 * Generate the html for a cell explaining the airport code and departure/arrival time
 * @param {any} airport an airport object from the API
 * @returns {string} a string representation of the html for an airport cell
 */
function generateAirportCellHtml(airport) {
    const date = new Date(airport.time);
    const dateStr = date.toLocaleString('en-us', {dateStyle: "long", timeStyle: "short"});
    return `
        <td class="airport">
            <p>${escapeHtml(airport.code)}</p>   
            <p>${escapeHtml(dateStr)}</p>   
        </td>
    `;
}

/**
 * Generate the html for a button that will download the json of a result when clicked
 * @param {any} result a result json object from the API to be downloaded
 * @returns {string} a string represenation of the html for a download button
 */
function generateDownloadButtonHtml(result) {
    const anchor = document.createElement("a");
    anchor.setAttribute('href', 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(result, null, 2)));
    anchor.setAttribute('download', "flight-info.json");
    anchor.innerHTML = `<img src="/images/download.png">`;
    return `<td class="download-icon">${anchor.outerHTML}</td>`;
}

/**
 * Add an error message to the DOM
 * @param {string} message message to show on the DOM
 */
function addErrorMessage(message) {
    const div = document.createElement("div");
    div.className = "bubble-container";
    div.innerHTML = `
        <div class="bubble error">
            <div class="item">
                <p>${escapeHtml(message)}</p>
            </div>
        </div>
    `;
    responseListElement.appendChild(div);
}

/**
 * Sanitize an input string so that it we can safely be put a string into HTML
 * without creating a XSS vulnerability. 
 * src: https://gomakethings.com/preventing-cross-site-scripting-attacks-when-using-innerhtml-in-vanilla-javascript/
 * @param {string} unsafe a string to sanitize
 * @returns {string} a sanitized string
 */
 function escapeHtml(unsafe) {
	const temp = document.createElement('div');
	temp.textContent = unsafe;
	return temp.innerHTML;
}