// Calendar utility functions for Apple Calendar (.ics) and Google Calendar

export interface CalendarEvent {
  title: string;
  description: string;
  location?: string;
  startTime: Date;
  endTime: Date;
  coachName: string;
}

// Generate .ics file content for Apple Calendar
export const generateICSFile = (event: CalendarEvent): string => {
  const formatDate = (date: Date): string => {
    return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
  };

  const uid = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}@diamondpro.app`;

  const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//DiamondPro//Booking//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH
BEGIN:VEVENT
UID:${uid}
DTSTART:${formatDate(event.startTime)}
DTEND:${formatDate(event.endTime)}
SUMMARY:${event.title}
DESCRIPTION:${event.description.replace(/\n/g, '\\n')}
${event.location ? `LOCATION:${event.location}` : ''}
STATUS:CONFIRMED
SEQUENCE:0
END:VEVENT
END:VCALENDAR`;

  return icsContent;
};

// Download .ics file for Apple Calendar
export const downloadICSFile = (event: CalendarEvent): void => {
  const icsContent = generateICSFile(event);
  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `diamondpro-session-${event.startTime.toISOString().split('T')[0]}.ics`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(link.href);
};

// Generate Google Calendar URL
export const generateGoogleCalendarUrl = (event: CalendarEvent): string => {
  const formatGoogleDate = (date: Date): string => {
    return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
  };

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: event.title,
    details: event.description,
    dates: `${formatGoogleDate(event.startTime)}/${formatGoogleDate(event.endTime)}`,
    ...(event.location && { location: event.location }),
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
};

// Open Google Calendar in new tab
export const openGoogleCalendar = (event: CalendarEvent): void => {
  const url = generateGoogleCalendarUrl(event);
  window.open(url, '_blank', 'noopener,noreferrer');
};

// Format time for display
export const formatTimeSlot = (time: string): string => {
  const [hours, minutes] = time.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
};

// Generate time slots for a given duration
export const generateTimeSlots = (
  startHour: number = 8,
  endHour: number = 20,
  intervalMinutes: number = 30
): string[] => {
  const slots: string[] = [];
  for (let hour = startHour; hour < endHour; hour++) {
    for (let minute = 0; minute < 60; minute += intervalMinutes) {
      slots.push(`${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`);
    }
  }
  return slots;
};
