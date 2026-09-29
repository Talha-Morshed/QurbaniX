# QurbaniX API

Laravel 12 REST API for customer, butcher, booking, payment, review, and administration workflows. Marketplace records are persisted in the configured SQL database. The seeder intentionally creates no sample users or marketplace records.

## Setup

Requirements: PHP 8.2+, Composer, and MySQL 8+ (MySQL is the configured application database).

```powershell
Copy-Item .env.example .env
php artisan key:generate
# Create the configured database and account in MySQL, or use the project's Docker MySQL service.
php artisan migrate
php artisan serve
```

The backend `.env.example` defaults to `qurbanix` at `127.0.0.1:3306` with the local-development account `qurbanix`. Change the credentials to match your MySQL setup. The frontend Vite server proxies `/api` requests to `http://127.0.0.1:8000` by default. Set `VITE_API_PROXY_TARGET` when the API uses a different host.

For a local development MySQL installation, run the following as a MySQL administrator (use a private password and update `DB_PASSWORD` to match):

```sql
CREATE DATABASE qurbanix CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'qurbanix'@'localhost' IDENTIFIED BY 'change-this-local-password';
GRANT ALL PRIVILEGES ON qurbanix.* TO 'qurbanix'@'localhost';
```

Do not use development credentials as production secrets.

Run backend tests:

```powershell
php artisan test
```

## Authentication

Registration and login use phone numbers and Sanctum bearer tokens:

- `POST /api/register` — create a customer or butcher account
- `POST /api/login` — request a short-lived PIN
- `POST /api/login/verify` — verify the PIN and receive a bearer token
- `GET /api/me` and `POST /api/logout`

The current PIN delivery is development-only: the PIN is returned in the JSON response only in local/development environments. Configure an SMS provider before enabling production phone verification. Admin accounts cannot self-register; create them through a trusted operator process.

Send the token on protected requests as `Authorization: Bearer <token>`.

## API areas

| Area | Routes |
| --- | --- |
| Butcher directory | `GET /api/butchers`, `GET /api/butchers/{user}` |
| Customer profile and addresses | `/api/customer/profile`, `/api/customer/addresses` |
| Customer bookings | `/api/customer/bookings` and booking status, payment, and review subroutes |
| Customer notifications | `/api/customer/notifications` and read-state subroutes |
| Butcher workspace | `/api/butcher/profile`, `/services`, `/availability`, `/bookings`, `/reviews` |
| Butcher cash-payment confirmation | `POST /api/butcher/payments/{payment}/confirm` |
| Admin operations | `/api/admin/users`, `/bookings`, and butcher verification |

Customer and butcher endpoints are role-gated. Booking status changes are checked against the customer/butcher relationship and an explicit transition list. Booking creation checks verification, service availability, schedule, time range, and daily capacity. Review creation is limited to a customer's completed booking.

## Payments

Payment records are persistent and remain pending until confirmed. Cash payments require confirmation from both customer and butcher. bKash, Nagad, and card payment records can be requested but cannot be settled by this API yet; a provider integration and verified callback are required before online payments can be treated as paid. No endpoint marks an online payment successful based on a client-supplied value.

## Data model

Migrations create butcher profiles and services, customer addresses, weekly schedules and date exceptions, bookings, payment records, reviews, and notifications. `php artisan migrate` applies the schema; `php artisan db:seed` does not add demo records.
