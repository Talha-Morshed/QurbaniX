const daysByWeekday = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

function dateOnly(value) {
  return String(value || '').slice(0, 10);
}

function displayDate(value) {
  const date = dateOnly(value);
  if (!date) return '';
  const [year, month, day] = date.split('-').map(Number);
  return new Date(year, month - 1, day).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function formatTime(value) {
  return value ? String(value).slice(0, 5) : '';
}

export function availabilityFromApi(data) {
  const configuredDays = new Map((data.schedule || []).map((item) => [
    Number(item.weekday),
    item,
  ]));
  const dailyCapacity = Number(data.daily_capacity) || 5;
  const weekOrder = [6, 0, 1, 2, 3, 4, 5];
  const schedule = weekOrder.map((weekday) => {
    const item = configuredDays.get(weekday);
    return {
      weekday,
      day: daysByWeekday[weekday],
      enabled: Boolean(item?.is_enabled),
      start: formatTime(item?.starts_at),
      end: formatTime(item?.ends_at),
      capacity: Number(item?.capacity) || dailyCapacity,
    };
  });
  const dates = (data.exceptions || []).map((item) => ({
    id: item.id,
    date: displayDate(item.date),
    name: item.is_available ? 'Schedule exception' : 'Unavailable',
    hours: item.is_available && item.starts_at && item.ends_at
      ? `${formatTime(item.starts_at)} – ${formatTime(item.ends_at)}`
      : item.is_available ? 'Available' : 'Unavailable',
    type: item.is_available ? 'Special availability' : 'Fully unavailable',
  }));

  return {
    isAvailable: Boolean(data.is_available),
    capacity: dailyCapacity,
    schedule,
    dates,
  };
}

export function availabilityToApi({ isAvailable, capacity, schedule, exceptions }) {
  return {
    is_available: isAvailable,
    daily_capacity: Number(capacity),
    schedule: schedule.map((item) => ({
      weekday: item.weekday,
      is_enabled: item.enabled,
      starts_at: item.enabled ? item.start : null,
      ends_at: item.enabled ? item.end : null,
      capacity: Number(capacity),
    })),
    exceptions: exceptions.map((item) => ({
      date: dateOnly(item.date),
      is_available: Boolean(item.is_available),
      starts_at: item.starts_at ? formatTime(item.starts_at) : null,
      ends_at: item.ends_at ? formatTime(item.ends_at) : null,
      capacity: item.capacity ?? null,
    })),
  };
}
