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
