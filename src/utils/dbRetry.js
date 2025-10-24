// Enhanced retry logic for Neon database queries
// Handles sleeping databases, network timeouts, and DNS failures

export const retryQuery = async (queryFn, retries = 3, delay = 2000) => {
  let lastError;

  for (let i = 0; i < retries; i++) {
    try {
      const result = await queryFn();
      return result;
    } catch (error) {
      lastError = error;

      // Check if this is a retryable error
      const isRetryable =
        (error.message && error.message.includes('Control plane request failed')) || // Sleeping database
        (error.message && error.message.includes('ENOTFOUND')) || // DNS lookup failure
        (error.message && error.message.includes('ETIMEDOUT')) || // Connection timeout
        (error.message && error.message.includes('fetch failed')) || // Network failure
        (error.message && error.message.includes('ECONNREFUSED')) || // Connection refused
        (error.sourceError && error.sourceError.code === 'UND_ERR_CONNECT_TIMEOUT'); // Undici timeout

      if (isRetryable) {
        console.log(`Database connection issue detected, retrying... (attempt ${i + 1}/${retries})`);
        console.log(`Error: ${error.message}`);

        if (i < retries - 1) {
          // Exponential backoff: 2s, 4s, 6s
          const backoffDelay = delay * (i + 1);
          await new Promise(resolve => setTimeout(resolve, backoffDelay));
          continue;
        }
      }

      // If it's not a retryable error or we're out of retries, throw
      throw error;
    }
  }

  throw lastError;
};
