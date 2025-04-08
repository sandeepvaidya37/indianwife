function switchPlan(plan) {
  document.querySelectorAll('.plan-container').forEach(container => {
      container.classList.remove('active');
  });
  document.getElementById(plan).classList.add('active');
}
document.addEventListener("DOMContentLoaded", function () {
    const buttons = document.querySelectorAll(".plan-switcher button");

    buttons.forEach(button => {
        button.addEventListener("click", function () {
            // Remove 'active' class from all buttons
            buttons.forEach(btn => btn.classList.remove("active"));

            // Add 'active' class to the clicked button
            this.classList.add("active");
        });
    });
});

document.addEventListener("DOMContentLoaded", function () {
  const promoInput = document.getElementById("promo-code");
  const applyButton = document.getElementById("apply-promo");
  const priceElements = document.querySelectorAll(".top-right");
  const amountInput = document.querySelectorAll("#amount");
  const promoInputs = document.querySelectorAll(".dipromocode"); 
    
    

  let promoApplied = false; // Flag to track if promo is already applied

  if (!promoInput || !applyButton || !amountInput || priceElements.length === 0) {
    console.error("One or more required elements not found in the DOM.");
    return;
  }

  applyButton.addEventListener("click", async function () {
    console.log("Apply button clicked");

    if (promoApplied) {
      alert("Promo code has already been applied.");
      return;
    }

    const promoCode = promoInput.value.trim();
    if (!promoCode) {
      alert("Please enter a promo code.");
      return;
    }

    try {
      const response = await fetch(`/api/promocode/${promoCode}`);
      const data = await response.json();
      console.log("Response from server:", response, data);

      if (response.ok && data.discount) {
        let totalPrice = 0;
        const isBASPromo = promoCode.startsWith("BAS");

        promoInputs.forEach(input => {
          input.value = promoInput.value; 
      });

        priceElements.forEach((el, index) => {
          let originalPrice = parseFloat(el.getAttribute("data-original-price"));

          if (isNaN(originalPrice)) {
            console.error("Invalid original price for element:", el);
            return;
          }

          if (isBASPromo && index > 0) return; // Apply only to first plan if "BAS"

          let discountAmount = (originalPrice * data.discount) / 100;
          let newPrice = Math.max(0, originalPrice - discountAmount);

          el.innerHTML = `&#8377; ${newPrice.toFixed(2)}`;
          el.setAttribute("data-discounted-price", newPrice.toFixed(2));
          el.setAttribute("data-original-price", originalPrice); // Preserve original price

          totalPrice += newPrice;
        });

        amountInput.forEach((el, index) => {
          let originalAmount = parseFloat(el.getAttribute("data-original-value") || el.value);

          if (isNaN(originalAmount)) {
            console.error("Invalid original amount for element:", el);
            return;
          }

          if (isBASPromo && index > 0) return; // Apply only to first plan if "BAS"

          let discountAmount = (originalAmount * data.discount) / 100;
          let newAmount = Math.max(0, originalAmount - discountAmount);

          el.value = newAmount.toFixed(2);
          el.setAttribute("data-original-value", originalAmount); // Preserve original value
        });

        console.log("Total Price after discount:", totalPrice);

        promoApplied = true; // Mark promo as applied

      } else {
        alert("Invalid promo code.");
      }
    } catch (error) {
      console.error("Error applying promo code:", error);
      alert("Failed to apply promo code. Try again.");
    }
  });
});


