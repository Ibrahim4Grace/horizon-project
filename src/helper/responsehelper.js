/**
 * Sends a formatted JSON response with a standard structure.
 *
 * @param {object} res - The Express response object.
 * @param {number} statusCode - The HTTP status code to send.
 * @param {string} message - The message to include in the response.
 * @param {any} data - The data to include in the response.
 * @param {string} accessToken - Optional access token to include in the response.
 * @param {string} refreshToken - Optional refresh token to include in the response.
 */
export const sendJsonResponse = (
  res,
  statusCode,
  message,
  data,
  accessToken,
  refreshToken
) => {
  // Format data if it's an array of documents
  const formattedData = Array.isArray(data)
    ? data.map((item) => {
        if (item.toObject) {
          // If it's a Mongoose document, convert to plain object
          const obj = item.toObject();
          // Format dates to be more readable if needed
          if (obj.createdAt)
            obj.createdAt = new Date(obj.createdAt).toISOString();
          if (obj.updatedAt)
            obj.updatedAt = new Date(obj.updatedAt).toISOString();
          return obj;
        }
        return item;
      })
    : data;

  const responsePayload = {
    status: statusCode >= 200 && statusCode < 300 ? 'success' : 'error',
    message,
    status_code: statusCode,
    data: formattedData,
  };

  if (accessToken) {
    responsePayload.access_token = accessToken;
  }

  if (refreshToken) {
    responsePayload.refresh_token = refreshToken;
  }

  // Set proper content type and formatting
  res
    .status(statusCode)
    .set('Content-Type', 'application/json')
    .send(JSON.stringify(responsePayload, null, 2));
};
