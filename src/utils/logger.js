const isDev = typeof __DEV__ !== 'undefined' ? __DEV__ : true;

const safeJson = value => {
  try {
    return JSON.stringify(value, null, 2);
  } catch (error) {
    return String(value);
  }
};

export const logDebug = (scope, message, data) => {
  if (!isDev) {
    return;
  }

  if (typeof data === 'undefined') {
    console.log(`[${scope}] ${message}`);
    return;
  }

  console.log(`[${scope}] ${message}`, safeJson(data));
};

export const logError = (scope, message, error) => {
  if (!isDev) {
    return;
  }

  const normalized =
    error instanceof Error
      ? {message: error.message, stack: error.stack}
      : error;

  console.error(`[${scope}] ${message}`, safeJson(normalized));
};
