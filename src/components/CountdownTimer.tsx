import React, { useEffect, useState } from "react";
import {
  getNextDailyBackupTime,
  getNextHourlyUpdateTime,
  getCountdown,
} from "@/src/lib/utils/countdownTimer";

export function CountdownTimer() {
  const [dailyCountdown, setDailyCountdown] = useState("");
  const [hourlyCountdown, setHourlyCountdown] = useState("");

  useEffect(() => {
    const updateCountdowns = () => {
      setDailyCountdown(getCountdown(getNextDailyBackupTime()));
      setHourlyCountdown(getCountdown(getNextHourlyUpdateTime()));
    };

    const intervalId = setInterval(updateCountdowns, 1000);
    updateCountdowns();

    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className="space-y-2">
      <div>Next daily backup in: {dailyCountdown}</div>
      <div>Next hourly update in: {hourlyCountdown}</div>
    </div>
  );
}
