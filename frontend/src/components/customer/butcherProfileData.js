const serviceCatalog = {
  Cow: { name: 'Cow Qurbani', description: 'Careful slaughter, portioning, and clean meat preparation.', price: 8500, duration: '2-3 hours' },
  Goat: { name: 'Goat Qurbani', description: 'Traditional slaughter and portioning for household service.', price: 3500, duration: '1-2 hours' },
  Sheep: { name: 'Sheep Qurbani', description: 'Hygienic slaughter and preparation with careful handling.', price: 3200, duration: '1-2 hours' },
  Camel: { name: 'Camel Qurbani', description: 'Experienced team service for large-animal preparation.', price: 12000, duration: '3-4 hours' },
  'Shared Cow': { name: 'Shared Cow Qurbani', description: 'Slaughter and preparation for one share of a cow.', price: 1500, duration: '2-3 hours' },
};

export function getButcherServices(butcher) {
  return butcher.animals.map((animal) => ({
    ...serviceCatalog[animal],
    id: animal.toLowerCase().replaceAll(' ', '-'),
    animal,
    price: Math.max(1200, serviceCatalog[animal].price + butcher.startingPrice - 3500),
    availability: butcher.availability === 'Unavailable' ? 'Fully booked' : butcher.availability,
  }));
}

