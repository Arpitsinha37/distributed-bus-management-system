#!/usr/bin/env bash

echo "=== 1. Docker Compose Status ==="
docker-compose ps

echo -e "\n=== 2. Health Check ==="
curl -s -i http://localhost:3001/api/v1/health
echo

echo -e "\n=== 3. Migration Status ==="
docker exec bus-booking-backend-1 npx prisma migrate status || true

echo -e "\n=== 4. Redis Reachability ==="
docker exec bus-booking-backend-1 sh -c "apk add redis || true; redis-cli -h redis -p 6379 ping" || true

echo -e "\n=== 5. Site Slug Resolution ==="
echo "Pokhara:"
curl -s http://localhost:3001/api/v1/sites/by-slug/pokhara-travels | grep -o '{"id":"[^"]*","slug":"[^"]*","name":"[^"]*"'
echo -e "\nChitwan:"
curl -s http://localhost:3001/api/v1/sites/by-slug/chitwan-travels | grep -o '{"id":"[^"]*","slug":"[^"]*","name":"[^"]*"'
echo -e "\nLumbini:"
curl -s http://localhost:3001/api/v1/sites/by-slug/ktm-lumbini-services | grep -o '{"id":"[^"]*","slug":"[^"]*","name":"[^"]*"'

echo -e "\n\n=== 6. CMS Testimonials isolation ==="
echo "Pokhara:"
curl -s -H "X-Site-Id: pokhara-travels" http://localhost:3001/api/v1/cms/testimonials | grep -o 'name' | wc -l
echo "Chitwan:"
curl -s -H "X-Site-Id: chitwan-travels" http://localhost:3001/api/v1/cms/testimonials | grep -o 'name' | wc -l
echo "Lumbini:"
curl -s -H "X-Site-Id: ktm-lumbini-services" http://localhost:3001/api/v1/cms/testimonials | grep -o 'name' | wc -l

echo -e "\n=== 7. CMS Invalid Site ==="
curl -s -i -H "X-Site-Id: not-a-real-site" http://localhost:3001/api/v1/cms/testimonials | head -n 1
