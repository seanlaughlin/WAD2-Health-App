const completeIcons = document.querySelectorAll('.mark-complete');
const editIcons = document.querySelectorAll('.edit-goal');
const deleteIcons = document.querySelectorAll('.delete-goal');

completeIcons.forEach(icon => {
    icon.addEventListener('click', () => {
        const goalId = icon.getAttribute('data-metric');
        sendGoal(goalId, true);
    });
});

editIcons.forEach(icon => {
    icon.addEventListener('click', () => {
        const goalId = icon.getAttribute('data-metric');
        enableEditFields(goalId);
        showConfirmationIcons(goalId);
    });
});


deleteIcons.forEach(icon => {
    icon.addEventListener('click', () => {
        const goalId = icon.getAttribute('data-metric');
        deleteGoal(goalId);
    });
});

//Send updated goal to back end after marking as complete or editing
const sendUpdatedGoal = (goalId) => {
    // Get the updated goal info from goal row and child input fields
    const goalRow = document.getElementById(goalId);
    const updatedValue = goalRow.querySelector('input[name="value"]').value;
    const updatedDate = goalRow.querySelector(`input[name="date"]`).value;

    const updatedGoal = {
        goalId: goalId,
        value: updatedValue,
        date: updatedDate
    };
}

const enableEditFields = (goalId) => {
    //Enable input fields for editing and add bottom border to indicate editable
    //Escape used as ID uses invalid chars for css
    const goalInput = document.querySelector(`#${CSS.escape(goalId)} input[name="value"]`);
    const date = document.querySelector(`#${CSS.escape(goalId)} input[name="date"]`);

    goalInput.removeAttribute('disabled');
    date.removeAttribute('disabled');
    goalInput.style.borderBottom = "1px solid black";
    date.style.borderBottom = "1px solid black";
}

const showConfirmationIcons = (goalId) => {
    //hide default icons
    const existingIcons = document.querySelectorAll(`#${CSS.escape(goalId)} .mark-complete, #${CSS.escape(goalId)} .edit-goal, #${CSS.escape(goalId)} .delete-goal`);
    existingIcons.forEach(icon => {
        icon.style.display = 'none';
    });

    //show new confirm and cancel icons
    const saveIcon = document.querySelector(`#${CSS.escape(goalId)} .save-goal`);
    //Save goal when clicked
    saveIcon.addEventListener('click', () => {
        sendGoal(goalId, false);
    });
    const cancelIcon = document.querySelector(`#${CSS.escape(goalId)} .cancel-edit`);
    cancelIcon.addEventListener('click', () => {
        showOriginalIcons(goalId);
    })

    saveIcon.style.display = 'inline';
    cancelIcon.style.display = 'inline';;
}

const showOriginalIcons = (goalId) => {
    // Disable the input fields
    const valueInput = document.querySelector(`#${CSS.escape(goalId)} input[name="value"]`);
    const dateInput = document.querySelector(`#${CSS.escape(goalId)} input[name="date"]`);

    //reset style
    valueInput.style.borderBottom = 'none';
    dateInput.style.borderBottom = 'none';
    valueInput.setAttribute('disabled', 'disabled');
    dateInput.setAttribute('disabled', 'disabled');

    //Hide the save and cancel icons
    const saveIcon = document.querySelector(`#${CSS.escape(goalId)} .save-goal`);
    const cancelIcon = document.querySelector(`#${CSS.escape(goalId)} .cancel-edit`);
    saveIcon.style.display = 'none';
    cancelIcon.style.display = 'none';

    // Show the original icons
    const originalIcons = document.querySelectorAll(`#${CSS.escape(goalId)} .mark-complete, #${CSS.escape(goalId)} .edit-goal, #${CSS.escape(goalId)} .delete-goal`);
    originalIcons.forEach(icon => {
        icon.style.display = 'inline';
    });
}

const sendGoal = (goalId, isAchieved) => {
    //Get the updated goal info from goal row and child input fields
    const goalRow = document.getElementById(goalId);
    const updatedValue = goalRow.querySelector('input[name="value"]').value;
    const updatedDate = goalRow.querySelector('input[name="date"]').value;
    console.log(updatedValue)

    const updatedGoal = {
        goalId: goalId,
        value: updatedValue,
        date: updatedDate,
        isAchieved: isAchieved,
        //Check if achieved, if so, add today as achieved date
        achievedDate: isAchieved ? new Date() : null
    };

    //Send the updated goal to the server
    fetch('goal/update', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(updatedGoal)
    })
        .then(response => {
            if (response.ok) {
                // Reload the page after successful update
                location.reload();
            } else {
                console.error('unable to update goal');
            }
        })
        .catch(error => {
            console.error(error);
        });
}

const deleteGoal = (goalId) => {
    //Send the delete req to the server
    fetch('goal/delete', {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({goalId: goalId})
    })
        .then(response => {
            if (response.ok) {
                // Reload the page after successful delete
                location.reload();
            } else {
                console.error('unable to delete goal');
            }
        })
        .catch(error => {
            console.error(error);
        });
}