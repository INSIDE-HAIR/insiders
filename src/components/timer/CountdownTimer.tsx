import { useEffect, useState } from "react";
import moment from "moment-timezone";

type CountdownTimerProps = {
  targetDate: string; // La fecha objetivo en formato ISO 8601
  header?: string;
};

const CountdownTimer: React.FC<CountdownTimerProps> = ({
  targetDate,
  header,
}) => {
  const calculateTimeLeft = () => {
    const now = moment();
    const target = moment(targetDate);
    const difference = target.diff(now);

    let timeLeft = {
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
  };

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  return (
    <div className="flex flex-col items-center">
      {header && <h2 className="text-sm font-bold mb-2">{header}</h2>}
      <div className="text-sm font-bold">
        {timeLeft.days}d {timeLeft.hours}h {timeLeft.minutes}m{" "}
        {timeLeft.seconds}s
      </div>
    </div>
  );
};

export default CountdownTimer;
