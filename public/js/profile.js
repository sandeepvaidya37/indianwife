document.getElementById("fileInput").addEventListener("change", function() {
  let iconLabel = document.querySelector(".icon");
  if (this.files.length > 0) {
      iconLabel.style.color = "red"; // Change color to red when file is selected
  } else {
      iconLabel.style.color = ""; // Reset color if no file is selected
  }
});

document.addEventListener("DOMContentLoaded", function () {
  let containers = document.querySelectorAll("[id^='image-']"); // Select all image containers

  if (containers.length === 0) return; // Exit if no images exist

  let currentIndex = 0;
  let totalImages = containers.length;

  // Initially show only the first image and hide others
  containers.forEach((container, index) => {
    container.style.display = index === 0 ? "block" : "none";
  });

  function showImage(index) {
    if (index < 0 || index >= totalImages) return; // Prevent out-of-bounds

    // Hide current image
    containers[currentIndex].style.display = "none";
    // Show new image
    containers[index].style.display = "block";

    currentIndex = index; // Update index
  }

  document.querySelectorAll(".right-button").forEach((btn) => {
    btn.addEventListener("click", function () {
      if (currentIndex < totalImages - 1) {
        showImage(currentIndex + 1);
      }
    });
  });

  document.querySelectorAll(".left-button").forEach((btn) => {
    btn.addEventListener("click", function () {
      if (currentIndex > 0) {
        showImage(currentIndex - 1);
      }
    });
  });
});

document.addEventListener("DOMContentLoaded", function () {
  const fileInputs = document.querySelectorAll('input[type="file"]'); // Select all file inputs

  fileInputs.forEach(fileInput => {
      fileInput.addEventListener("change", function (event) {
          const file = event.target.files[0]; // Get the selected file
          if (!file) return;

          const maxSize = 10 * 1024 * 1024; // 10MB in bytes

          if (file.size > maxSize) {
              alert("Image size exceeds 10MB. Please select a smaller file.");
              
              // **Properly clear the input**
              fileInput.value = ""; 
              
              // **Extra Compatibility Trick**
              fileInput.type = "text"; 
              fileInput.type = "file"; 
          }
      });
  });
});


document.querySelectorAll('.tab-btn').forEach(button => {
  button.addEventListener('click', () => {
      document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
      document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));

      button.classList.add('active');
      document.querySelector(`.${button.dataset.target}`).classList.add('active');
  });
});
