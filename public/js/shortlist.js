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