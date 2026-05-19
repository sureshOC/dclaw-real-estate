-- ── DClaw local dev seed data ────────────────────────────────────────────────

-- Organisation + owner (password = "Password123!")
INSERT INTO organizations (id, name, plan_tier, auto_dispatch_enabled, created_at)
VALUES ('00000000-0000-0000-0000-000000000001', 'Sunrise Property Group', 'starter', true, NOW())
ON CONFLICT DO NOTHING;

INSERT INTO users (id, org_id, email, password_hash, role, first_name, last_name, is_active, created_at)
VALUES (
  '00000000-0000-0000-0000-000000000002',
  '00000000-0000-0000-0000-000000000001',
  'admin@sunrise.com',
  '$2b$12$rBWg8ks6zZqTjZxx.1SGqe1ZIZORNFYKkvBeK/ja4O035ljtyNi8a',
  'owner', 'Alex', 'Morgan', true, NOW()
) ON CONFLICT DO NOTHING;

-- ── Vendors (valid specialties: plumbing, electrical, hvac, general, landscaping, roofing)
INSERT INTO vendors (id, name, specialty, phone, email, rating, notes) VALUES
  ('10000000-0000-0000-0000-000000000001','QuickFix Plumbing',   'plumbing',    '555-0101','contact@quickfix.com',   4.8,'Fast response, fair pricing'),
  ('10000000-0000-0000-0000-000000000002','Elite Electric',      'electrical',  '555-0102','info@eliteelectric.com', 4.6,'Licensed master electrician'),
  ('10000000-0000-0000-0000-000000000003','CoolBreeze HVAC',     'hvac',        '555-0103','cool@coolbreeze.com',    4.9,'24/7 emergency service'),
  ('10000000-0000-0000-0000-000000000004','Foundation First',    'general',     '555-0104','info@foundation.com',    4.3,'Structural & general repairs'),
  ('10000000-0000-0000-0000-000000000005','Solid Roofing Co',    'roofing',     '555-0105','roof@solidroofing.com',  4.7,'20-year warranty'),
  ('10000000-0000-0000-0000-000000000006','GreenThumb Landscaping','landscaping','555-0106','hi@greenthumb.com',     4.5,'Weekly maintenance plans'),
  ('10000000-0000-0000-0000-000000000007','AllFix General',      'general',     '555-0107','fix@allfix.com',         4.4,'Doors, locks, painting'),
  ('10000000-0000-0000-0000-000000000008','AquaFlow Plumbing',   'plumbing',    '555-0108','aqua@aquaflow.com',      4.2,'Water heater specialists'),
  ('10000000-0000-0000-0000-000000000009','Volt Pro Electric',   'electrical',  '555-0109','volt@voltpro.com',       4.6,'Panel upgrades & EV chargers'),
  ('10000000-0000-0000-0000-000000000010','AirCare HVAC',        'hvac',        '555-0110','care@aircare.com',       4.5,'Seasonal tune-up plans')
ON CONFLICT DO NOTHING;

