function getFlights() {
    const form = document.getElementById("form");
    const formData = new FormData(form);

    const from = formData.get("from");
    const to = formData.get("to");
    const date = formData.get("date");
    fetch(`/api/get-flights/${encodeURIComponent(from)}/${encodeURIComponent(to)}/${encodeURIComponent(date)}/`);
}