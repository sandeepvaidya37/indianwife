

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




document.querySelectorAll('.tab-btn').forEach(button => {
  button.addEventListener('click', () => {
      document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
      document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));

      button.classList.add('active');
      document.querySelector(`.${button.dataset.target}`).classList.add('active');
  });
});


document.addEventListener("DOMContentLoaded", function () {
  document.getElementById("sendInterest").addEventListener("click", function () {
      toggleRequest(this, "/toggle-interest", "interestCount");
  });

  document.getElementById("sendSuperInterest").addEventListener("click", function () {
      toggleRequest(this, "/toggle-super-interest", "superInterestCount");
  });

  function toggleRequest(button, endpoint, counterId) {
      const userId = button.getAttribute("data-user-id");

      fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId })
      })
      .then(response => response.json())
      .then(data => {
          if (data.success) {
              let counter = document.getElementById(counterId);
              let count = parseInt(counter.innerText);

              if (data.action === "added") {
                  counter.innerText = count + 1;
                  button.classList.add("active");
              } else {
                  counter.innerText = count - 1;
                  button.classList.remove("active");
              }
          } else {
              alert(data.message);
          }
      })
      .catch(error => console.error("Error:", error));
  }
});

document.addEventListener("DOMContentLoaded", function () {
  const viewContactBtn = document.getElementById("viewContact");

  if (viewContactBtn) {
      viewContactBtn.addEventListener("click", async function () {
          const userId = this.getAttribute("data-user-id");

          try {
              const response = await fetch(`/deduct-contact/${userId}`, {
                  method: "POST",
                  headers: { "Content-Type": "application/json" }
              });

              const result = await response.json();

              if (result.success) {
                  // Show contact details dynamically
                  document.getElementById("userEmail").textContent = result.email;
                  document.getElementById("userPhone").textContent = result.phone;
                  document.getElementById("userAddress").textContent = result.address;

                  // Show the hidden div
                  document.getElementById("contactDetails").style.display = "block";

                  // Remove the button after successful deduction
                  this.remove();
              } else {
                  alert(result.message);
                  if (result.redirect) {
                      window.location.href = result.redirect;
                  }
              }
          } catch (error) {
              console.error("Error:", error);
              alert("Something went wrong. Please try again.");
          }
      });
  }
});
