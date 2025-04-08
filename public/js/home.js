document.querySelectorAll(".interest").forEach(button => {
  button.addEventListener("click", () => {
      const userId = button.getAttribute("data-user-id");
      console.log(userId); // Debugging: Check if userId is being fetched correctly

      fetch("/likes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId })
      })
      .then(response => response.json())
      .then(data => {
          if (data.success) {
              if (data.action === "added") {
                  button.classList.add("active");
              } else {
                  button.classList.remove("active");
              }
          } else {
              alert(data.message);
          }
      })
      .catch(error => console.error("Error:", error));
  });
});

document.querySelectorAll(".btn.super-interest").forEach(button => {
  button.addEventListener("click", () => {
      const userId = button.getAttribute("data-user-id");
      console.log(userId); // Debugging: Check if userId is being fetched correctly

      fetch("/intrest", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId })
      })
      .then(response => response.json())
      .then(data => {
          if (data.success) {
              if (data.action === "added") {
                  button.classList.add("active");
              } else {
                  button.classList.remove("active");
              }
          } else {
              alert(data.message);
          }
      })
      .catch(error => console.error("Error:", error));
  });
});

document.querySelectorAll(".btn.shortlist").forEach(button => {
  button.addEventListener("click", () => {
      const userId = button.getAttribute("data-user-id");
      console.log(userId); // Debugging: Check if userId is being fetched correctly

      fetch("/shortlist", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId })
      })
      .then(response => response.json())
      .then(data => {
          if (data.success) {
              if (data.action === "added") {
                  button.classList.add("active");
              } else {
                  button.classList.remove("active");
              }
          } else {
              alert(data.message);
          }
      })
      .catch(error => console.error("Error:", error));
  });
});

document.addEventListener("DOMContentLoaded", () => {
    // Use a more specific selector for sections if needed
    const sections = document.querySelectorAll(".form-profile-details, .form-career-details, .form-lifestyle-family");
    const tabs = document.querySelectorAll(".top-details div");
    const continueButtons = document.querySelectorAll(".continue");
  
    // Debug: Log counts
    console.log('Sections:', sections.length);
    console.log('Continue Buttons:', continueButtons.length);
  
    // Function to check required fields (both inputs and selects)
    function validateInputs(sectionIndex) {
        const fields = sections[sectionIndex].querySelectorAll("input[required], select[required]");
        const continueButton = continueButtons[sectionIndex];
        let allRequiredFilled = true;
        
        fields.forEach(field => {
            if (field.value.trim() === "") {
                allRequiredFilled = false;
            }
        });
    
        if (allRequiredFilled) {
            continueButton.classList.remove("disabled");
            continueButton.classList.add("enabled");
            continueButton.style.cursor = "pointer";
        } else {
            continueButton.classList.remove("enabled");
            continueButton.classList.add("disabled");
            continueButton.style.cursor = "not-allowed";
        }
    }
    document.querySelector(".filterbtn").addEventListener("click", function () {
        document.querySelector(".filter-form").classList.toggle("active");
      });
    // Attach event listeners to required fields (inputs and selects)
    sections.forEach((section, index) => {
        const requiredFields = section.querySelectorAll("input[required], select[required]");
        requiredFields.forEach(field => {
            if (field.tagName.toLowerCase() === "select") {
                field.addEventListener("change", () => validateInputs(index));
            } else {
                field.addEventListener("input", () => validateInputs(index));
            }
        });
    });
    
    // Continue button click event
    continueButtons.forEach((button, index) => {
        button.addEventListener("click", () => {
            if (!button.classList.contains("enabled")) return; // Stop if required fields are empty
            
            // Hide all sections and tabs
            sections.forEach(section => section.classList.remove("active"));
            tabs.forEach(tab => tab.classList.remove("active"));
    
            // Move to the next section if it exists
            if (index + 1 < sections.length) {
                sections[index + 1].classList.add("active");
                tabs[index + 1].classList.add("active");
                console.log("Moved to section:", index + 1);
            }
        });
    });
  });

  document.addEventListener("DOMContentLoaded", function() {
    const jobSectorSelect = document.getElementById("jobSector");
    const occupationInput = document.getElementById("occupationInput");
    const occupationDatalist = document.getElementById("occupationDatalist");

    // When a job sector is selected...
    jobSectorSelect.addEventListener("change", function() {
      // Get the selected option and its associated occupations
      const selectedOption = jobSectorSelect.options[jobSectorSelect.selectedIndex];
      const occupationsData = selectedOption.getAttribute("data-occupations");
      let occupations = [];
      if (occupationsData) {
        occupations = JSON.parse(occupationsData);
      }

      // Clear existing datalist options
      occupationDatalist.innerHTML = "";

      // Populate datalist with occupation names
      occupations.forEach(function(occupation) {
        const option = document.createElement("option");
        option.value = occupation.name;
        occupationDatalist.appendChild(option);
      });

      // Enable the occupation input field
      occupationInput.disabled = false;
    });
  });

const religionSelect = document.getElementById('religionSelect');
    const casteInput = document.getElementById('casteInput');
    const castDatalist = document.getElementById('castDatalist');

    // When a religion is selected...
    religionSelect.addEventListener('change', function() {
      // Get the selected option and its castes data
      const selectedOption = religionSelect.options[religionSelect.selectedIndex];
      const castes = JSON.parse(selectedOption.getAttribute('data-castes'));
      
      // Clear any existing suggestions
      castDatalist.innerHTML = '';

      // Add each caste as an option in the datalist
      castes.forEach(function(caste) {
        const option = document.createElement('option');
        option.value = caste.name;
        castDatalist.appendChild(option);
      });
      
      // Enable the caste input field
      casteInput.disabled = false;
    });

    document.getElementById("country").addEventListener("input", async function () {
        const stateName = this.value.trim();
        const cityInput = document.getElementById("city");
        const cityList = document.getElementById("city-suggestions");
      
        if (stateName.length < 3) return; // Wait until user types at least 3 letters
      
        try {
          const response = await fetch(`/get-cities?state=${stateName}`);
          const data = await response.json();
      
          cityList.innerHTML = ""; // Clear previous suggestions
      
          if (data.error) {
            console.warn(data.error);
            return;
          }
      
          // Populate suggestions
          data.forEach(city => {
            const option = document.createElement("option");
            option.value = city.name;
            cityList.appendChild(option);
          });
      
          // Enable city input only if cities are found
          cityInput.disabled = false;
      
        } catch (error) {
          console.error("Error fetching cities:", error);
        }
      });
      