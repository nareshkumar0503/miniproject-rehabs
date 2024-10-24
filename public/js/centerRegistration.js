document.addEventListener('DOMContentLoaded', function () {
    // Validate phone number
    document.getElementById('contactNo').addEventListener('input', function (e) {
        const phoneNumberPattern = /^(\+91[\-\s]?)?[0]?(91)?[6789]\d{9}$/;
        const isInvalidSequence = /^987654\d{4}$/;

        // Remove any leading '+91', '0', or '+91-' from the input to focus on the last 10 digits
        const strippedNumber = e.target.value.replace(/^(\+91[\-\s]?|0)/, '');

        // Validate phone number using pattern and check for invalid sequences
        if (!phoneNumberPattern.test(e.target.value) || isInvalidSequence.test(strippedNumber)) {
            e.target.setCustomValidity("Please enter a valid phone number.");
            e.target.classList.add('is-invalid');
            e.target.classList.remove('is-valid');
        } else {
            e.target.setCustomValidity("");
            e.target.classList.remove('is-invalid');
            e.target.classList.add('is-valid');
        }
    });

    // Validate email
    document.getElementById('email').addEventListener('input', function (e) {
        const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
        const emailInput = e.target.value;

        if (!emailPattern.test(emailInput)) {
            e.target.setCustomValidity("Please enter a valid email address.");
            e.target.classList.add('is-invalid');
            e.target.classList.remove('is-valid');
        } else {
            e.target.setCustomValidity("");
            e.target.classList.remove('is-invalid');
            e.target.classList.add('is-valid');
        }
    });

    // Validate website URL
    document.getElementById('websiteURL').addEventListener('input', function (e) {
        const urlPattern = /^(https?:\/\/)?([\w\d\-_]+(\.[\w\d\-_]+)+)([^\s]*)?$/;
        const urlInput = e.target.value;

        if (urlInput && !urlPattern.test(urlInput)) {
            e.target.setCustomValidity("Please enter a valid website URL.");
            e.target.classList.add('is-invalid');
            e.target.classList.remove('is-valid');
        } else {
            e.target.setCustomValidity("");
            e.target.classList.remove('is-invalid');
            e.target.classList.add('is-valid');
        }
    });

    // Validate latitude (accepts long decimal precision)
    document.getElementById('latitude').addEventListener('input', function (e) {
        const latPattern = /^-?([1-8]?[0-9]|90)(\.\d{1,15})?$/;
        const latInput = e.target.value;

        if (!latPattern.test(latInput)) {
            e.target.setCustomValidity("Please enter a valid latitude (-90.000000 to 90.000000).");
            e.target.classList.add('is-invalid');
            e.target.classList.remove('is-valid');
        } else {
            e.target.setCustomValidity("");
            e.target.classList.remove('is-invalid');
            e.target.classList.add('is-valid');
        }
    });

    // Validate longitude (accepts long decimal precision)
    document.getElementById('longitude').addEventListener('input', function (e) {
        const lonPattern = /^-?([1]?[0-7]?[0-9]|180)(\.\d{1,15})?$/;
        const lonInput = e.target.value;

        if (!lonPattern.test(lonInput)) {
            e.target.setCustomValidity("Please enter a valid longitude (-180.000000 to 180.000000).");
            e.target.classList.add('is-invalid');
            e.target.classList.remove('is-valid');
        } else {
            e.target.setCustomValidity("");
            e.target.classList.remove('is-invalid');
            e.target.classList.add('is-valid');
        }
    });

    // Validate password (add your password field here)
    const passwordField = document.getElementById('password'); // Assuming you have a password field with id 'password'
    passwordField.addEventListener('input', function (e) {
        const password = e.target.value;
        if (!validatePassword(password)) {
            showError(passwordField, 'Password must be at least 8 characters long.');
        } else {
            clearError(passwordField);
        }
    });

    // Form submit handler
    document.getElementById('registrationForm').addEventListener('submit', async function (event) {
        event.preventDefault();

        const password = document.getElementById('password'); // Ensure password field is checked
        let isValid = true;

        if (!validatePassword(password.value)) {
            showError(password, 'Password must be at least 8 characters long');
            isValid = false;
        }

        if (isValid) {
            const registerButton = document.getElementById('registerButton');
            registerButton.disabled = true;
            registerButton.textContent = 'Registering...';

            // Prepare form data
            const formData = new FormData();
            formData.append('centerName', document.getElementById('centerName').value);
            formData.append('contactNo', document.getElementById('contactNo').value);
            formData.append('address', document.getElementById('address').value);
            formData.append('email', document.getElementById('email').value);
            formData.append('password', document.getElementById('password').value);
            formData.append('websiteURL', document.getElementById('websiteURL').value);
            formData.append('emergencyServices', document.getElementById('emergencyServices').value);
            formData.append('startTime', document.getElementById('startTime').value);
            formData.append('endTime', document.getElementById('endTime').value);
            formData.append('latitude', document.getElementById('latitude').value);
            formData.append('longitude', document.getElementById('longitude').value);
            formData.append('priceRange', document.getElementById('priceRange').value);
            formData.append('description', document.getElementById('description').value);

            // Collect Services Offered, Programs, Addictions, and Center Images
            const services = document.querySelectorAll('input[name="servicesOffered[]"]:checked');
            const programs = document.querySelectorAll('input[name="programsAvailable[]"]:checked');
            const addictions = document.querySelectorAll('input[name="addictions[]"]:checked');

            services.forEach(service => formData.append('servicesOffered[]', service.value));
            programs.forEach(program => formData.append('programsAvailable[]', program.value));
            addictions.forEach(addiction => formData.append('addictions[]', addiction.value));

            // Attach center images (multiple)
            const images = document.getElementById('centerImages').files;
            for (let i = 0; i < images.length; i++) {
                formData.append('centerImages', images[i]);
            }

            try {
                showNotification('Registering...', true);  // Display a loading message

                const response = await fetch('/centerregister', {
                    method: 'POST',
                    body: formData
                });

                const result = await response.json();

                if (response.ok) {
                    showNotification(result.message, true);  // Success message
                    registerButton.textContent = 'Registered!!';
                    setTimeout(() => {
                        window.location.href = '/login';  // Redirect after registration
                    }, 2000);
                } else {
                    registerButton.textContent = 'Register';
                    showNotification(result.message, false);  // Error message from server
                }
            } catch (error) {
                showNotification('Error: ' + error.message, false);  // Handle fetch errors
                registerButton.disabled = false;
            }
        }
    });

    // Validate password function
    function validatePassword(password) {
        const regex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/;
        return regex.test(password);
    }

    // Show error for form fields
    function showError(input, message) {
        input.setCustomValidity(message);
        input.classList.add('is-invalid');
        input.classList.remove('is-valid');
    }

    // Clear error for form fields
    function clearError(input) {
        input.setCustomValidity("");
        input.classList.remove('is-invalid');
        input.classList.add('is-valid');
    }

    // Notification function
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

        // Hide the notification after 5 seconds
        setTimeout(() => {
            notificationDiv.style.display = 'none';
        }, 5000);
    }

    // Close notification when '×' is clicked
    document.getElementById('close').addEventListener('click', function () {
        document.getElementById('notification').style.display = 'none';
    });
});
