'use strict';

document.addEventListener('DOMContentLoaded', function () {
  const pinForm = document.getElementById('pinForm');
  console.log('pinForm Form:', pinForm);

  pinForm.addEventListener('submit', async function (event) {
    event.preventDefault();
    console.log('pinForm Submitted');

    const pinUrl = pinForm.getAttribute('data-url');
    const submitButton = document.getElementById('submitButton');
    console.log('Register URL:', pinUrl);

    submitButton.innerHTML =
      '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Creating...';
    submitButton.disabled = true;

    try {
      const formData = Object.fromEntries(new FormData(pinForm));
      const response = await fetch(pinUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      console.log('Response Data:', data);
      if (response.ok && data.success) {
        alert(data.message);
        console.log('Redirecting to:', data.pinUrl);
        window.location.href = data.pinUrl;
      } else {
        console.log('Error Response:', response, data.message);
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
      submitButton.innerHTML = 'Add pin';
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
