const goalForm = document.getElementById("metric-goal-form");

goalForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const metric = document.getElementById('goal-metric').value;
  const value = document.getElementById('goal-value').value;
  const date = document.getElementById('goal-date').value;

  let unit = null;
        const unitsRadioButtons = document.querySelectorAll('input[type="radio"]');
        for (let i = 0; i < unitsRadioButtons.length; i++) {
          if (unitsRadioButtons[i].checked) {
            unit = unitsRadioButtons[i].value;
            break;
          }
        }

  const data = {
    metric: metric,
    value: value,
    date: date,
    unit: unit
  };


  // Send an AJAX POST request to the server to submit the data
  const xhr = new XMLHttpRequest();
  xhr.open('POST', '/user/goal/submit');
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