export const butcherProfileDetails = {
  'rashid-ali': {
    bio: 'Experienced Qurbani professional providing reliable, hygienic services across central Dhaka.',
    phone: '+880 1700-000-001',
    specializations: ['Cow and camel preparation', 'Hygienic cutting', 'On-time service'],
    serviceAreas: ['Dhanmondi', 'Kalabagan', 'Lalmatia', 'Hazaribagh'],
    schedule: [['Saturday', '9:00 AM - 6:00 PM'], ['Sunday', '10:00 AM - 5:00 PM'], ['Monday - Thursday', '9:00 AM - 5:00 PM']],
    reviews: [
      { id: 'ra-1', customer: 'Rahim Ahmed', rating: 5, date: 'June 7, 2026', service: 'Cow Qurbani', text: 'Very professional service and arrived exactly on time. The preparation was clean and well organized.' },
      { id: 'ra-2', customer: 'Nusrat Jahan', rating: 5, date: 'May 29, 2026', service: 'Goat Qurbani', text: 'Clear communication and careful handling throughout. I would gladly book this team again.' },
      { id: 'ra-3', customer: 'Farhan Kabir', rating: 4, date: 'May 18, 2026', service: 'Cow Qurbani', text: 'Good, respectful service and a tidy finish. Everything was ready within the estimated time.' },
    ],
  },
  'kamran-sheikh': {
    bio: 'A careful, experienced butcher serving families in Gulshan and nearby neighborhoods.',
    phone: '+880 1700-000-002',
    specializations: ['Goat and sheep preparation', 'Portioning', 'Family service'],
    serviceAreas: ['Gulshan', 'Banani', 'Baridhara', 'Bashundhara'],
    schedule: [['Saturday', '8:30 AM - 6:00 PM'], ['Sunday', '9:00 AM - 5:00 PM'], ['Monday - Thursday', '9:00 AM - 4:30 PM']],
    reviews: [
      { id: 'ks-1', customer: 'Sadia Rahman', rating: 5, date: 'June 2, 2026', service: 'Goat Qurbani', text: 'The team was polite, efficient, and very careful with the preparation.' },
      { id: 'ks-2', customer: 'Mahmud Hasan', rating: 5, date: 'May 21, 2026', service: 'Cow Qurbani', text: 'Excellent organization from arrival to cleanup. The timing was exactly as promised.' },
      { id: 'ks-3', customer: 'Tania Akter', rating: 4, date: 'May 11, 2026', service: 'Sheep Qurbani', text: 'A professional experience and clear pricing. Scheduling was easy.' },
    ],
  },
  'imran-hossain': {
    bio: 'Supporting shared and family Qurbani services with organized scheduling in Mirpur.',
    phone: '+880 1700-000-003',
    specializations: ['Shared cow service', 'Cow and goat preparation', 'Scheduled group service'],
    serviceAreas: ['Mirpur', 'Pallabi', 'Kafrul', 'Agargaon'],
    schedule: [['Saturday', '9:00 AM - 6:00 PM'], ['Sunday', '10:00 AM - 5:00 PM'], ['Monday - Wednesday', '10:00 AM - 4:00 PM']],
    reviews: [
      { id: 'ih-1', customer: 'Arif Hossain', rating: 5, date: 'June 5, 2026', service: 'Shared Cow Qurbani', text: 'The shared service was well coordinated and every update arrived on time.' },
      { id: 'ih-2', customer: 'Maliha Islam', rating: 5, date: 'May 24, 2026', service: 'Goat Qurbani', text: 'Very respectful team, clean preparation, and a smooth experience for our family.' },
      { id: 'ih-3', customer: 'Zahid Hasan', rating: 4, date: 'May 9, 2026', service: 'Cow Qurbani', text: 'Good service and fair pricing. The team handled the schedule professionally.' },
    ],
  },
  'abdul-karim': {
    bio: 'A dependable local professional offering hygienic Qurbani preparation throughout Uttara.',
    phone: '+880 1700-000-004',
    specializations: ['Cow preparation', 'Camel service', 'Meat cutting'],
    serviceAreas: ['Uttara', 'Airport', 'Azampur', 'Khilkhet'],
    schedule: [['Saturday', '9:00 AM - 6:00 PM'], ['Sunday', '9:00 AM - 5:00 PM'], ['Monday - Thursday', '9:00 AM - 5:00 PM']],
    reviews: [
      { id: 'ak-1', customer: 'Shamima Begum', rating: 5, date: 'June 1, 2026', service: 'Cow Qurbani', text: 'Reliable and well prepared. The team arrived within the time window.' },
      { id: 'ak-2', customer: 'Rafi Ahmed', rating: 5, date: 'May 22, 2026', service: 'Goat Qurbani', text: 'Helpful communication and very clean work. A good experience overall.' },
      { id: 'ak-3', customer: 'Nabila Sultana', rating: 4, date: 'May 14, 2026', service: 'Camel Qurbani', text: 'The team was knowledgeable and handled a large service with care.' },
    ],
  },
  'shafiq-uddin': {
    bio: 'Providing attentive goat and sheep services for households across Mohammadpur.',
    phone: '+880 1700-000-005',
    specializations: ['Goat and sheep preparation', 'Household service', 'Clean cutting'],
    serviceAreas: ['Mohammadpur', 'Adabor', 'Shyamoli', 'Bosila'],
    schedule: [['Saturday', '9:00 AM - 5:30 PM'], ['Sunday', '10:00 AM - 5:00 PM'], ['Monday - Wednesday', '10:00 AM - 4:00 PM']],
    reviews: [
      { id: 'su-1', customer: 'Kamal Uddin', rating: 5, date: 'June 4, 2026', service: 'Goat Qurbani', text: 'Friendly and professional service. The work area was left tidy.' },
      { id: 'su-2', customer: 'Ruma Akter', rating: 4, date: 'May 26, 2026', service: 'Sheep Qurbani', text: 'Good communication and a careful team. Service was completed on schedule.' },
      { id: 'su-3', customer: 'Sabbir Khan', rating: 5, date: 'May 12, 2026', service: 'Goat Qurbani', text: 'A smooth booking experience and fair, transparent pricing.' },
    ],
  },
  'mizanur-rahman': {
    bio: 'Serving Banani families with scheduled Qurbani preparation and straightforward service.',
    phone: '+880 1700-000-006',
    specializations: ['Cow and goat preparation', 'Shared services', 'Scheduled bookings'],
    serviceAreas: ['Banani', 'Gulshan', 'Mohakhali', 'Tejgaon'],
    schedule: [['Saturday', '9:00 AM - 4:00 PM'], ['Sunday', '10:00 AM - 4:00 PM'], ['Monday - Tuesday', '10:00 AM - 3:00 PM']],
    reviews: [
      { id: 'mr-1', customer: 'Ahsan Kabir', rating: 5, date: 'May 30, 2026', service: 'Shared Cow Qurbani', text: 'Everything was arranged clearly and the team kept the agreed timing.' },
      { id: 'mr-2', customer: 'Lamia Chowdhury', rating: 4, date: 'May 17, 2026', service: 'Goat Qurbani', text: 'Courteous service and careful work. The process was easy to follow.' },
      { id: 'mr-3', customer: 'Omar Faruk', rating: 4, date: 'May 8, 2026', service: 'Cow Qurbani', text: 'The team was professional and completed the service as expected.' },
    ],
  },
  'tariqul-islam': {
    bio: 'A local Qurbani professional serving customers across central Chattogram.',
    phone: '+880 1700-000-007',
    specializations: ['Cow and goat preparation', 'Cutting and packaging', 'Local service'],
    serviceAreas: ['Panchlaish', 'Khulshi', 'Nasirabad', 'Chawkbazar'],
    schedule: [['Saturday', '9:00 AM - 5:00 PM'], ['Sunday', '10:00 AM - 4:00 PM'], ['Monday - Wednesday', '10:00 AM - 3:00 PM']],
    reviews: [
      { id: 'ti-1', customer: 'Mehedi Hasan', rating: 5, date: 'June 3, 2026', service: 'Goat Qurbani', text: 'Good communication and considerate service for our family.' },
      { id: 'ti-2', customer: 'Tasnim Akter', rating: 4, date: 'May 19, 2026', service: 'Cow Qurbani', text: 'The team worked carefully and finished within the planned time.' },
      { id: 'ti-3', customer: 'Rashed Chowdhury', rating: 4, date: 'May 7, 2026', service: 'Goat Qurbani', text: 'A helpful local service with clear information before the visit.' },
    ],
  },
};
