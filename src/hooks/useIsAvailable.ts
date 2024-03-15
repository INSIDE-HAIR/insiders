import { useState, useEffect } from 'react';
import moment from 'moment-timezone';

const useIsAvailable = (isActive: boolean, startDateTime: string, endDateTime: string, timezone = 'Europe/Madrid') => {
  const [isAvailable, setIsAvailable] = useState(false);

  useEffect(() => {
    // Función para chequear la disponibilidad
    const checkAndUpdateAvailability = () => {
      if (!isActive) {
        setIsAvailable(false);
        return;
      }

      const now = moment.tz(moment(), timezone);
      const startDate = startDateTime ? moment.tz(startDateTime, timezone) : null;
      const endDate = endDateTime ? moment.tz(endDateTime, timezone) : null;

      const isCurrentlyAvailable = () => {
        if (!startDate && !endDate) return true;
        if (startDate && !endDate) return now.isSameOrAfter(startDate);
        if (!startDate && endDate) return now.isSameOrBefore(endDate);
        return now.isSameOrAfter(startDate) && now.isSameOrBefore(endDate);
      };

      setIsAvailable(isCurrentlyAvailable());
    };

    // Chequear la disponibilidad inmediatamente y luego establecer un intervalo
    checkAndUpdateAvailability();
    const intervalId = setInterval(checkAndUpdateAvailability, 1000); // Cada segundo

    // Limpiar el intervalo al desmontar el componente
    return () => clearInterval(intervalId);
  }, [isActive, startDateTime, endDateTime, timezone]);

  return isAvailable;
};

export default useIsAvailable;