const markAchievedBtn = document.getElementById('mark-achieved');
markAchievedBtn.addEventListener('click', () => {
  // get the data from the page
  const goalId = document.getElementById('goal-id').value;
  const isAchieved = true;
  const achievedDate = parseInt(new Date().getTime());

  // post data to server
  fetch('/user/goal/update', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ goalId, isAchieved, achievedDate })
  })
    .then(response => {
      if (response.ok) {
        // Refresh the page to update
        location.reload(true);
      } else {
        console.error(response.statusText);
      }
    })
    .catch(error => {
      console.error(error);
    });
});