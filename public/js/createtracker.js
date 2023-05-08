const form = document.getElementById('create-tracker-form');
const errorMessage = document.getElementById('error-message');

form.addEventListener('submit', async function (e) {
    e.preventDefault();

    const data = {
        metric: form.elements['metric'].value,
        units: form.elements['units'].value,
        category: form.elements['category'].value,
        trackerType: form.elements['trackerType'].value,
    };

    if (data.metric === "" || data.category === "" || data.trackerType === "") {
        errorMessage.textContent = 'You have not selected all required options. Please go back and amend.';
        errorMessage.style.display = 'block';
    }
    else {
        try {
            const response = await fetch('/user/tracker/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json;charset=UTF-8',
                },
                body: JSON.stringify(data),
            });

            if (response.ok) {
                // Send to chart page
                window.location.href = `/user/tracker?metric=${data.metric}`;
            } else {
                const errorData = await response.json();
                const error = errorData.error;
                errorMessage.textContent = error;
                errorMessage.style.display = 'block';
            }
        } catch (error) {
            console.error(error);
            errorMessage.textContent = 'An error occurred while processing your request.';
            errorMessage.style.display = 'block';
        }
    }
});