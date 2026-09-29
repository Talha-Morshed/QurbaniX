#!/bin/sh
set -e

cd /var/www/html

if [ ! -f ".env" ]; then
    cp .env.example .env
fi

if [ ! -d "vendor" ]; then
    composer install --no-interaction --prefer-dist --optimize-autoloader
fi

if [ -z "$(grep -E '^APP_KEY=.+' .env || true)" ]; then
    php artisan key:generate --force
fi

# Adnan: Stop startup on migration failure instead of serving the API with a missing schema.
php artisan migrate --force

exec php artisan serve --host=0.0.0.0 --port=80