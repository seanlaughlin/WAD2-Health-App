const userDashboard = document.getElementById('user-dashboard');
// Get the trackers list element
const trackersList = document.getElementById('trackers-list');

// Function to display the trackers on the user dashboard
function displayTrackers(trackers) {
  // Clear the existing list
  trackersList.innerHTML = '';

  // Loop through the trackers and create list items to display them
  trackers.forEach(tracker => {
    const listItem = document.createElement('li');
    listItem.textContent = tracker.metric;
    trackersList.appendChild(listItem);
  });

  // Show the user dashboard
  userDashboard.style.display = 'block';
}

// Fetch the trackers using AJAX
fetch('/trackers')
  .then(response => response.json())
  .then(data => {
    // Display the trackers on the user dashboard
    displayTrackers(data);
  })
  .catch(error => {
    console.error(error);
  });
