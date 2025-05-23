'use strict';

document.addEventListener('DOMContentLoaded', function () {
  const contactForm = document.getElementById('replyContactForm');

  contactForm.addEventListener('submit', async function (event) {
    event.preventDefault();

    const contactUrl = contactForm.getAttribute('data-url');
    const submitButton = document.getElementById('submitButton');

    submitButton.innerHTML =
      '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Sending...';
    submitButton.disabled = true;

    try {
      const formData = Object.fromEntries(new FormData(contactForm));
      const response = await fetch(contactUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok && data.redirectUrl) {
        alert(data.message);
        window.location.href = data.redirectUrl;
      } else if (data.message) {
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
      submitButton.innerHTML = 'Send message';
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

// Handle delete button clicks
$("button[aria-label='Delete']").click(function (e) {
  const row = $(this).closest('tr');
  const contactId = row.data('contact-id');

  if (confirm('Are you sure you want to delete this message?')) {
    $.ajax({
      url: `/admin/inbox-message/${contactId}`,
      method: 'DELETE',
      success: function (response) {
        row.remove();
        showNotification('Message deleted successfully', 'success');
      },
      error: function (xhr, status, error) {
        showNotification('Failed to delete message: ' + error, 'error');
      },
    });
  }
});
