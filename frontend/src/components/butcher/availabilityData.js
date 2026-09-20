export const initialSchedule = [
  { day: 'Saturday', enabled: true, start: '09:00', end: '18:00' },
  { day: 'Sunday', enabled: true, start: '10:00', end: '17:00' },
  { day: 'Monday', enabled: false, start: '09:00', end: '18:00' },
  { day: 'Tuesday', enabled: true, start: '09:00', end: '18:00' },
  { day: 'Wednesday', enabled: true, start: '10:00', end: '17:00' },
  { day: 'Thursday', enabled: true, start: '09:00', end: '18:00' },
  { day: 'Friday', enabled: false, start: '09:00', end: '18:00' },
];

export const initialSpecialDates = [
  { id: 1, date: 'June 7, 2026', name: 'Qurbani Day', hours: '9:00 AM – 8:00 PM', type: 'Extra availability' },
  { id: 2, date: 'June 8, 2026', name: 'Post-Qurbani break', hours: 'Unavailable', type: 'Fully unavailable' },
  { id: 3, date: 'June 20, 2026', name: 'Family event', hours: '10:00 AM – 2:00 PM', type: 'Different hours' },
];