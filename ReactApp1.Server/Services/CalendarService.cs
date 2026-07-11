using ReactApp1.Server.Models;

namespace ReactApp1.Server.Services
{
    public static class CalendarService
    {
        public static CalendarEvent CreateEvent(
            int userId,
            string title,
            string type,
            DateTime date,
            int createdBy
        )
        {
            return new CalendarEvent
            {
                UserId = userId,
                Title = title,
                EventType = type,
                EventDate = DateOnly.FromDateTime(date),
                CreatedBy = createdBy
            };
        }

        public static Notification CreateNotification(
            int userId,
            string message
        )
        {
            return new Notification
            {
                UserId = userId,
                Message = message
            };
        }
    }
}
