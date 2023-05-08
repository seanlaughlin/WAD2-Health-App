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


  // Submit goal data to server
  fetch('/user/goal/submit', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json;charset=UTF-8'
    },
    body: JSON.stringify(data)
  })
    .then(response => {
      if (response.ok) {
        // Reload the page to update the chart with the new data
        location.reload();
      } else {
        console.log('Error:', response.statusText);
      }
    })
    .catch(error => {
      console.log('Error:', error);
    });
});
