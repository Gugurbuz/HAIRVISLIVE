/*
  # Seed Demo Leads Data

  1. New Data
    - Adds 5 demo leads with realistic hair transplant data
    - Covers different Norwood scales (NW2-NW5)
    - Various countries and demographics
    - Mix of statuses (AVAILABLE, PURCHASED)

  2. Notes
    - Demo data for testing marketplace functionality
    - Patient details are anonymized/fictional
*/

INSERT INTO leads (
  id,
  country_code,
  age,
  gender,
  norwood_scale,
  estimated_grafts,
  status,
  price,
  proposal_price,
  is_unlocked,
  is_negotiable,
  patient_details,
  analysis_data,
  name,
  email,
  concerns,
  source
) VALUES
(
  gen_random_uuid(),
  'TR',
  32,
  'Male',
  'NW3',
  '2500-3000',
  'AVAILABLE',
  65,
  12,
  false,
  true,
  '{"fullName": "Demo Patient 1", "email": "demo1@example.com", "consent": true, "kvkk": true, "gender": "Male", "previousTransplant": false}'::jsonb,
  '{"diagnosis": {"norwood_scale": "NW3"}, "technical_metrics": {"graft_count_min": 2500, "graft_count_max": 3000}}'::jsonb,
  'Demo Patient 1',
  'demo1@example.com',
  ARRAY['Receding hairline', 'Frontal thinning'],
  'scanner'
),
(
  gen_random_uuid(),
  'DE',
  45,
  'Male',
  'NW4',
  '3500-4000',
  'AVAILABLE',
  85,
  15,
  false,
  true,
  '{"fullName": "Demo Patient 2", "email": "demo2@example.com", "consent": true, "kvkk": true, "gender": "Male", "previousTransplant": false}'::jsonb,
  '{"diagnosis": {"norwood_scale": "NW4"}, "technical_metrics": {"graft_count_min": 3500, "graft_count_max": 4000}}'::jsonb,
  'Demo Patient 2',
  'demo2@example.com',
  ARRAY['Crown thinning', 'Vertex baldness'],
  'scanner'
),
(
  gen_random_uuid(),
  'UK',
  28,
  'Male',
  'NW2',
  '1500-2000',
  'AVAILABLE',
  45,
  10,
  false,
  true,
  '{"fullName": "Demo Patient 3", "email": "demo3@example.com", "consent": true, "kvkk": true, "gender": "Male", "previousTransplant": false}'::jsonb,
  '{"diagnosis": {"norwood_scale": "NW2"}, "technical_metrics": {"graft_count_min": 1500, "graft_count_max": 2000}}'::jsonb,
  'Demo Patient 3',
  'demo3@example.com',
  ARRAY['Early hairline recession'],
  'scanner'
),
(
  gen_random_uuid(),
  'AE',
  38,
  'Male',
  'NW5',
  '4500-5000',
  'AVAILABLE',
  120,
  20,
  false,
  false,
  '{"fullName": "Demo Patient 4", "email": "demo4@example.com", "consent": true, "kvkk": true, "gender": "Male", "previousTransplant": true}'::jsonb,
  '{"diagnosis": {"norwood_scale": "NW5"}, "technical_metrics": {"graft_count_min": 4500, "graft_count_max": 5000}}'::jsonb,
  'Demo Patient 4',
  'demo4@example.com',
  ARRAY['Advanced hair loss', 'Previous transplant touch-up'],
  'scanner'
),
(
  gen_random_uuid(),
  'PL',
  35,
  'Male',
  'NW3V',
  '3000-3500',
  'AVAILABLE',
  75,
  14,
  false,
  true,
  '{"fullName": "Demo Patient 5", "email": "demo5@example.com", "consent": true, "kvkk": true, "gender": "Male", "previousTransplant": false}'::jsonb,
  '{"diagnosis": {"norwood_scale": "NW3V"}, "technical_metrics": {"graft_count_min": 3000, "graft_count_max": 3500}}'::jsonb,
  'Demo Patient 5',
  'demo5@example.com',
  ARRAY['Frontal and vertex thinning'],
  'scanner'
);
