function showTab(tabId) {
  document.querySelectorAll(".tab-content").forEach(content => content.classList.remove("active"));
  document.getElementById(tabId).classList.add("active");

  document.querySelectorAll(".tab").forEach(tab => tab.classList.remove("active"));
  document.querySelector(`[data-tab='${tabId}']`).classList.add("active");
}