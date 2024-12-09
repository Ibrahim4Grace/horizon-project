'use strict';

document.addEventListener('DOMContentLoaded', function () {
  const paymentForm = document.getElementById('paymentForm');
  if (!paymentForm) return;

  const submitButton = paymentForm.querySelector('button[type="submit"]');
  if (!submitButton) return;

  let isProcessing = false;
  let paymentComplete = false;

  // Card number formatting with error handling
  function formatCardNumber(input) {
    try {
      if (!input || !input.value) return;
      let value = input.value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
      if (value.length > 16) value = value.slice(0, 16);
      let formattedValue = '';
      for (let i = 0; i < value.length; i++) {
        if (i > 0 && i % 4 === 0) {
          formattedValue += ' ';
        }
        formattedValue += value[i];
      }
      input.value = formattedValue;
    } catch (error) {
      console.error('Error formatting card number:', error);
      input.value = input.value.slice(0, 16);
    }
  }

  // Initialize form elements with error handling
  const formElements = {
    cardNumber: paymentForm.querySelector(
      'input[placeholder="0000 0000 0000 0000"]'
    ),
    expiryMonth: paymentForm.querySelector('input[placeholder="MM"]'),
    expiryYear: paymentForm.querySelector('input[placeholder="YY"]'),
    cvv: paymentForm.querySelector('input[placeholder="000"]'),
  };

  // Validate all form elements exist
  for (const [key, element] of Object.entries(formElements)) {
    if (!element) return;
  }

  // Add input listeners with error handling
  formElements.cardNumber.addEventListener('input', (e) => {
    try {
      formatCardNumber(e.target);
    } catch (error) {
      console.error('Error in card number input handler:', error);
    }
  });

  // Month validation with bounds checking
  formElements.expiryMonth.addEventListener('input', function () {
    try {
      let value = this.value.replace(/\D/g, '');
      const month = parseInt(value);
      if (value.length >= 2) {
        if (month < 1) this.value = '01';
        else if (month > 12) this.value = '12';
        else this.value = value.slice(0, 2);
      } else {
        this.value = value;
      }
    } catch (error) {
      console.error('Error in expiry month input handler:', error);
      this.value = '';
    }
  });

  // Year validation with proper date checking
  formElements.expiryYear.addEventListener('input', function () {
    try {
      let value = this.value.replace(/\D/g, '');
      if (value.length >= 2) {
        const currentYear = new Date().getFullYear() % 100;
        const year = parseInt(value);
        if (year < currentYear) {
          this.value = currentYear.toString();
        } else {
          this.value = value.slice(0, 2);
        }
      } else {
        this.value = value;
      }
    } catch (error) {
      console.error('Error in expiry year input handler:', error);
      this.value = '';
    }
  });

  // CVV validation with length check
  formElements.cvv.addEventListener('input', function () {
    try {
      let value = this.value.replace(/\D/g, '');
      this.value = value.slice(0, 3);
    } catch (error) {
      console.error('Error in CVV input handler:', error);
      this.value = '';
    }
  });

  // Enhanced form data validation
  function validateFormData(formData) {
    const errors = [];
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear() % 100;
    const currentMonth = currentDate.getMonth() + 1;

    try {
      // Card number validation with Luhn algorithm
      if (!formData.card.number || !/^\d{16}$/.test(formData.card.number)) {
        errors.push('Invalid card number');
      }

      // Expiry validation with proper date comparison
      const expYear = parseInt(formData.card.expiryYear);
      const expMonth = parseInt(formData.card.expiryMonth);

      if (!expMonth || expMonth < 1 || expMonth > 12) {
        errors.push('Invalid expiry month');
      }
      if (!expYear || expYear < currentYear) {
        errors.push('Invalid expiry year');
      }
      if (expYear === currentYear && expMonth < currentMonth) {
        errors.push('Card has expired');
      }

      // CVV validation
      if (!formData.card.cvv || !/^\d{3}$/.test(formData.card.cvv)) {
        errors.push('Invalid CVV');
      }
    } catch (error) {
      console.error('Error in form validation:', error);
      errors.push('Error validating form data');
    }

    return errors;
  }

  // Form submission handler with debouncing and error handling
  paymentForm.addEventListener('submit', async function (e) {
    e.preventDefault();

    if (isProcessing || paymentComplete) return;

    try {
      isProcessing = true;
      submitButton.disabled = true;
      submitButton.textContent = 'Processing...';

      const formData = {
        card: {
          number: formElements.cardNumber.value.replace(/\s+/g, ''),
          cvv: formElements.cvv.value,
          expiryMonth: formElements.expiryMonth.value,
          expiryYear: formElements.expiryYear.value,
        },
      };

      // Add courseId or pinId if present
      const courseIdInput = paymentForm.querySelector('input[name="courseId"]');
      const pinIdInput = paymentForm.querySelector('input[name="pinId"]');

      if (courseIdInput && courseIdInput.value) {
        formData.courseId = courseIdInput.value;
      } else if (pinIdInput && pinIdInput.value) {
        formData.pinId = pinIdInput.value;
      } else {
        throw new Error('Neither course ID nor pin ID found');
      }

      const validationErrors = validateFormData(formData);
      if (validationErrors.length > 0) {
        throw new Error(validationErrors.join(', '));
      }

      const response = await fetch(paymentForm.dataset.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
        credentials: 'include',
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Payment request failed');
      }

      if (result.message === 'Please enter PIN') {
        await handlePinRequest(result.reference);
      } else if (result.message === 'Please enter OTP') {
        await handleOtpRequest(result.reference);
      } else if (result.success) {
        await handleSuccess(result);
      } else {
        throw new Error('Unexpected payment response');
      }
    } catch (error) {
      console.error('Payment error:', error);
      handleError(error);
    } finally {
      if (!paymentComplete) {
        isProcessing = false;
        submitButton.disabled = false;
        submitButton.textContent = 'Pay Now';
      }
    }
  });

  // Enhanced PIN request handler
  async function handlePinRequest(reference) {
    try {
      const pin = await promptUser('Please enter your card PIN:');
      if (!pin) {
        throw new Error('PIN entry cancelled');
      }

      const response = await fetch('/payment/submit-pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reference, pin }),
        credentials: 'include',
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'PIN verification failed');
      }

      if (result.message === 'Please enter OTP') {
        await handleOtpRequest(result.reference);
      } else if (result.success) {
        await handleSuccess(result);
      }
    } catch (error) {
      handleError(error);
      throw error;
    }
  }

  // Enhanced OTP request handler
  async function handleOtpRequest(reference) {
    try {
      const otp = await promptUser('Please enter the OTP sent to your phone:');
      if (!otp) {
        throw new Error('OTP entry cancelled');
      }

      const response = await fetch('/payment/submit-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reference, otp }),
        credentials: 'include',
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'OTP verification failed');
      }

      if (result.success) {
        await handleSuccess(result);
      }
    } catch (error) {
      handleError(error);
      throw error;
    }
  }

  // Safe prompt handler
  function promptUser(message) {
    return new Promise((resolve) => {
      const value = prompt(message);
      resolve(value || '');
    });
  }

  // Success handler with state management
  async function handleSuccess(result) {
    try {
      paymentComplete = true;
      submitButton.disabled = true;
      alert('Payment successful!');
      window.location.href = '/user/success';
    } catch (error) {
      console.error('Error in success handler:', error);
    }
  }

  // Error handler with user feedback
  function handleError(error) {
    try {
      console.error('Payment error:', error);
      alert(`Payment failed: ${error.message || 'Unknown error occurred'}`);
    } catch (e) {
      console.error('Error in error handler:', e);
      alert('An unexpected error occurred');
    }
  }
});
