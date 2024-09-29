// ******DescPage ******DescPage ******DescPage ******DescPage ******DescPage ******DescPage****** //
function Description(email) {
    // Redirect the user to the server-rendered page with the email as a query parameter
    window.location.href = `/descPage?email=${encodeURIComponent(email)}`;
}

function scrollLeftCards(selector) {
    const container = document.querySelector(selector);
    if (container) {
        container.scrollBy({
            left: -250,
            behavior: 'smooth'
        });
    }
}

function scrollRightCards(selector) {
    const container = document.querySelector(selector);
    if (container) {
        container.scrollBy({
            left: 250,
            behavior: 'smooth'
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('appointmentForm').addEventListener('submit', async function (event) {
        event.preventDefault();
        const patientName = document.getElementById('patientName').value;
        const patientAge = document.getElementById('patientAge').value;
        const patientEmail = document.getElementById('patientEmail').value;
        const patientPhone = document.getElementById('patientPhone').value;
        // Get the patient addiction input and convert it to an array
        const patientAddictionInput = document.getElementById('patientAddiction').value;
        const patientAddiction = patientAddictionInput.split(',').map(item => item.trim());
        const appointmentDate = new Date(document.getElementById('appointmentDate').value).toISOString();  // Convert to ISO string if using Date type in the schema
        const appointmentSession = document.getElementById('appointmentSession').value;
        const centerEmail = document.getElementById('centerEmail').value;
        const centerName = document.getElementById('centerName').value;
        const attenderPhone = document.getElementById('attenderPhone').value;
        const patientBloodGroup = document.getElementById('bloodGroup').value;
        if (appointmentDate && appointmentSession) {
            // Logic to handle booking the appointment (e.g., send a request to the server)
            fetch('/book-appointment', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    patientName,
                    patientAge,
                    patientEmail,
                    patientPhone,
                    patientAddiction,
                    appointmentDate,
                    appointmentSession,
                    centerEmail,
                    centerName,
                    attenderPhone,
                    patientBloodGroup,
                })
            })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        // Hide the Book Appointment button and show the View Appointment button
                        showNotification(data.message, true);
                        setTimeout(() => {
                            location.reload();
                        }, 2000)
                    } else {

                        showNotification(data.message, false);
                        setTimeout(() => {
                            location.reload();
                        }, 2000)
                    }
                });
        } else {
            showNotification('Please fillout appointment data and session', false);
        }
    })
});

// ******DescPage-End ******DescPage-End ******DescPage-End ******DescPage-End ******DescPage-End ******DescPage-End ******//

// Notification function

// ********Notification ********Notification ********Notification ********Notification******* //
function showNotification(message, isSuccess) {
    const notificationDiv = document.getElementById('notification');
    const messageP = document.getElementById('message');

    if (messageP) {
        messageP.textContent = message;
    }

    if (isSuccess) {
        notificationDiv.classList.add('alert-success');
        notificationDiv.classList.remove('alert-error');
    } else {
        notificationDiv.classList.add('alert-error');
        notificationDiv.classList.remove('alert-success');
    }

    notificationDiv.style.display = 'flex';

    setTimeout(() => {
        notificationDiv.style.display = 'none';
    }, 5000);
}

// Close notification when '×' is clicked
document.getElementById('close').addEventListener('click', () => {
    document.getElementById('notification').style.display = 'none';
});
// ********Notification ********Notification ********Notification ********Notification******* //

// *****Cancle-Appointment *****Cancle-Appointment *****Cancle-Appointment *****Cancle-Appointment//

