function togglePassword() {
  const passwordField = document.getElementById("password");
  passwordField.type = passwordField.type === "password" ? "text" : "password";
}
document.getElementById("switch-to-otp").addEventListener("click", function() {
  document.querySelector(".login-box").style.display = "none";
  document.querySelector(".otp-verification").style.display = "flex";
});

document.getElementById("switch-to-login").addEventListener("click", function() {
  document.querySelector(".login-box").style.display = "flex";
  document.querySelector(".otp-verification").style.display = "none";
});