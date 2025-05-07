export const domainExpiryCheck = (req, res, next) => {
  const today = new Date();

  // Expiry date: January 1, 2026 at 12:00 AM
  const expiryDate = new Date('2026-01-01T00:00:00');

  // Block access if current time is equal to or after the expiry date
  if (today >= expiryDate) {
      return res.status(503).send(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Domain Expired</title>
            <style>
              body {
                font-family: Arial, sans-serif;
                text-align: center;
                padding: 50px;
                background-color: #f8f9fa;
              }
              .container {
                max-width: 600px;
                margin: 0 auto;
                background-color: white;
                padding: 30px;
                border-radius: 5px;
                box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
              }
              h1 {
                color: #dc3545;
              }
              p {
                font-size: 18px;
                line-height: 1.6;
                color: #343a40;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <h1>Domain Expired</h1>
              <p>Your Vercel vsp shared domain has expired. Please contact the administrator to renew it.</p>
              <p>If you are the administrator, please renew the domain to restore service.</p>
            </div>
          </body>
        </html>
      `);
    }
  
    next();
  };
  