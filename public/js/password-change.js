document.addEventListener("DOMContentLoaded", function () {
  const password1 = document.getElementById("email");
  const password2 = document.getElementById("password");
  const changePassBtn = document.getElementById("pass-btn");
  
  function validatePasswords() {
      if (password1.value === password2.value && password1.value !== "") {
          changePassBtn.disabled = false;
      } else {
          changePassBtn.disabled = true;
      }
  }
  
  password1.addEventListener("input", validatePasswords);
  password2.addEventListener("input", validatePasswords);
  
  // Function to toggle password visibility
  window.togglePassword = function() {
      if (password2.type === "password") {
          password2.type = "text";
      } else {
          password2.type = "password";
      }
  }
  
  // Disable button initially
  changePassBtn.disabled = true;
});