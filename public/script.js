
const responseListElement = document.getElementById("response-list");

function escapeHtml(unsafe) {
    return unsafe.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#039;');
}

async function getFlights() {
    const form = document.getElementById("form");
    const formData = new FormData(form);

    const from = formData.get("from");
    const to = formData.get("to");
    const date = formData.get("date");
    responseListElement.innerHTML = "";
    const response = await fetch(`/api/get-flights/${encodeURIComponent(from)}/${encodeURIComponent(to)}/${encodeURIComponent(date)}/`);
    if (response.ok) {
        const responseJson = await response.json();
        responseJson.results.forEach((result) => {
            addResult(result);
        });
    }
    else {
        addErrorMessage(`${response.status} ${response.statusText}`);
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
                            ${addAirportCell(result.departureAirport)}
                            <td><img src="https://cdn.iconscout.com/icon/free/png-256/aeroplane-airplane-plane-air-transportation-vehicle-pessanger-people-emoj-symbol-30708.png" style="width:20px;height:20px;"></td>
                            ${addAirportCell(result.arrivalAirport)}
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    `;
    responseListElement.appendChild(div);
}

function addAirportCell(airport) {
    const date = new Date(airport.time);
    const dateStr = date.toLocaleString('en-us', {dateStyle: "long", timeStyle: "short"});
    return `
        <td class="airport">
            <p>${escapeHtml(airport.code)}</p>   
            <p>${dateStr}</p>   
        </td>
    `;
}

function addErrorMessage(message) {
    const div = document.createElement("div");
    div.className = "bubble-container";
    div.innerHTML = `
        <div class="bubble error">
            <div class="item">
                <p>Error retrieving data. Message from server '${escapeHtml(message)}'</p>
            </div>
        </div>
    `;
    responseListElement.appendChild(div);
}
