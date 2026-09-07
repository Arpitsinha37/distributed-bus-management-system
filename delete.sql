DELETE FROM "Payment" WHERE gateway='mock-esewa';
DELETE FROM "Passenger" WHERE "bookingId" IN (SELECT id FROM "Booking" WHERE "customerName"='Test User');
UPDATE "TripSeat" SET status='AVAILABLE', "bookingId"=NULL WHERE "bookingId" IN (SELECT id FROM "Booking" WHERE "customerName"='Test User');
DELETE FROM "Booking" WHERE "customerName"='Test User';
