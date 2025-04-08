document.getElementById("image").addEventListener("change", function(event) {
  const preview = document.getElementById("previewImage");
  const file = event.target.files[0];
  if (file) {
    preview.src = URL.createObjectURL(file);
    preview.style.display = "block";
  }
});