-- ── Properties (valid statuses: available, rented, sold, pending)
INSERT INTO properties (id, org_id, title, address, city, state, zip_code, price, property_type, bedrooms, bathrooms, square_feet, status, description) VALUES
  ('20000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000001','Sunset Villa',       '123 Sunset Blvd',    'Austin','TX','78701',2800,'house',    3,2,1800,'rented',   'Bright 3BR home with backyard'),
  ('20000000-0000-0000-0000-000000000002','00000000-0000-0000-0000-000000000001','Downtown Loft',      '456 Main St Apt 4B', 'Austin','TX','78702',1900,'apartment',1,1,900, 'rented',   'Modern loft in city center'),
  ('20000000-0000-0000-0000-000000000003','00000000-0000-0000-0000-000000000001','Oak Creek Cottage',  '789 Oak Lane',       'Austin','TX','78703',2200,'house',    2,1,1200,'rented',   'Cozy cottage near creek'),
  ('20000000-0000-0000-0000-000000000004','00000000-0000-0000-0000-000000000001','Riverside Condo',    '321 River Rd Unit 2','Austin','TX','78704',2500,'condo',    2,2,1100,'rented',   'River views, pool access'),
  ('20000000-0000-0000-0000-000000000005','00000000-0000-0000-0000-000000000001','Maple Heights',      '654 Maple Ave',      'Austin','TX','78705',3200,'house',    4,3,2400,'rented',   'Large family home'),
  ('20000000-0000-0000-0000-000000000006','00000000-0000-0000-0000-000000000001','Garden Studio',      '987 Garden St #1',   'Austin','TX','78706',1400,'apartment',0,1,550, 'available','Studio with private garden'),
  ('20000000-0000-0000-0000-000000000007','00000000-0000-0000-0000-000000000001','Hilltop Retreat',    '147 Hill Rd',        'Austin','TX','78707',3500,'house',    4,2,2100,'rented',   'Hilltop views, quiet street'),
  ('20000000-0000-0000-0000-000000000008','00000000-0000-0000-0000-000000000001','City Centre Flat',   '258 Center Ave #5',  'Austin','TX','78708',2100,'apartment',2,1,980, 'rented',   'Walkable to everything'),
  ('20000000-0000-0000-0000-000000000009','00000000-0000-0000-0000-000000000001','Lakeside Bungalow',  '369 Lake Dr',        'Austin','TX','78709',2700,'house',    3,2,1500,'pending',  'Lakefront, needs AC repair'),
  ('20000000-0000-0000-0000-000000000010','00000000-0000-0000-0000-000000000001','University Duplex',  '741 Uni Blvd',       'Austin','TX','78712',1800,'apartment',2,1,900, 'rented',   'Near UT campus')
ON CONFLICT DO NOTHING;

-- ── Tenants (columns: first_name, last_name, rent_amount — no name/deposit/status)
INSERT INTO tenants (id, org_id, first_name, last_name, email, phone, property_id, lease_start, lease_end, rent_amount, income, prior_eviction, screening_score, screening_tier) VALUES
  ('30000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000001','Sarah',    'Johnson', 'sarah.j@email.com',  '555-1001','20000000-0000-0000-0000-000000000001','2025-06-01','2026-12-31',2800,85000, false,92,'A'),
  ('30000000-0000-0000-0000-000000000002','00000000-0000-0000-0000-000000000001','Marcus',   'Williams','marcus.w@email.com', '555-1002','20000000-0000-0000-0000-000000000002','2025-07-01','2026-06-30',1900,62000, false,85,'B'),
  ('30000000-0000-0000-0000-000000000003','00000000-0000-0000-0000-000000000001','Emily',    'Chen',    'emily.c@email.com',  '555-1003','20000000-0000-0000-0000-000000000003','2025-08-01','2026-07-31',2200,74000, false,88,'A'),
  ('30000000-0000-0000-0000-000000000004','00000000-0000-0000-0000-000000000001','David',    'Patel',   'david.p@email.com',  '555-1004','20000000-0000-0000-0000-000000000004','2025-06-15','2026-06-14',2500,91000, false,95,'A'),
  ('30000000-0000-0000-0000-000000000005','00000000-0000-0000-0000-000000000001','Jennifer', 'Taylor',  'jen.t@email.com',    '555-1005','20000000-0000-0000-0000-000000000005','2025-05-01','2027-04-30',3200,110000,false,97,'A'),
  ('30000000-0000-0000-0000-000000000006','00000000-0000-0000-0000-000000000001','Robert',   'Kim',     'rob.k@email.com',    '555-1006','20000000-0000-0000-0000-000000000007','2025-09-01','2026-08-31',3500,98000, false,91,'A'),
  ('30000000-0000-0000-0000-000000000007','00000000-0000-0000-0000-000000000001','Amanda',   'Torres',  'amanda.t@email.com', '555-1007','20000000-0000-0000-0000-000000000008','2025-10-01','2026-09-30',2100,58000, false,78,'B'),
  ('30000000-0000-0000-0000-000000000008','00000000-0000-0000-0000-000000000001','James',    'Martinez','james.m@email.com',  '555-1008','20000000-0000-0000-0000-000000000009','2025-07-15','2026-07-14',2700,80000, false,86,'B'),
  ('30000000-0000-0000-0000-000000000009','00000000-0000-0000-0000-000000000001','Lisa',     'Anderson','lisa.a@email.com',   '555-1009','20000000-0000-0000-0000-000000000010','2025-11-01','2026-10-31',1800,55000, false,81,'B'),
  ('30000000-0000-0000-0000-000000000010','00000000-0000-0000-0000-000000000001','Michael',  'Brown',   'michael.b@email.com','555-1010','20000000-0000-0000-0000-000000000001','2023-06-01','2024-06-30',2750,70000, false,84,'B')
