function approveAppointment(appointmentId) {
    const approveBtn = document.getElementById('approvetime');
    const selectedTime = document.getElementById(`time-${appointmentId}`).value;
    approveBtn.textContent = 'Approving...';
    // Make an AJAX request to approve the appointment with the selected time
    fetch(`/appointments/approve/${appointmentId}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ time: selectedTime }), // Send the selected time
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showNotification(data.message, true);
            approveBtn.textContent = 'Approved';
            setTimeout( () => {
                location.reload();
            },2000)
        } else {
            showNotification(data.message, false);
            approveBtn.textContent = 'Approve';
        }
    })
    .catch(err => {
        showNotification('Internal Server Error',false);
        approveBtn.textContent = 'Approve';
    });
}

function triggerCancelModal(appointmentId) {
    // Open the modal
    const cancelModal = new bootstrap.Modal(document.getElementById('cancelModal'), {});
    cancelModal.show();

    // Handle confirmation
    document.getElementById('confirmCancel').onclick = function () {
        cancelAppointment(appointmentId);
        cancelModal.hide();
    };
}

function cancelAppointment(appointmentId) {
    // Make an AJAX request to cancel the appointment
    const cancleButton = document.getElementById('cancelBtn');
    cancleButton.textContent = 'Cancelling...';
    cancleButton.disabled = true;
    fetch(`/appointments/cancel/${appointmentId}`, {
        method: 'POST',
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showNotification(data.message, true);
            cancleButton.textContent = 'Cancelled';
            cancleButton.disabled = true;
            setTimeout( () => {
                location.reload();
            },2000)
        } else {
            showNotification(data.message, false);
            cancleButton.textContent = 'Cancel';
            cancleButton.disabled = false;
        }
    })
    .catch(err => {
        showNotification('Internal Server Error',false);
        cancleButton.textContent = 'Cancel';
        cancleButton.disabled = false;
    });
}

document.addEventListener('DOMContentLoaded', function () {

    const eventDateInput = document.getElementById('eventDate');
    
    // Get today's date and add 1 day to get tomorrow's date
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    // Format date as 'YYYY-MM-DD'
    const formattedTomorrow = tomorrow.toISOString().split('T')[0];

    // Set the 'min' attribute to tomorrow's date
    eventDateInput.setAttribute('min', formattedTomorrow);


    document.getElementById('eventForm').addEventListener('submit', async (event) => {
        event.preventDefault(); // Prevent the default form submission
        const hostEventBtn = document.getElementById('host-event-btn');
        hostEventBtn.textContent='Submitting...';
        const eventName = document.getElementById('eventName').value;
        const eventDesc = document.getElementById('eventDesc').value;
        const eventDateType = document.getElementById('eventDate').value;
        const eventTime = document.getElementById('eventTime').value;
        const centerName = document.getElementById('centerName').value;
        const centerEmail = document.getElementById('centerEmail').value;
        
        // Convert form data to a JSON object

        try {
            // Send a POST request to the server
           
            fetch('/add-events', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    eventName,
                    eventDesc,
                    eventDateType,
                    eventTime,
                    centerName,
                    centerEmail
                }),
            })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        alert('Event added successfully.');
                        showNotification(data.message, true);
                        document.getElementById('eventForm').reset(); // Reset the form
                        setTimeout( () => {
                            location.reload();
                        },2000)
                    } else {
                        showNotification(data.message, true);
                        alert(data.message);
                    }
                });
        } catch (error) {
            console.error('Error:', error);
            alert('An error occurred while hosting the event.');
            showNotification('Internal Server Error', false);
        }
    })
});



// *******Notification-func *******Notification-func *******Notification-func *******Notification-func *******//
function showNotification(message, isSuccess) {
    const notificationDiv = document.getElementById('notification');
    const messageP = document.getElementById('message');


    // Set the message
    messageP.textContent = message;

    // Change the icon and color based on success or failure
    if (isSuccess) {

        notificationDiv.classList.add('alert-success');
        notificationDiv.classList.remove('alert-error');
    } else {

        notificationDiv.classList.add('alert-error');
        notificationDiv.classList.remove('alert-success');
    }

    // Show the notification
    notificationDiv.style.display = 'flex';

    // Optional: Hide the notification after a certain time (e.g., 5 seconds)
    setTimeout(() => {
        notificationDiv.style.display = 'none';
    }, 5000);
}

// Close notification when '×' is clicked
document.getElementById('close').addEventListener('click', () => {
    document.getElementById('notification').style.display = 'none';
});
// *******Notification-func *******Notification-func *******Notification-func *******Notification-func *******//
