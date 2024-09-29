document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('patientForm').addEventListener('submit', async function (event) {
        event.preventDefault(); // Prevent the default form submission

        const registerButton = document.getElementById('registerButton');
        const backbtn = document.getElementById('backButton3');

        // Manually collect data from input fields
        const patientname = document.getElementById('patientName').value;
        const attendername = document.getElementById('attenderName').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const patientage = document.getElementById('patientAge').value;
        const bloodgroup = document.getElementById('bloodGroup').value;
        const gender = document.getElementById('gender').value;
        const height = document.getElementById('height').value;
        const weight = document.getElementById('weight').value;
        const address = document.getElementById('address').value;
        const patientcontactnumber = document.getElementById('patientContactNumber').value;
        const attendercontactnumber = document.getElementById('attenderContactNumber').value;
        const addictionType = Array.from(document.querySelectorAll('input[name="addictionType[]"]:checked')).map(checkbox => checkbox.value);
        const addictionDuration = document.getElementById('addictionDuration').value;
        const frequencyOfUse = document.getElementById('frequencyOfUse').value;
        const previousTreatmentHistory = document.getElementById('previousTreatmentHistory').value;

        registerButton.disabled = true;
        backbtn.disabled = true;

        try {
            registerButton.textContent = 'Registering...';

            // Send a POST request to the server
            const response = await fetch('/patientregister', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    patientname,
                    attendername,
                    patientage,
                    bloodgroup,
                    gender,
                    height,
                    weight,
                    address,
                    password,
                    patientcontactnumber,
                    attendercontactnumber,
                    email,
                    addictionType,
                    addictionDuration,
                    frequencyOfUse,
                    previousTreatmentHistory
                })
            });

            // Handle success response
            if (response.ok) {
                const data = await response.json();
                showNotification(data.message, true);
                registerButton.textContent = 'Registered';
                setTimeout(() => {
                    window.location.href = '/login';
                }, 2000);
            } else {
                // Handle error responses
                const result = await response.json();
                // alert(result.message || 'Failed to register. Please try again.');
                showNotification(result.message, false);
                registerButton.textContent = 'Register';
                registerButton.disabled = false;
            }

        } catch (error) {
            console.error('Error:', error);
            // alert('Failed to register. Please try again later.');
            showNotification('Internal Server Error', false);
            registerButton.textContent = 'Register';
            registerButton.disabled = false;
        } finally {
            backbtn.disabled = false;
        }
    });
});


// Notification function
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
