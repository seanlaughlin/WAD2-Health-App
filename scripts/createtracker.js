const form = document.getElementById('create-tracker-form');

form.addEventListener('submit', async function (e) {
    e.preventDefault();

    const data = {
        metric: form.elements['metric'].value,
        units: form.elements['units'].value,
        category: form.elements['category'].value,
        trackerType: form.elements['trackerType'].value,
    }
    console.log(data)

    // Send an AJAX POST request to the server to submit the data
    const xhr = new XMLHttpRequest();
    xhr.open('POST', '/user/tracker/create');
    xhr.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
    xhr.onload = function () {
        if (xhr.status === 200) {
            // Reload the page to update the chart with the new data
            location.reload();
        } else {
            console.log('Error:', xhr.responseText);
        }
    };
    xhr.send(JSON.stringify(data));
});