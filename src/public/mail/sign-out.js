'use strict';

document.addEventListener('DOMContentLoaded', () => {
  const signOutLinks = document.querySelectorAll('.signOutLink');

  signOutLinks.forEach((signOutLink) => {
    signOutLink.addEventListener('click', async function (event) {
      event.preventDefault();

      const signoutUrl = this.getAttribute('data-url');

      try {
        const response = await fetch(signoutUrl, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();
          alert('Logout successfully');
          setTimeout(() => {
            window.location.href = data.logoutRedirectUrl;
          }, 100);
        } else {
          const data = await response.json();
          alert(data.message);
        }
      } catch (error) {
        alert('An error occurred. Please try again later.');
      }
    });
  });
});
