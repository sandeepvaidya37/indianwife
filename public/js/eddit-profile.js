document.addEventListener("DOMContentLoaded", function () {
  const tabs = document.querySelectorAll(".profile-details, .career-details, .lifestyle-family");
  const forms = document.querySelectorAll(".form-profile-details, .form-career-details, .form-lifestyle-family");

  tabs.forEach((tab, index) => {
      tab.addEventListener("click", function () {
          // Remove active class from all tabs and forms
          tabs.forEach(t => t.classList.remove("active"));
          forms.forEach(f => f.classList.remove("active"));

          // Add active class to the clicked tab and corresponding form
          tab.classList.add("active");
          forms[index].classList.add("active");
      });
  });
});




document.addEventListener("DOMContentLoaded", () => {
  // Use a more specific selector for sections if needed
  const sections = document.querySelectorAll(".form-profile-details, .form-career-details, .form-lifestyle-family");
  const tabs = document.querySelectorAll(".top-details div");
  const continueButtons = document.querySelectorAll(".continue");

  

  
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