ON CONFLICT DO NOTHING;

-- ── Maintenance Requests (no created_at column; priority: low/medium/high/emergency)
INSERT INTO maintenance_requests (id, org_id, property_id, tenant_id, title, description, priority, status, vendor_id, assigned_at) VALUES
  ('40000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000001','20000000-0000-0000-0000-000000000001','30000000-0000-0000-0000-000000000001','Leaky kitchen faucet',      'Dripping faucet under kitchen sink',     'medium',   'open',        NULL,                                       NULL),
  ('40000000-0000-0000-0000-000000000002','00000000-0000-0000-0000-000000000001','20000000-0000-0000-0000-000000000002','30000000-0000-0000-0000-000000000002','Broken AC unit',            'AC not cooling, makes loud noise',       'high',     'in_progress', '10000000-0000-0000-0000-000000000003', NOW() - INTERVAL '2 days'),
  ('40000000-0000-0000-0000-000000000003','00000000-0000-0000-0000-000000000001','20000000-0000-0000-0000-000000000003','30000000-0000-0000-0000-000000000003','Electrical outlet dead',    'Two outlets in living room not working', 'medium',   'open',        NULL,                                       NULL),
  ('40000000-0000-0000-0000-000000000004','00000000-0000-0000-0000-000000000001','20000000-0000-0000-0000-000000000004','30000000-0000-0000-0000-000000000004','Bathroom tile cracked',     'Floor tile cracked near shower',         'low',      'resolved',    '10000000-0000-0000-0000-000000000001', NOW() - INTERVAL '10 days'),
  ('40000000-0000-0000-0000-000000000005','00000000-0000-0000-0000-000000000001','20000000-0000-0000-0000-000000000005','30000000-0000-0000-0000-000000000005','Front door lock stiff',     'Lock hard to turn, key gets stuck',      'medium',   'resolved',    '10000000-0000-0000-0000-000000000007', NOW() - INTERVAL '8 days'),
  ('40000000-0000-0000-0000-000000000006','00000000-0000-0000-0000-000000000001','20000000-0000-0000-0000-000000000007','30000000-0000-0000-0000-000000000006','Roof leak after rain',      'Water stain on bedroom ceiling',         'emergency','in_progress', '10000000-0000-0000-0000-000000000005', NOW() - INTERVAL '1 day'),
  ('40000000-0000-0000-0000-000000000007','00000000-0000-0000-0000-000000000001','20000000-0000-0000-0000-000000000008','30000000-0000-0000-0000-000000000007','Dishwasher not draining',   'Standing water after every cycle',       'medium',   'open',        NULL,                                       NULL),
  ('40000000-0000-0000-0000-000000000008','00000000-0000-0000-0000-000000000001','20000000-0000-0000-0000-000000000009','30000000-0000-0000-0000-000000000008','AC full replacement needed','Unit over 15 years, inefficient',        'high',     'in_progress', '10000000-0000-0000-0000-000000000003', NOW() - INTERVAL '3 days'),
  ('40000000-0000-0000-0000-000000000009','00000000-0000-0000-0000-000000000001','20000000-0000-0000-0000-000000000010','30000000-0000-0000-0000-000000000009','Window seal broken',        'Drafty window in living room',           'low',      'open',        NULL,                                       NULL),
  ('40000000-0000-0000-0000-000000000010','00000000-0000-0000-0000-000000000001','20000000-0000-0000-0000-000000000001','30000000-0000-0000-0000-000000000001','Paint peeling in hallway',  'Hallway ceiling paint peeling',          'low',      'resolved',    '10000000-0000-0000-0000-000000000004', NOW() - INTERVAL '20 days')
