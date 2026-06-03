export const generateOP = () => {
  const date = new Date();

  const year = date.getFullYear();

  const random = Math.floor(
    1000 + Math.random() * 9000
  );

  return `OP-${year}-${random}`;
};