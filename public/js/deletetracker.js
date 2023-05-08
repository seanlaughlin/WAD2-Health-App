// Get the delete tracker link element
const deleteTrackerLink = document.getElementById('delete-tracker');

// Add click event listener to the link
deleteTrackerLink.addEventListener('click', async (event) => {
  event.preventDefault();

  // Get the metric from the link
  const metric = deleteTrackerLink.getAttribute('data-metric');
  console.log(metric)

  try {
    // Delete the tracker and goals
    await deleteTrackerAndGoals(metric);
    console.log('Tracker deleted successfully.');

  } catch (error) {
    console.error('Error deleting tracker:', error);
  }
});

async function deleteTrackerAndGoals(metric) {
  try {
    // Delete the tracker and goals
    const deleteTrackerResponse = await fetch('/user/tracker/delete', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ metric: metric }),
    });

    if (!deleteTrackerResponse.ok) {
      throw new Error('Failed to delete tracker');
    }
    else{
        location.reload();
    }
  } catch (error) {
    throw error;
  }
}