const deleteGoalBtn = document.getElementById('delete-goal');

deleteGoalBtn.addEventListener('click', () => {
  //get the data from the page
  const goalId = document.getElementById('goal-id').value;


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
  xhr.send(JSON.stringify({ goalId: goalId }));
});