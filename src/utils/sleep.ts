export const sleep = (time: number) =>
  new Promise<void>(resolve => setTimeout(() => resolve(), time));
