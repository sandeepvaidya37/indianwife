




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
      