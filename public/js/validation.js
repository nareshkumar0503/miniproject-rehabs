// /public/js/validation.js
document.addEventListener("DOMContentLoaded", function() {
  document.getElementById("registrationForm").addEventListener("submit", function(event) {
      var isValid = true;

      var name = document.getElementById("name").value;
      var registrationNo = document.getElementById("registrationNo").value;
      var address = document.getElementById("address").value;
      var contactNo = document.getElementById("contactNo").value;
      var email = document.getElementById("email").value;
      var typesOfAddictions = document.getElementById("typesOfAddictions").value;
      var programsAvailable = document.getElementById("programsAvailable").value;
      var costRange = document.getElementById("costRange").value;
      var operatingHours = document.getElementById("operatingHours").value;
      var emergencyServices = document.getElementById("emergencyServices").value;
      var staffInformation = document.getElementById("staffInformation").value;
      var latitude = document.getElementById("latitude").value;
      var longitude = document.getElementById("longitude").value;

      if (name === "" || registrationNo === "" || address === "" || contactNo === "" || email === "" || typesOfAddictions === "" || programsAvailable === "" || costRange === "" || operatingHours === "" || emergencyServices === "" || staffInformation === "" || latitude === "" || longitude === "") {
          isValid = false;
      }

      if (!isValid) {
          event.preventDefault();
          alert("Please fill out all required fields.");
      }
  });
});
