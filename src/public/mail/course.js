'use strict';

document.addEventListener('DOMContentLoaded', function () {
  const courseForm = document.getElementById('courseForm');
  console.log('courseForm Form:', courseForm);

  courseForm.addEventListener('submit', async function (event) {
    event.preventDefault();
    console.log('courseForm Submitted');

    const registerUrl = courseForm.getAttribute('data-url');
    const submitButton = document.getElementById('submitButton');
    console.log('Register URL:', registerUrl);

    submitButton.innerHTML =
      '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Creating...';
    submitButton.disabled = true;

    try {
      const formData = Object.fromEntries(new FormData(courseForm));
      const response = await fetch(registerUrl, {
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
        console.log('Redirecting to:', data.courseUrl);
        window.location.href = data.courseUrl;
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
      submitButton.innerHTML = 'Add course';
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
