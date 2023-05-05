const deleteGoalBtn = document.getElementById('delete-goal');

deleteGoalBtn.addEventListener('click', () => {
  //get the data from the page
  const metric = document.getElementById('goal-metric').value;
  const date = document.getElementById('goal-date').innerText;


  //post data to server
  const xhr = new XMLHttpRequest();
  xhr.open('POST', '/user/goal/delete', true);
  xhr.setRequestHeader('Content-Type', 'application/json');
  xhr.onreadystatechange = () => {
    if (xhr.readyState === 4) {
      if (xhr.status === 200) {
        const response = JSON.parse(xhr.responseText);
        console.log(response.message);
        //reload page
        location.reload();
      } else {
        console.error(xhr.statusText);
      }
    }
  };
  xhr.send(JSON.stringify({ metric, date }));
});