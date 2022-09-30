
const responseListElement = document.getElementById("response-list");

function escapeHtml(unsafe) {
    return unsafe.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#039;');
}

function getFlights() {
    const form = document.getElementById("form");
    const formData = new FormData(form);

    const from = formData.get("from");
    const to = formData.get("to");
    const date = formData.get("date");
    fetch(`/api/get-flights/${encodeURIComponent(from)}/${encodeURIComponent(to)}/${encodeURIComponent(date)}/`);
}

async function addResult(result) {
    const div = document.createElement("div");
    div.className = "bubble-container";
    div.innerHTML =`
        <div class="bubble">
            <div class="item">
                <table>
                    <tbody>
                        <tr>
                            <td>\$${result.totals.total.toFixed(2)}</td>
                            <td>${escapeHtml(result.departureAirport.code)}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    `;
    responseListElement.appendChild(div);
}

async function getExampleResponse() {
    const response = await fetch(`/result.json`);
    return await response.json();
}

getExampleResponse().then((response) => {
    response.results.forEach((result) => {
        addResult(result);
    });
});