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

php artisan migrate --force || true

exec php artisan serve --host=0.0.0.0 --port=80