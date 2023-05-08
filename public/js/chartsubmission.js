document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('metric-submit-form');

    form.addEventListener('submit', function (e) {
        e.preventDefault();

        // Get the values from the form inputs
        const metric = document.getElementById('metric').value;
        const value = document.getElementById('metric-input').value;
        const date = document.getElementById('date-input').value;
        let unit = null;
        const unitsRadioButtons = document.querySelectorAll('input[type="radio"]');
        for (let i = 0; i < unitsRadioButtons.length; i++) {
          if (unitsRadioButtons[i].checked) {
            unit = unitsRadioButtons[i].value;
            break;
          }
        }

        const data = { value: value, date: date, metric: metric, unit: unit };

        //Send the data to the server
        fetch('/user/metric/submit', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json;charset=UTF-8'
          },
          body: JSON.stringify(data)
        })
          .then(response => {
            if (response.ok) {
              location.reload(); // Reload the page to update chart with new data
            } else {
              throw new Error('Error: ' + response.statusText);
            }
          })
          .catch(error => {
            console.log(error);
          });
    });
});