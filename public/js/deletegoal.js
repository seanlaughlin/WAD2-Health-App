const deleteGoalBtn = document.getElementById('delete-goal');

deleteGoalBtn.addEventListener('click', async () => {
  // Get the goal id
  const goalId = document.getElementById('goal-id').value;

  try {
    const response = await fetch('/user/goal/delete', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ goalId: goalId })
    });

    if (response.status === 204) {
      console.log('Goal deleted');
      // Reload page to update
      location.reload();
    } else {
      const data = await response.json();
      console.error(data.message);
    }
  } catch (error) {
    console.error(error);
  }
});