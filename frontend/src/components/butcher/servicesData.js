const defaultAdditional = '৳0 delivery estimate';

export function serviceFromApi(service) {
  return {
    id: service.id,
    name: service.name,
    animal: service.animal,
    category: service.category,
    description: service.description || '',
    price: String(service.price),
    duration: service.duration || '1–2 hours',
    available: Boolean(service.is_available),
    additional: service.additional || defaultAdditional,
  };
}

export function serviceToApi(service) {
  return {
    name: service.name.trim(),
    animal: service.animal,
    category: service.category || 'Slaughter & cutting',
    description: service.description.trim(),
    price: Number(service.price),
    duration: service.duration,
    is_available: service.available,
    additional: service.additional.trim() || defaultAdditional,
  };
}

export const emptyService = {
  name: '',
  animal: 'Cow',
  category: 'Slaughter & cutting',
  description: '',
  price: '',
  duration: '1–2 hours',
  available: true,
  additional: defaultAdditional,
};