'use strict';

document.addEventListener('DOMContentLoaded', function () {
  const otpForm = document.getElementById('otpForm');

  otpForm.addEventListener('submit', async function (event) {
    event.preventDefault();

    const registerUrl = otpForm.getAttribute('data-url');
    const submitButton = document.getElementById('submitButton');

    submitButton.innerHTML =
      '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Verifying...';
    submitButton.disabled = true;

    try {
      const formData = Object.fromEntries(new FormData(otpForm));
      const response = await fetch(registerUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        alert(data.message);

        const redirectLocation = data.redirectUrl || data.resetUrl;
        if (redirectLocation) {
          window.location.href = redirectLocation;
        }
      } else {
        if (data.message) {
          const generalErrorElement = document.getElementById('generalError');
          if (generalErrorElement) {
            generalErrorElement.textContent = data.message;
          }
        }

        const errors = data.errors || [];
        errors.forEach((error) => {
          const fieldName = error.path[0];
          const errorElement = document.getElementById(`${fieldName}Error`);
          if (errorElement) {
            errorElement.textContent = error.message;
          }
        });
      }
    } catch (error) {
      console.error('Error:', error);
      alert('An error occurred while processing your request.');
    } finally {
      submitButton.innerHTML = 'Verify account';
      submitButton.disabled = false;
    }
  });

  const inputFields = document.querySelectorAll('input');
  inputFields.forEach((inputField) => {
    inputField.addEventListener('input', () => {
      const errorElement = document.getElementById(`${inputField.name}Error`);
      if (errorElement) {
        errorElement.innerText = '';
      }

      const generalErrorElement = document.getElementById('generalError');
      if (generalErrorElement) {
        generalErrorElement.innerText = '';
      }
    });
  });
});
