export function errorResponse(res, status, message) {
  return res.status(status).json({ error: message });
}

export function logError(context, error) {
  if (process.env.NODE_ENV === 'production') {
    console.error(`[${context}]`, error?.message ?? error);
  } else {
    console.error(`[${context}]`, error);
  }
}