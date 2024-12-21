'use strict';

document.addEventListener('DOMContentLoaded', function () {
  const broadCastForm = document.getElementById('broadCastForm');

  broadCastForm.addEventListener('submit', async function (event) {
    event.preventDefault();

    const contactUrl = broadCastForm.getAttribute('data-url');
    const submitButton = document.getElementById('submitButton');

    // Using the correct ID from your HTML
    const subjectInput = document.getElementById('subject');
    const messageTextarea = document.querySelector('textarea[name="message"]');

    submitButton.innerHTML =
      '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Sending...';
    submitButton.disabled = true;

    const emailData = {
      subject: subjectInput.value.trim(),
      message: messageTextarea.value.trim(),
    };

    try {
      const response = await fetch(contactUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(emailData),
      });

      const data = await response.json();

      if (response.ok && data.redirectUrl) {
        alert(data.message);
        window.location.href = data.redirectUrl;
      } else {
        // Handle error messages
        if (data.message) {
          const generalErrorElement = document.getElementById('generalError');
          if (generalErrorElement) {
            generalErrorElement.textContent = data.message;
          } else {
            alert(data.message); // Fallback if no error element exists
          }
        }

        if (data.errors) {
          data.errors.forEach((error) => {
            const fieldName = error.path[0];
            const errorElement = document.getElementById(`${fieldName}Error`);
            if (errorElement) {
              errorElement.textContent = error.message;
            }
          });
        }
      }
    } catch (error) {
      console.error('Error:', error);
      alert('An error occurred while processing your request.');
    } finally {
      submitButton.innerHTML = 'Send message';
      submitButton.disabled = false;
    }
  });

  // Clear errors on input
  const inputFields = document.querySelectorAll('input, textarea');
  inputFields.forEach((field) => {
    field.addEventListener('input', () => {
      const errorElement = document.getElementById(`${field.name}Error`);
      if (errorElement) {
        errorElement.textContent = '';
      }

      const generalErrorElement = document.getElementById('generalError');
      if (generalErrorElement) {
        generalErrorElement.textContent = '';
      }
    });
  });
});

// Handle delete button clicks
$("button[aria-label='Delete']").click(function (e) {
  const row = $(this).closest('tr');
  const broadcastId = row.data('broadcast-id');

  if (confirm('Are you sure you want to delete this message?')) {
    $.ajax({
      url: `/admin/sent-message/${broadcastId}`,
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
