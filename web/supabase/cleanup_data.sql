
-- 1. 먼저 모든 예약을 'confirmed'(예약중)으로 초기화
UPDATE bookings 
SET status = 'confirmed';

-- 2. '지디디'라는 이름의 예약만 'cancelled'(취소됨)으로 변경
UPDATE bookings 
SET status = 'cancelled' 
WHERE name = '지디디';

-- 3. 결과 확인
SELECT * FROM bookings ORDER BY date DESC;
