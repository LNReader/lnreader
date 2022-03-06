export const convertDateToISOString = (SQLiteDate: string) => {
  const dateParts: string[] = SQLiteDate.split('-');

  const JSDate = new Date(
    Number(dateParts[0]),
    Number(dateParts[1]) - 1,
    Number(dateParts[2].substring(0, 2)),
  );

  const date = JSDate.toISOString();

  return date;
};
