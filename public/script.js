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
                <p>Result</p>
            </div>
        </div>
    `;
    document.getElementById("response-list").appendChild(div);


}

async function getExampleResult() {
    const resultFetch = await fetch(`/result.json`);
    return await resultFetch.json();
}

getExampleResult().then((result) => addResult(result));