  // Get the goal element and related elements
  const goal = document.querySelector('#goal');
  const goalInfo = goal.querySelector('#goal-info');
  const editForm = document.querySelector('#goal-edit-form');
  const dateInput = editForm.querySelector('#goal-date-input');
  const valueInput = editForm.querySelector('#goal-value-input');
  const editBtn = goal.querySelector('#edit-goal');
  const updateButton = editForm.querySelector('#update-goal');
  const cancelButton = editForm.querySelector('#cancel-edit');
  const metric = document.getElementById('goal-metric').value;
  const goalId = document.getElementById('goal-id').value;

  editBtn.addEventListener('click', () => {
    // Get the current date and value
    const date = goalInfo.querySelector('#goal-date').textContent;
    const value = goalInfo.querySelector('#goal-value').textContent;

    // Show current values on form
    dateInput.valueAsDate = parseDate(date);
    valueInput.value = value;

    // Hide current info and show edit form
    goalInfo.style.display = 'none';
    editForm.style.display = 'block';
  });

  updateButton.addEventListener('click', () => {
    // Get the updated date and value
    const updatedDate = dateInput.value;
    const updatedValue = valueInput.value;

    fetch('goal/update', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        goalId: goalId,
        date: updatedDate,
        value: updatedValue,
        metric: metric
      })
    })
      .then(response => response.text())
      .then(data => {

        // Reload the page to update
        location.reload();
      })
      .catch(error => {
        console.error(error);
      });
  });

  cancelButton.addEventListener('click', () => {
    editForm.style.display = 'none';
    goalInfo.style.display = 'block';
  });

//Converts date string to date object, for use in autofilling edit goal date field
  function parseDate(dateString) {
    const parts = dateString.split('/');
    const day = parseInt(parts[0], 10) + 1;
    const month = parseInt(parts[1], 10) - 1; // Months are zero-based (0-11)
    const year = parseInt(parts[2], 10);
    return new Date(year, month, day);
  }