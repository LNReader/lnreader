import moment from 'moment';

export const parseMadaraDate = date => {
  let releaseDate = date;

  if (date.includes('ago')) {
    let timeAgo = date;
    releaseDate = new Date();

    timeAgo = timeAgo.match(/\d+/)[0];

    if (timeAgo.includes('hours ago') || timeAgo.includes('hour ago')) {
      releaseDate.setHours(releaseDate.getHours() - timeAgo);
    }

    if (timeAgo.includes('days ago') || timeAgo.includes('day ago')) {
      releaseDate.setDate(releaseDate.getDate() - timeAgo);
    }

    if (timeAgo.includes('months ago') || timeAgo.includes('month ago')) {
      releaseDate.setMonth(releaseDate.getMonth() - timeAgo);
    }

    releaseDate = moment(releaseDate).format('LL');
  }

  return releaseDate;
};
