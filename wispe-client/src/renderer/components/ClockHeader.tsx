import { useEffect, useState } from "react";
import { padWithZero } from "../utils/padWithZero";

export function ClockHeader() {
    const [hours, setHours] = useState(0);
    const [minutes, setMinutes] = useState(0);
    const [isPM, setPM] = useState(false);

    useEffect(() => {
        const dateInterval = setInterval(() => {
            const date = new Date();

            // 0 is special as it should display 12AM rather than 0AM
            setHours(date.getHours() === 0 ? 12 : date.getHours());
            setMinutes(date.getMinutes());
            setPM(date.getHours() > 12);
        }, 1000);

        return () => clearInterval(dateInterval);
    }, []);

    const displayedHour = isPM ? hours - 12 : hours;
    const displayedDayType = isPM ? 'PM' : 'AM';
    return <>
        <h1>{displayedHour}:{padWithZero(minutes)}{displayedDayType}</h1>
        <h2>Good Morning!</h2>
    </>;
}