document.addEventListener('DOMContentLoaded', () => {
       // Event listener for real-time password strength checking
       document.getElementById("password").addEventListener("input", function () {
        const password = this.value;
        const strengthText = evaluatePasswordStrength(password);
        const passwordStrengthElement = document.getElementById("passwordStrength");

        // Update the strength message in the small tag below the input
        passwordStrengthElement.textContent = `Password Strength: ${strengthText}`;

        // Optional: Add color coding based on strength
        if (strengthText === "Weak") {
            passwordStrengthElement.style.color = "red";
        } else if (strengthText === "Medium") {
            passwordStrengthElement.style.color = "orange";
        } else if (strengthText === "Strong") {
            passwordStrengthElement.style.color = "green";
        } else {
            passwordStrengthElement.style.color = "";
        }
    });

    // Function to evaluate password strength
    function evaluatePasswordStrength(password) {
        let strength = 0;

        // Check for various conditions and increase the strength accordingly
        if (password.length >= 8) strength++; // Length condition
        if (/[A-Z]/.test(password)) strength++; // At least one uppercase letter
        if (/[a-z]/.test(password)) strength++; // At least one lowercase letter
        if (/\d/.test(password)) strength++; // At least one digit
        if (/[@$!%*?&#]/.test(password)) strength++; // At least one special character

        // Return a description based on the strength score
        switch (strength) {
            case 0:
            case 1:
            case 2:
                return "Weak";
            case 3:
            case 4:
                return "Medium";
            case 5:
                return "Strong";
            default:
                return "";
        }
    }
    const formSections = document.querySelectorAll('.form-section');
    let currentPage = 1;

    // Event listeners for each next button
    document.querySelectorAll('button[id^="nextButton"]').forEach((btn) => {
        btn.addEventListener('click', () => {
            if (validateCurrentPage(currentPage)) {
                formSections[currentPage - 1].classList.remove('active');
                currentPage++;
                formSections[currentPage - 1].classList.add('active');
            }
        });
    });

    // Event listeners for each back button
    document.querySelectorAll('button[id^="backButton"]').forEach((btn) => {
        btn.addEventListener('click', () => {
            if (currentPage > 1) {
                formSections[currentPage - 1].classList.remove('active');
                currentPage--;
                formSections[currentPage - 1].classList.add('active');
            }
        });
    });

    // Main form submission handler
    document.getElementById('patientForm').addEventListener('submit', async function (event) {
        event.preventDefault(); // Prevent the default form submission

        const registerButton = document.getElementById('registerButton');
        const backbtn = document.getElementById('backButton3');

        // Collect data from input fields
        const patientData = {
            patientname: document.getElementById('patientName').value,
            attendername: document.getElementById('attenderName').value,
            email: document.getElementById('email').value,
            password: document.getElementById('password').value,
            patientage: document.getElementById('patientAge').value,
            bloodgroup: document.getElementById('bloodGroup').value,
            gender: document.getElementById('gender').value,
            height: document.getElementById('height').value,
            weight: document.getElementById('weight').value,
            address: document.getElementById('address').value,
            patientcontactnumber: document.getElementById('patientContactNumber').value,
            attendercontactnumber: document.getElementById('attenderContactNumber').value,
            addictionType: Array.from(document.querySelectorAll('input[name="addictionType[]"]:checked')).map(checkbox => checkbox.value),
            addictionDuration: document.getElementById('addictionDuration').value,
            frequencyOfUse: document.getElementById('frequencyOfUse').value,
            previousTreatmentHistory: document.getElementById('previousTreatmentHistory').value
        };

        // Disable buttons during submission
        registerButton.disabled = true;
        backbtn.disabled = true;
        registerButton.textContent = 'Registering...';

        try {
            // Send a POST request to the server
            const response = await fetch('/patientregister', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(patientData)
            });

            if (response.ok) {
                const data = await response.json();
                showNotification(data.message, true);
                registerButton.textContent = 'Registered';
                setTimeout(() => {
                    window.location.href = '/login'; // Redirect to login page after success
                }, 2000);
            } else {
                const result = await response.json();
                showNotification(result.message, false);
                registerButton.textContent = 'Register';
            }
        } catch (error) {
            console.error('Error:', error);
            showNotification('Internal Server Error', false);
        } finally {
            registerButton.disabled = false;
            backbtn.disabled = false;
        }
    });

    // Validation function for the current page
    function validateCurrentPage(page) {
        let isValid = true;

        switch (page) {
            case 1:
                const patientName = document.getElementById('patientName');
                const attenderName = document.getElementById('attenderName');
                const email = document.getElementById('email');
                const password = document.getElementById('password');

                clearErrors([patientName, attenderName, email, password]);

                if (patientName.value.trim() === '') {
                    showError(patientName, 'Please enter the patient\'s name');
                    isValid = false;
                }

                if (attenderName.value.trim() === '') {
                    showError(attenderName, 'Please enter the attender\'s name');
                    isValid = false;
                }

                if (!validateEmail(email.value)) {
                    showError(email, 'Invalid email format');
                    isValid = false;
                }

                if (!validatePassword(password.value)) {
                    showError(password, 'Password must be at least 8 characters long');
                    isValid = false;
                }
                break;
            case 2:
                const patientAge = document.getElementById('patientAge');
                const bloodGroup = document.getElementById('bloodGroup');
                const gender = document.getElementById('gender');
                const height = document.getElementById('height');

                clearErrors([patientAge, bloodGroup, gender, height]);

                if (patientAge.value <= 0) {
                    showError(patientAge, 'Please enter a valid age');
                    isValid = false;
                }

                if (bloodGroup.value === '') {
                    showError(bloodGroup, 'Please select a blood group');
                    isValid = false;
                }

                if (gender.value === '') {
                    showError(gender, 'Please select a gender');
                    isValid = false;
                }

                if (height.value <= 0) {
                    showError(height, 'Please enter a valid height');
                    isValid = false;
                }
                break;

            case 3:
                const weight = document.getElementById('weight');
                const address = document.getElementById('address');
                const patientContactNumber = document.getElementById('patientContactNumber');

                clearErrors([weight, address, patientContactNumber]);

                if (weight.value <= 0) {
                    showError(weight, 'Please enter a valid weight');
                    isValid = false;
                }

                if (address.value.trim() === '') {
                    showError(address, 'Please enter the address');
                    isValid = false;
                }

                if (!validatePhoneNumber(patientContactNumber.value)) {
                    showError(patientContactNumber, 'Invalid phone number. Must be 10 digits');
                    isValid = false;
                }
                break;

            // Add more cases as necessary for additional pages

            default:
                break;
        }

        return isValid; // Return whether the current page is valid
    }

    function showError(input, message) {
        const errorElement = document.getElementById(input.id + 'Error');
        errorElement.style.display = 'block'; // Show the error message
        errorElement.innerText = message;
        input.classList.add('is-invalid'); // Add error styling to input
    }

    function clearErrors(inputs) {
        inputs.forEach(input => {
            const errorElement = document.getElementById(input.id + 'Error');
            if (errorElement) { // Check if errorElement exists
                errorElement.style.display = 'none'; // Hide the error message
            }
            input.classList.remove('is-invalid'); // Remove error styling from input
        });
    }


    function validateEmail(email) {
        const re = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
        return re.test(String(email).toLowerCase()); // Check for valid email format
    }

    function validatePassword(password) {
        const regex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/;
        return regex.test(password);
    }

    function validatePhoneNumber(phoneNumber) {
        const phoneRe = /^[0-9]{10}$/;
        return phoneRe.test(phoneNumber); // Check for valid 10-digit phone number
    }

    // Notification function
    function showNotification(message, isSuccess) {
        const notificationDiv = document.getElementById('notification');
        const messageP = document.getElementById('message'); // This ID must exist in the HTML

        messageP.textContent = message;

        if (isSuccess) {
            notificationDiv.classList.add('alert-success');
            notificationDiv.classList.remove('alert-error');
        } else {
            notificationDiv.classList.add('alert-error');
            notificationDiv.classList.remove('alert-success');
        }

        notificationDiv.style.display = 'flex';

        setTimeout(() => {
            notificationDiv.style.display = 'none'; // Automatically hide notification after 5 seconds
        }, 5000);
    }

    // Close notification when '×' is clicked
    document.getElementById('close').addEventListener('click', () => {
        document.getElementById('notification').style.display = 'none';
    });
});
