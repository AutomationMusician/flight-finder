
const responseListElement = document.getElementById("response-list");


function escapeHtml(unsafe) {
    return String(unsafe).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#039;');
}

async function getFlights() {
    // get data from the form
    const form = document.getElementById("form");
    const formData = new FormData(form);

    const from = formData.get("from").toUpperCase();
    const to = formData.get("to").toUpperCase();
    const date = formData.get("date");
    responseListElement.innerHTML = "";

    // validate airport code
    const airportResponse = await fetch(`/airports.json`);
    const airports = await airportResponse.json();
    if (!validateAirportCode(airports, from) || !validateAirportCode(airports, to)) {
        return;
    }

    // validate that airport codes are not the same
    if (to === from) {
        addErrorMessage("The airports cannot be the same");
        return;
    }

    // validate date
    // new Date() isn't working with "-" in the date, so I'll convert them to "/"
    const filteredDate = date.split("-");
    if (filteredDate[0].length !== 4) {
        addErrorMessage("The year must be a 4 digit string");
        return;
    }
    if (filteredDate[1].length !== 2) {
        addErrorMessage("The month must be a 2 digit string");
        return;
    }
    if (filteredDate[2].length !== 2) {
        addErrorMessage("The day must be a 2 digit string");
        return;
    }
    const requestedDate = new Date(filteredDate.join("/"));

    // compare aginst todays date
    const todaysDate = new Date();
    todaysDate.setHours(0, 0, 0, 0);
    if (requestedDate < todaysDate) {
        addErrorMessage("The date cannot be in the past");
        return;
    }

    // make query
    const response = await fetch(`/api/get-flights/${encodeURIComponent(from)}/${encodeURIComponent(to)}/${encodeURIComponent(date)}/`);
    if (response.ok) {
        const responseJson = await response.json();
        responseJson.results.forEach((result) => {
            addResult(result);
        });
    }
    else {
        addErrorMessage(`Error retrieving data. Message from server '${escapeHtml(response.status)} ${escapeHtml(response.statusText)}'`);
    }
}

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

function generateAirportCellHtml(airport) {
    const date = new Date(airport.time);
    const dateStr = date.toLocaleString('en-us', {dateStyle: "long", timeStyle: "short"});
    return `
        <td class="airport">
            <p>${escapeHtml(airport.code)}</p>   
            <p>${dateStr}</p>   
        </td>
    `;
}

function generateDownloadButtonHtml(result) {
    const anchor = document.createElement("a");
    anchor.setAttribute('href', 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(result, null, 2)));
    anchor.setAttribute('download', "flight-info.json");
    anchor.innerHTML = `<img src="/images/download.png">`;
    return `<td class="download-icon">${anchor.outerHTML}</td>`;
}

function addErrorMessage(message) {
    const div = document.createElement("div");
    div.className = "bubble-container";
    div.innerHTML = `
        <div class="bubble error">
            <div class="item">
                <p>${message}</p>
            </div>
        </div>
    `;
    responseListElement.appendChild(div);
}

function validateAirportCode(airports, code) {
    const airport = airports.find((airport) => airport["AirportCode"] === code);
    if (!airport) {
        addErrorMessage(`'${code}' is not a valid airport code`);
    }
    return airport;
}