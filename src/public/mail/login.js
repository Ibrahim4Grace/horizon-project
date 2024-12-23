'use strict';

document.addEventListener('DOMContentLoaded', function () {
  // Function to refresh the token periodically
  async function refreshToken() {
    try {
      const response = await fetch('/token/refresh', {
        credentials: 'include',
      });
      const data = await response.json();
      if (response.ok && data.success) {
        console.log('Token refreshed successfully');
      } else {
        console.error('Failed to refresh token:', data.message);
        // Optionally, redirect to login if refresh fails
        window.location.href = '/user/login';
      }
    } catch (error) {
      console.error('Error during token refresh:', error);
      // Optionally, redirect to login if there's an error
      window.location.href = '/user/login';
    }
  }

  // Call refreshToken periodically before the access token expires
  setInterval(refreshToken, 2 * 60 * 1000); // 14 minutes (1 minute before expiration)

  const loginForm = document.getElementById('loginForm');

  loginForm.addEventListener('submit', async function (event) {
    event.preventDefault();

    const loginUrl = loginForm.getAttribute('data-url');
    const submitButton = document.getElementById('submitButton');

    submitButton.innerHTML =
      '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Submitting...';
    submitButton.disabled = true;

    try {
      const formData = Object.fromEntries(new FormData(loginForm));
      const response = await fetch(loginUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (response.ok && data.success) {
        window.location.href = data.redirectUrl;
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
      submitButton.innerHTML = 'Sign Up';
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
