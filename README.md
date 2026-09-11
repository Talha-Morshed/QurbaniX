## Project Name: QurbaniX
## Features

### Customer
- User Registration & Login
- Search Verified Butchers
- View Butcher Profiles
- Compare Prices
- Book Services Online
- Online Advance Payment
- Booking History
- Payment History
- Ratings & Reviews
- Booking Notifications

### Butcher (কসাই)
- Registration & Verification
- Profile Management
- Set Service Pricing
- Accept/Reject Bookings
- Manage Availability
- Earnings Dashboard
- Confirm Cash Payments
- Manage Customer Reviews

### Administrator
- Secure Admin Dashboard
- User Management
- Butcher Verification
- Booking Management
- Payment Monitoring
- Complaint Handling
- Review Moderation
- Reports & Analytics

---

## Payment Workflow

1. Customer selects a verified butcher.
2. Customer submits a booking request.
3. Customer pays a small advance online.
4. Butcher accepts the booking.
5. Service is completed.
6. Remaining payment is paid in cash.
7. Both customer and butcher confirm the payment.
8. Booking status changes to **Completed**.

---

## Tech Stack

| Technology | Usage |
|------------|-------|
| HTML | Frontend |
| CSS | Styling |
| JavaScript | Client-side functionality |
| PHP | Backend |
| MySQL | Database |
| Apache (XAMPP) | Local Server |
| bKash API | Online Payments |
| Nagad API | Online Payments |
| Debit/Credit Card APIs | Payments |

---

## Running with Docker

The project is fully Dockerized. It runs:

- **Backend** — Laravel (PHP 8.2) on `http://localhost:8000`
- **Frontend** — React + Vite dev server on `http://localhost:5173`
- **MySQL** — on `localhost:3306` (db: `qurbanix`, user: `qurbanix`, password: `password`)
- **Redis** — on `localhost:6379`
- **Mailpit** — mail catcher on `localhost:8025` (SMTP on `localhost:1025`)

### Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (running)

### Setup

```bash
# 1. Start Docker Desktop, then from the project root:
docker compose build

# 2. Start all services (first run pulls images ~ a few minutes):
docker compose up -d
```

On first start the backend container automatically runs `composer install`,
generates the app key, and runs migrations. The frontend container runs
`npm install` on boot.

### Usage

| Service  | URL |
|----------|-----|
| Laravel API | http://localhost:8000/api |
| React frontend | http://localhost:5173 |
| Mailpit dashboard | http://localhost:8025 |

Frontend API requests are proxied to the backend automatically.

### Useful commands

```bash
docker compose logs -f laravel.test   # backend logs
docker compose logs -f frontend       # frontend logs
docker compose ps                     # service status
docker compose up -d --build          # rebuild after dependency changes
docker compose down                   # stop services
docker compose down -v                # stop and wipe the database volume
docker compose exec mysql mysql -u qurbanix -p qurbanix   # MySQL shell
```

To override ports/credentials (e.g. if port `8000` is taken), copy
`.env.example` to `.env` at the project root and adjust the values.

## Project Modules

- User Authentication
- Customer Management
- Butcher Management
- Booking Management
- Payment Management
- Rating & Review
- Notification System
- Admin Dashboard
- Report Generation

---

## Database Tables

- Users
- Customers
- Butchers
- Administrators
- Services
- Bookings
- Payments
- Reviews
- Notifications

---

## Objectives

- Build a trusted marketplace for hiring verified butchers.
- Simplify the booking process.
- Increase pricing transparency.
- Enable secure advance payments.
- Maintain digital payment records.
- Improve customer confidence through reviews.
- Reduce booking conflicts.
- Provide efficient administration tools.

---

## Future Enhancements

- GPS-based Nearby Butcher Search
- Live Location Tracking
- In-App Chat
- QR Code Payment Verification
- AI-based Recommendations
- Android App
- iOS App
- Multi-language Support
- Real-time Customer Support

---

## Target Users

- Customers
- Professional Butchers (কসাই)
- Administrators

---

## Project Status

Currently under development.

---

## License

This project is intended for educational and academic purposes.

---

## Contributors

- Group Members : Talha Osman Morshed
- ID : 20230204002
- Group Members : Irin Rahman Ratri
- ID : 20230204116
- Group Members : Md. Mehrab Karim
- ID : 20230204010
- Group Members : Adnan Bin Aman
- ID : 20230204013

## Ahsanullah University of Science and Technology (Aust)
