/*
  # Seed Clinic Data

  ## Overview
  Inserts sample clinic data for testing and development purposes.

  ## Data Inserted
  
  ### Clinics
  - 5 sample clinics with complete information
  - Different locations (Turkey, Germany, UK, UAE, Poland)
  - Active status for all clinics
  - Complete contact information and metadata
*/

-- Delete existing sample clinics to avoid duplicates
DELETE FROM clinics WHERE slug IN ('hairtech-istanbul', 'berlin-hair-clinic', 'london-advanced-hair', 'dubai-hair-excellence', 'warsaw-hair-institute');

-- Insert sample clinics
INSERT INTO clinics (name, slug, email, location, description, contact_email, contact_phone, logo_url, status, credits, metadata)
VALUES
  (
    'HairTech Istanbul',
    'hairtech-istanbul',
    'info@hairtechist.com',
    'Istanbul, Turkey',
    'Leading hair transplant clinic in Istanbul with 15+ years of experience. Specializing in FUE and DHI techniques.',
    'contact@hairtechist.com',
    '+90 212 555 0100',
    'https://images.pexels.com/photos/5327585/pexels-photo-5327585.jpeg?auto=compress&cs=tinysrgb&w=400',
    'ACTIVE',
    100,
    '{"specialties": ["FUE", "DHI", "Sapphire FUE"], "established": 2008, "surgeons": 5, "languages": ["English", "Turkish", "Arabic"], "certifications": ["ISO 9001", "JCI Accredited"]}'::jsonb
  ),
  (
    'Berlin Hair Clinic',
    'berlin-hair-clinic',
    'info@berlinhair.de',
    'Berlin, Germany',
    'Premium hair restoration center in Berlin offering advanced FUE techniques and personalized treatment plans.',
    'contact@berlinhair.de',
    '+49 30 555 0200',
    'https://images.pexels.com/photos/4021775/pexels-photo-4021775.jpeg?auto=compress&cs=tinysrgb&w=400',
    'ACTIVE',
    75,
    '{"specialties": ["FUE", "PRP", "Beard Transplant"], "established": 2012, "surgeons": 3, "languages": ["English", "German", "Turkish"], "certifications": ["TÜV Certified"]}'::jsonb
  ),
  (
    'London Advanced Hair',
    'london-advanced-hair',
    'info@londonhair.co.uk',
    'London, United Kingdom',
    'Cutting-edge hair restoration clinic in central London with state-of-the-art facilities and expert surgeons.',
    'contact@londonhair.co.uk',
    '+44 20 7555 0300',
    'https://images.pexels.com/photos/3845810/pexels-photo-3845810.jpeg?auto=compress&cs=tinysrgb&w=400',
    'ACTIVE',
    50,
    '{"specialties": ["FUE", "FUT", "Scalp Micropigmentation"], "established": 2015, "surgeons": 4, "languages": ["English", "French", "Spanish"], "certifications": ["CQC Registered"]}'::jsonb
  ),
  (
    'Dubai Hair Excellence',
    'dubai-hair-excellence',
    'info@dubaihairex.ae',
    'Dubai, UAE',
    'Luxury hair transplant clinic in Dubai offering world-class service and results with latest technology.',
    'contact@dubaihairex.ae',
    '+971 4 555 0400',
    'https://images.pexels.com/photos/4225880/pexels-photo-4225880.jpeg?auto=compress&cs=tinysrgb&w=400',
    'ACTIVE',
    125,
    '{"specialties": ["FUE", "DHI", "Robotic Hair Transplant"], "established": 2018, "surgeons": 6, "languages": ["English", "Arabic", "Hindi", "Urdu"], "certifications": ["DHA Licensed", "JCI Accredited"]}'::jsonb
  ),
  (
    'Warsaw Hair Institute',
    'warsaw-hair-institute',
    'info@warsawhair.pl',
    'Warsaw, Poland',
    'Modern hair restoration institute in Warsaw combining European quality with competitive pricing.',
    'contact@warsawhair.pl',
    '+48 22 555 0500',
    'https://images.pexels.com/photos/3845457/pexels-photo-3845457.jpeg?auto=compress&cs=tinysrgb&w=400',
    'ACTIVE',
    60,
    '{"specialties": ["FUE", "Long Hair Transplant", "Women Hair Transplant"], "established": 2016, "surgeons": 3, "languages": ["English", "Polish", "Russian"], "certifications": ["EU Medical Standards"]}'::jsonb
  );