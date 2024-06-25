import React, { useCallback, useState, useEffect } from "react";
import moment from "moment";

interface CountdownTimerProps {
  targetDate: string;
  header?: string;
  textColor?: string;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export const CountdownTimer: React.FC<CountdownTimerProps> = ({
  targetDate,
  header,
  textColor,
}) => {
  const calculateTimeLeft = useCallback((): TimeLeft => {
    const now = moment();
    const target = moment(targetDate);
    const difference = target.diff(now);

    let timeLeft: TimeLeft = {
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
    };

    if (difference > 0) {
      timeLeft = {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      };
    }

    return timeLeft;
  }, [targetDate]);

  const [timeLeft, setTimeLeft] = useState<TimeLeft>(calculateTimeLeft());

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate, calculateTimeLeft]);

  return (
    <div
      className={`flex flex-col items-center`}
      style={{ color: textColor ? textColor : "black" }}
    >
      {header && <h2 className="text-sm font-bold mb-2">{header}</h2>}
      <div className="text-sm font-bold">
        {timeLeft.days}d {timeLeft.hours}h {timeLeft.minutes}m{" "}
        {timeLeft.seconds}s
      </div>
    </div>
  );
};
