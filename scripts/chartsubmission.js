document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('metric-submit-form');
  
    form.addEventListener('submit', function(e) {
      e.preventDefault();
  
      // Get the values from the form inputs
      const metric = document.getElementById('metric').value;
      const value = document.getElementById('value').value;
      const date = document.getElementById('date').value;
  
      // Create a data object with the data and date values
      const data = { value: value, date: date, metric: metric };
  
      // Send an AJAX POST request to the server to submit the data
      const xhr = new XMLHttpRequest();
      xhr.open('POST', '/user/metric/submit');
      xhr.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
      xhr.onload = function() {
        if (xhr.status === 200) {
          // Reload the page to update the chart with the new data
          location.reload();
        } else {
          console.log('Error:', xhr.responseText);
        }
      };
      xhr.send(JSON.stringify(data));
    });
  });