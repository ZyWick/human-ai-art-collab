export async function withRetry(fn, retries = 3, label = "operation") {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      if (err.code === "ECONNRESET" && attempt < retries) {
        console.warn(`[${label}] ECONNRESET on attempt ${attempt}. Retrying...`);
        await new Promise(res => setTimeout(res, 1000));
      } else {
        throw err;
      }
    }
  }
}
