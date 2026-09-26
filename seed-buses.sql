-- First, ensure a default seat layout exists. We assume you have one, 
-- but if you don't, you need to run:
-- INSERT INTO "SeatLayout" (id, name, "totalSeats", "layoutJson", "createdAt") 
-- VALUES ('default_layout_01', 'Default 2x2', 35, '{"rows": []}', NOW())
-- ON CONFLICT DO NOTHING;

-- Insert the buses
INSERT INTO "Bus" (id, "registrationNo", "type", "seatLayoutId", "amenities", "ownerName", "ownerPhone", "isActive", "createdAt", "updatedAt")
VALUES 
  (gen_random_uuid()::text, 'Ga 1 PA 302', 'Tourist', (SELECT id FROM "SeatLayout" LIMIT 1), ARRAY['GPS'], 'Unknown', '', true, NOW(), NOW()),
  (gen_random_uuid()::text, 'Ga 1 PA 303', 'Tourist', (SELECT id FROM "SeatLayout" LIMIT 1), ARRAY['GPS'], 'Unknown', '', true, NOW(), NOW()),
  (gen_random_uuid()::text, 'Ga 1 Pa 159', 'Tourist', (SELECT id FROM "SeatLayout" LIMIT 1), ARRAY[]::text[], 'Pokhara', '9856026730', true, NOW(), NOW()),
  (gen_random_uuid()::text, 'Ga 1 Pa 160', 'Tourist', (SELECT id FROM "SeatLayout" LIMIT 1), ARRAY[]::text[], 'Bishow Raj Acharya', '9856026731', true, NOW(), NOW()),
  (gen_random_uuid()::text, '8170', 'Tourist', (SELECT id FROM "SeatLayout" LIMIT 1), ARRAY[]::text[], 'Phadindra Khanal', '9851159715', true, NOW(), NOW()),
  (gen_random_uuid()::text, '2960', 'Tourist', (SELECT id FROM "SeatLayout" LIMIT 1), ARRAY[]::text[], 'Rohan xchetri', '9840250892', true, NOW(), NOW()),
  (gen_random_uuid()::text, 'No bus', 'Tourist', (SELECT id FROM "SeatLayout" LIMIT 1), ARRAY[]::text[], 'Unknown', '', true, NOW(), NOW()),
  (gen_random_uuid()::text, 'Ba 1 Pa 1711', 'Tourist', (SELECT id FROM "SeatLayout" LIMIT 1), ARRAY[]::text[], 'Unknown', '', true, NOW(), NOW()),
  (gen_random_uuid()::text, 'Ba 1 Pa 1712', 'Tourist', (SELECT id FROM "SeatLayout" LIMIT 1), ARRAY[]::text[], 'Unknown', '', true, NOW(), NOW())
ON CONFLICT ("registrationNo") DO NOTHING;

-- Insert the drivers into the CrewMember table
INSERT INTO "CrewMember" (id, "name", "phone", "role", "isActive", "createdAt", "updatedAt")
VALUES
  (gen_random_uuid()::text, 'Pokhara', '9856026730', 'DRIVER', true, NOW(), NOW()),
  (gen_random_uuid()::text, 'Bishow Raj Acharya', '9856026731', 'DRIVER', true, NOW(), NOW()),
  (gen_random_uuid()::text, 'Phadindra Khanal', '9851159715', 'DRIVER', true, NOW(), NOW()),
  (gen_random_uuid()::text, 'Rohan xchetri', '9840250892', 'DRIVER', true, NOW(), NOW())
ON CONFLICT ("phone") DO NOTHING;
