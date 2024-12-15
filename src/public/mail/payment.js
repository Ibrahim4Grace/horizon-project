('use strict');

document.addEventListener('DOMContentLoaded', function () {
  const paymentForm = document.getElementById('paymentForm');
  if (!paymentForm) return;

  const cardFields = document.getElementById('cardFields');
  const transferFields = document.getElementById('transferFields');
  const submitButton = paymentForm.querySelector('button[type="submit"]');
  const cardText = submitButton.querySelector('.card-text');
  const transferText = submitButton.querySelector('.transfer-text');

  // Form elements for card payment
  const formElements = {
    cardNumber: paymentForm.querySelector(
      'input[placeholder="0000 0000 0000 0000"]'
    ),
    expiryMonth: paymentForm.querySelector('input[placeholder="MM"]'),
    expiryYear: paymentForm.querySelector('input[placeholder="YY"]'),
    cvv: paymentForm.querySelector('input[placeholder="000"]'),
  };

  let isProcessing = false;
  let paymentComplete = false;

  // Handle payment method toggle
  document.querySelectorAll('input[name="paymentMethod"]').forEach((radio) => {
    radio.addEventListener('change', (e) => {
      if (e.target.value === 'transfer') {
        cardFields.classList.add('hidden');
        transferFields.classList.remove('hidden');
        cardText.classList.add('hidden');
        transferText.classList.remove('hidden');
      } else if (e.target.value === 'card') {
        transferFields.classList.add('hidden');
        cardFields.classList.remove('hidden');
        transferText.classList.add('hidden');
        cardText.classList.remove('hidden');
      }
    });
  });

  // Card number formatting
  formElements.cardNumber.addEventListener('input', function () {
    formatCardNumber(this);
  });

  // Validation functions
  function validateLuhn(cardNumber) {
    let sum = 0;
    let isEven = false;

    for (let i = cardNumber.length - 1; i >= 0; i--) {
      let digit = parseInt(cardNumber[i], 10);
      if (isEven) {
        digit *= 2;
        if (digit > 9) {
          digit -= 9;
        }
      }
      sum += digit;
      isEven = !isEven;
    }
    return sum % 10 === 0;
  }

  function formatCardNumber(input) {
    try {
      if (!input || !input.value) return;
      let value = input.value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');

      if (value.length > 19) value = value.slice(0, 19);

      let formattedValue = '';
      for (let i = 0; i < value.length; i++) {
        if (i > 0 && i % 4 === 0) {
          formattedValue += ' ';
        }
        formattedValue += value[i];
      }
      input.value = formattedValue;

      const isValid = validateLuhn(value) && value.length >= 16;
      input.style.borderColor = isValid ? '#4CAF50' : '#ddd';
    } catch (error) {
      console.error('Error formatting card number:', error);
      input.value = input.value.slice(0, 19);
    }
  }

  function validateFormData(formData) {
    const errors = [];
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear() % 100;
    const currentMonth = currentDate.getMonth() + 1;

    if (formData.paymentMethod === 'card') {
      const cardNumber = formData.card.number.replace(/\s+/g, '');
      if (!cardNumber || cardNumber.length < 16 || cardNumber.length > 19) {
        errors.push('Please enter a valid 16-digit card number');
      } else if (!validateLuhn(cardNumber)) {
        errors.push('Invalid card number');
      }

      if (!formData.card.cvv || !/^\d{3}$/.test(formData.card.cvv)) {
        errors.push('Please enter a valid 3-digit CVV');
      }

      const expMonth = parseInt(formData.card.expiryMonth);
      if (!expMonth || expMonth < 1 || expMonth > 12) {
        errors.push('Please enter a valid month (01-12)');
      }

      const expYear = parseInt(formData.card.expiryYear);
      if (!expYear || expYear < currentYear) {
        errors.push('Card has expired');
      } else if (expYear === currentYear && expMonth < currentMonth) {
        errors.push('Card has expired');
      }
    }

    return errors;
  }

  // Form submission handler
  paymentForm.addEventListener('submit', async function (e) {
    e.preventDefault();

    if (isProcessing || paymentComplete) return;

    try {
      isProcessing = true;
      submitButton.disabled = true;

      const paymentMethod = paymentForm.querySelector(
        'input[name="paymentMethod"]:checked'
      ).value;
      submitButton.textContent =
        paymentMethod === 'transfer'
          ? 'Generating Transfer Details...'
          : 'Processing...';

      let formData = {
        paymentMethod,
        pinId: paymentForm.querySelector('input[name="pinId"]')?.value,
        courseId: paymentForm.querySelector('input[name="courseId"]')?.value,
        amount: paymentForm.querySelector('input[name="amount"]').value,
      };

      if (paymentMethod === 'card') {
        formData.card = {
          number: formElements.cardNumber.value.replace(/\s+/g, ''),
          cvv: formElements.cvv.value,
          expiryMonth: formElements.expiryMonth.value,
          expiryYear: formElements.expiryYear.value,
        };

        const validationErrors = validateFormData(formData);
        if (validationErrors.length > 0) {
          throw new Error(validationErrors.join(', '));
        }

        const response = await fetch('/payment/charge-card', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
          credentials: 'include',
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(
            result.message || 'Payment failed. Please try again.'
          );
        }

        if (result.message === 'Please enter PIN') {
          await handlePinRequest(result.reference);
        } else if (result.message === 'Please enter OTP') {
          await handleOtpRequest(result.reference);
        } else if (result.success) {
          await handleSuccess(result);
        }
      } else if (paymentMethod === 'transfer') {
        const response = await fetch('/payment/initialize', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
          credentials: 'include',
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(
            result.message || 'Transfer initiation failed. Please try again.'
          );
        }

        if (result.authorization_url) {
          window.location.href = result.authorization_url;
        } else {
          console.error('Invalid Paystack response:', result);
          throw new Error(
            'Unable to process transfer request. Please try again.'
          );
        }
      } else {
        throw new Error('Invalid payment method selected');
      }
    } catch (error) {
      console.error('Payment error:', error);
      handleError(error);
    } finally {
      if (!paymentComplete) {
        isProcessing = false;
        submitButton.disabled = false;
        const paymentMethod = paymentForm.querySelector(
          'input[name="paymentMethod"]:checked'
        ).value;
        submitButton.textContent =
          paymentMethod === 'transfer'
            ? 'Generate Transfer Details'
            : 'Pay Now';
      }
    }
  });

  // PIN and OTP handlers
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

  function promptUser(message) {
    return new Promise((resolve) => {
      const value = prompt(message);
      resolve(value || '');
    });
  }

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