ON CONFLICT DO NOTHING;

-- ── Rent Payments (valid methods: bank_transfer, check, cash, other; no card)
INSERT INTO rent_payments (id, org_id, tenant_id, property_id, amount, paid_amount, due_date, paid_date, status, method, created_at) VALUES
  ('50000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000001','30000000-0000-0000-0000-000000000001','20000000-0000-0000-0000-000000000001',2800,2800,'2026-05-01','2026-05-01','paid',  'bank_transfer',NOW() - INTERVAL '18 days'),
  ('50000000-0000-0000-0000-000000000002','00000000-0000-0000-0000-000000000001','30000000-0000-0000-0000-000000000002','20000000-0000-0000-0000-000000000002',1900,1900,'2026-05-01','2026-05-02','paid',  'other',        NOW() - INTERVAL '17 days'),
  ('50000000-0000-0000-0000-000000000003','00000000-0000-0000-0000-000000000001','30000000-0000-0000-0000-000000000003','20000000-0000-0000-0000-000000000003',2200,2200,'2026-05-01','2026-04-30','paid',  'bank_transfer',NOW() - INTERVAL '19 days'),
  ('50000000-0000-0000-0000-000000000004','00000000-0000-0000-0000-000000000001','30000000-0000-0000-0000-000000000004','20000000-0000-0000-0000-000000000004',2500,NULL,'2026-05-01',NULL,        'pending','other',        NOW() - INTERVAL '18 days'),
  ('50000000-0000-0000-0000-000000000005','00000000-0000-0000-0000-000000000001','30000000-0000-0000-0000-000000000005','20000000-0000-0000-0000-000000000005',3200,3200,'2026-05-01','2026-05-03','paid',  'check',        NOW() - INTERVAL '16 days'),
  ('50000000-0000-0000-0000-000000000006','00000000-0000-0000-0000-000000000001','30000000-0000-0000-0000-000000000006','20000000-0000-0000-0000-000000000007',3500,NULL,'2026-05-01',NULL,        'late',  'other',        NOW() - INTERVAL '18 days'),
  ('50000000-0000-0000-0000-000000000007','00000000-0000-0000-0000-000000000001','30000000-0000-0000-0000-000000000007','20000000-0000-0000-0000-000000000008',2100,2100,'2026-05-01','2026-05-01','paid',  'bank_transfer',NOW() - INTERVAL '18 days'),
  ('50000000-0000-0000-0000-000000000008','00000000-0000-0000-0000-000000000001','30000000-0000-0000-0000-000000000008','20000000-0000-0000-0000-000000000009',2700,2700,'2026-05-01','2026-05-04','paid',  'cash',         NOW() - INTERVAL '15 days'),
  ('50000000-0000-0000-0000-000000000009','00000000-0000-0000-0000-000000000001','30000000-0000-0000-0000-000000000009','20000000-0000-0000-0000-000000000010',1800,1800,'2026-05-01','2026-05-01','paid',  'bank_transfer',NOW() - INTERVAL '18 days'),
  ('50000000-0000-0000-0000-000000000010','00000000-0000-0000-0000-000000000001','30000000-0000-0000-0000-000000000001','20000000-0000-0000-0000-000000000001',2800,2800,'2026-04-01','2026-04-01','paid',  'bank_transfer',NOW() - INTERVAL '48 days')
ON CONFLICT DO NOTHING;

