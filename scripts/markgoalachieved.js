  const markAchievedBtn = document.getElementById('mark-achieved');
  markAchievedBtn.addEventListener('click', () => {
    // get the data from the page
    const metric = document.getElementById('goal-metric').value;
    const isAchieved = true;
    const achievedDate = parseInt(new Date().getTime());

    // post data to server
    const xhr = new XMLHttpRequest();
    xhr.open('POST', '/user/goal/update', true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.onreadystatechange = () => {
      if (xhr.readyState === 4) {
        if (xhr.status === 200) {
          // refresh the page to update
          location.reload(true);
        } else {
          console.error(xhr.statusText);
        }
      }
    };
    xhr.send(JSON.stringify({ metric, isAchieved, achievedDate }));
  });