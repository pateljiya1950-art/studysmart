import { useEffect, useState } from "react";
import Calendar from "react-calendar";
import { getCalendarEvents } from "../../services/calendarApi";
import "./CalendarWidget.css";

export default function CalendarWidget() {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    getCalendarEvents().then(setEvents);
  }, []);

  const tileContent = ({ date }) => {
    const dayEvents = events.filter(
      e => new Date(e.eventDate).toDateString() === date.toDateString()
    );

    return dayEvents.map((e, i) => (
      <div key={i} className={`event ${e.eventType.toLowerCase()}`}>
        {e.title}
      </div>
    ));
  };

  return (
    <div className="calendar-card">
      <h4>Calendar</h4>
      <Calendar tileContent={tileContent} />
    </div>
  );
}
