import dayjs from 'dayjs';

export const parseRelativeDate = (date: string) => {
  let dateUpload;

  if (date.includes('ago')) {
    const timeAgo = Number(date.match(/\d+/)?.[0]);
    dateUpload = new Date();

    if (timeAgo) {
      if (date.includes('hours ago') || date.includes('hour ago')) {
        dateUpload.setHours(dateUpload.getHours() - timeAgo);
      }

      if (date.includes('days ago') || date.includes('day ago')) {
        dateUpload.setDate(dateUpload.getDate() - timeAgo);
      }

      if (date.includes('months ago') || date.includes('month ago')) {
        dateUpload.setMonth(dateUpload.getMonth() - timeAgo);
      }
    }
  } else {
    dateUpload = dayjs(date, 'MMM DD, YYYY');
  }

  dateUpload = dayjs(dateUpload).unix();

  return dateUpload;
};
