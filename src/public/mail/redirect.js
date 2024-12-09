'use strict';

document.addEventListener('DOMContentLoaded', () => {
  const buttons = document.querySelectorAll('.purchase-button a');

  buttons.forEach((button) => {
    button.addEventListener('click', function (event) {
      // Add logic for handling purchase click
      console.log('Button clicked:', this.href);
    });
  });
});
