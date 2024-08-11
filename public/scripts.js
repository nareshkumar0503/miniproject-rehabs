document.addEventListener('DOMContentLoaded', function() {
    document.getElementById("registrationForm").addEventListener("submit", function(event) {
        event.preventDefault();
        
        // Create FormData object from the form
        var formData = new FormData(this);
        
        // Send AJAX request
        var xhr = new XMLHttpRequest();
        xhr.open("POST", "/center/register", true);
        
        xhr.onload = function() {
            if (xhr.status === 200) {
                // On success, redirect to the thank you page
                window.location.href = "/thankyou.html";
            } else {
                // Handle errors here if needed
                console.error("Form submission failed: " + xhr.statusText);
            }
        };
        
        xhr.send(formData);
    });
});
