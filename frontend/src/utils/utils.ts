export const cleanAuthErrorMessage = (message: string) => {
  const regex = /auth\/(.*?)\./;
  const text = regex.exec(message);
  let cleanErrorMsg = "";
  if (text !== null) {
    const extractedText = text[1];
    const withoutClosingParenthesis = extractedText.replace(/\)/g, "");
    cleanErrorMsg = withoutClosingParenthesis;
  }
  return cleanErrorMsg;
};

// Friendly message for a Firebase auth error, with a fallback when the code isn't in AuthErrors.
export const authErrorMessage = (error: unknown, messages: Record<string, string>) => {
  const message = error instanceof Error ? error.message : String(error);
  return messages[cleanAuthErrorMessage(message)] || "Something went wrong. Please try again.";
};