-- ── Expenses (valid categories: mortgage, tax, insurance, maintenance, utilities, management, other)
INSERT INTO expenses (id, property_id, category, amount, expense_date, description, recurring, created_at) VALUES
  ('60000000-0000-0000-0000-000000000001','20000000-0000-0000-0000-000000000001','insurance',  1200,'2026-05-01','Annual property insurance',     true, NOW()),
  ('60000000-0000-0000-0000-000000000002','20000000-0000-0000-0000-000000000002','maintenance', 320,'2026-05-10','AC filter replacement',          false,NOW()),
  ('60000000-0000-0000-0000-000000000003','20000000-0000-0000-0000-000000000003','tax',        4200,'2026-04-15','Annual property tax',            true, NOW()),
  ('60000000-0000-0000-0000-000000000004','20000000-0000-0000-0000-000000000004','utilities',   180,'2026-05-05','Common area electricity',        true, NOW()),
  ('60000000-0000-0000-0000-000000000005','20000000-0000-0000-0000-000000000005','other',       450,'2026-05-12','Monthly lawn service',           true, NOW()),
  ('60000000-0000-0000-0000-000000000006','20000000-0000-0000-0000-000000000006','other',       220,'2026-05-14','Vacancy turnover cleaning',      false,NOW()),
  ('60000000-0000-0000-0000-000000000007','20000000-0000-0000-0000-000000000007','maintenance',1800,'2026-05-15','Emergency roof patch',           false,NOW()),
  ('60000000-0000-0000-0000-000000000008','20000000-0000-0000-0000-000000000008','management',  210,'2026-05-01','Property management fee',        true, NOW()),
  ('60000000-0000-0000-0000-000000000009','20000000-0000-0000-0000-000000000009','maintenance',2400,'2026-05-08','HVAC replacement deposit',       false,NOW()),
  ('60000000-0000-0000-0000-000000000010','20000000-0000-0000-0000-000000000010','insurance',   950,'2026-05-01','Annual property insurance',      true, NOW())
ON CONFLICT DO NOTHING;

-- ── Lease Events (valid types: created, renewed, terminated, extended)
INSERT INTO lease_events (id, tenant_id, event_type, effective_date, rent_amount, notes, created_at) VALUES
  ('70000000-0000-0000-0000-000000000001','30000000-0000-0000-0000-000000000001','created', '2024-01-01',2800,'Initial lease created',          NOW()),
  ('70000000-0000-0000-0000-000000000002','30000000-0000-0000-0000-000000000002','created', '2024-02-01',1900,'Initial lease created',          NOW()),
  ('70000000-0000-0000-0000-000000000003','30000000-0000-0000-0000-000000000003','created', '2024-03-01',2200,'Initial lease created',          NOW()),
  ('70000000-0000-0000-0000-000000000004','30000000-0000-0000-0000-000000000004','extended','2025-01-15',2600,'Extended with CPI adjustment',   NOW()),
  ('70000000-0000-0000-0000-000000000005','30000000-0000-0000-0000-000000000005','renewed', '2024-12-01',3200,'Renewed at same rate',           NOW()),
  ('70000000-0000-0000-0000-000000000006','30000000-0000-0000-0000-000000000006','created', '2024-04-01',3500,'Initial lease created',          NOW()),
  ('70000000-0000-0000-0000-000000000007','30000000-0000-0000-0000-000000000007','created', '2024-05-01',2100,'Initial lease created',          NOW()),
  ('70000000-0000-0000-0000-000000000008','30000000-0000-0000-0000-000000000008','created', '2024-02-15',2700,'Initial lease created',          NOW()),
  ('70000000-0000-0000-0000-000000000009','30000000-0000-0000-0000-000000000009','created', '2024-06-01',1800,'Initial lease created',          NOW()),
  ('70000000-0000-0000-0000-000000000010','30000000-0000-0000-0000-000000000010','terminated','2024-06-30',NULL,'Lease ended, tenant moved out', NOW())
ON CONFLICT DO NOTHING;
