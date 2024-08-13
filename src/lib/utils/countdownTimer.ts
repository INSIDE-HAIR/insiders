// utils/countdownTimer.ts

import moment from "moment-timezone";

const timezone = "Europe/Madrid";

export function getCountdown(targetTime: moment.Moment): string {
  const now = moment.tz(moment(), timezone);
  const duration = moment.duration(targetTime.diff(now));

  const hours = Math.floor(duration.asHours());
  const minutes = duration.minutes();
  const seconds = duration.seconds();

  return `${hours.toString().padStart(2, "0")}:${minutes
    .toString()
    .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
}

export function getNextDailyBackupTime(): moment.Moment {
  const now = moment.tz(moment(), timezone);
  return now.clone().add(1, "day").startOf("day");
}

export function getNextHourlyUpdateTime(): moment.Moment {
  const now = moment.tz(moment(), timezone);
  return now.clone().add(1, "hour").startOf("hour");
}
