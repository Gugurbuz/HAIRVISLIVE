/*
  # Seed Demo Clinic User

  1. Updates HairTech Istanbul as the demo clinic
  2. Sets up initial credits
  3. Adds sample data for demo purposes
*/

-- Update HairTech Istanbul for demo purposes with enhanced data
UPDATE clinics SET
  credits = 250,
  description = 'A premier hair transplant clinic in Istanbul with state-of-the-art facilities. Specializing in FUE, DHI, and Sapphire FUE techniques with over 15 years of experience.',
  contact_email = 'info@hairtechist.com',
  contact_phone = '+90 212 555 1234',
  tier = 'FREE_PARTNER',
  is_verified = true,
  founding_year = 2008,
  languages_spoken = ARRAY['English', 'Turkish', 'German', 'Arabic', 'Russian'],
  response_time_hours = 12,
  social_media = '{"instagram": "https://instagram.com/hairtechistanbul", "facebook": "https://facebook.com/hairtechistanbul", "youtube": "https://youtube.com/@hairtechistanbul"}'::jsonb
WHERE id = 'bd5f2a0c-f20f-4fe6-8add-70b74abb0009';

-- Add/update clinic statistics for HairTech Istanbul
INSERT INTO clinic_statistics (
  clinic_id,
  total_procedures,
  success_rate_percent,
  average_rating,
  total_reviews,
  years_established
)
VALUES (
  'bd5f2a0c-f20f-4fe6-8add-70b74abb0009',
  1250,
  98.5,
  4.9,
  342,
  16
)
ON CONFLICT (clinic_id) DO UPDATE SET
  total_procedures = EXCLUDED.total_procedures,
  success_rate_percent = EXCLUDED.success_rate_percent,
  average_rating = EXCLUDED.average_rating,
  total_reviews = EXCLUDED.total_reviews,
  years_established = EXCLUDED.years_established;

-- Add sample facilities for HairTech Istanbul
DO $$
BEGIN
  -- Check and insert facilities
  IF NOT EXISTS (SELECT 1 FROM clinic_facilities WHERE clinic_id = 'bd5f2a0c-f20f-4fe6-8add-70b74abb0009') THEN
    INSERT INTO clinic_facilities (clinic_id, facility_name, description, icon, display_order)
    VALUES
      ('bd5f2a0c-f20f-4fe6-8add-70b74abb0009', 'Private Recovery Rooms', 'Comfortable private rooms for post-procedure recovery', 'bed', 1),
      ('bd5f2a0c-f20f-4fe6-8add-70b74abb0009', 'On-site Laboratory', 'Modern diagnostic and testing facilities', 'microscope', 2),
      ('bd5f2a0c-f20f-4fe6-8add-70b74abb0009', 'VIP Airport Transfer', 'Complimentary luxury airport pickup and drop-off', 'car', 3),
      ('bd5f2a0c-f20f-4fe6-8add-70b74abb0009', '5-Star Accommodation', 'Partner hotels with special rates for patients', 'coffee', 4),
      ('bd5f2a0c-f20f-4fe6-8add-70b74abb0009', 'Digital Scanning', 'Advanced 3D scalp analysis technology', 'camera', 5);
  END IF;
END $$;

-- Add sample team members for HairTech Istanbul
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM clinic_team_members WHERE clinic_id = 'bd5f2a0c-f20f-4fe6-8add-70b74abb0009') THEN
    INSERT INTO clinic_team_members (
      clinic_id,
      full_name,
      title,
      specializations,
      certifications,
      experience_years,
      languages,
      bio,
      display_order,
      is_active
    )
    VALUES
      (
        'bd5f2a0c-f20f-4fe6-8add-70b74abb0009',
        'Dr. Mehmet Özkan',
        'Chief Surgeon & Medical Director',
        ARRAY['FUE', 'DHI', 'Sapphire FUE'],
        '["Board Certified Hair Transplant Surgeon", "International Society of Hair Restoration Surgery Member", "Turkish Medical Association"]'::jsonb,
        15,
        ARRAY['English', 'Turkish', 'German'],
        'Dr. Özkan is a board-certified hair transplant surgeon with over 15 years of experience. He has performed over 3,000 successful procedures and specializes in advanced FUE techniques.',
        1,
        true
      ),
      (
        'bd5f2a0c-f20f-4fe6-8add-70b74abb0009',
        'Dr. Ayşe Yılmaz',
        'Senior Hair Transplant Surgeon',
        ARRAY['DHI', 'Female Hair Transplant'],
        '["Certified DHI Specialist", "European Hair Research Society Member"]'::jsonb,
        10,
        ARRAY['English', 'Turkish', 'Arabic'],
        'Dr. Yılmaz specializes in DHI technique and female hair restoration. She has successfully treated over 1,500 patients with natural-looking results.',
        2,
        true
      );
  END IF;
END $$;

-- Add sample services for HairTech Istanbul
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM clinic_services WHERE clinic_id = 'bd5f2a0c-f20f-4fe6-8add-70b74abb0009') THEN
    INSERT INTO clinic_services (
      clinic_id,
      service_name,
      description,
      base_price,
      currency,
      duration_hours,
      recovery_days,
      is_featured,
      display_order
    )
    VALUES
      (
        'bd5f2a0c-f20f-4fe6-8add-70b74abb0009',
        'Sapphire FUE Hair Transplant',
        'Advanced FUE technique using sapphire blades for minimal scarring and faster recovery',
        2500,
        'EUR',
        6,
        7,
        true,
        1
      ),
      (
        'bd5f2a0c-f20f-4fe6-8add-70b74abb0009',
        'DHI Hair Transplant',
        'Direct Hair Implantation for maximum density and natural hairline design',
        3000,
        'EUR',
        7,
        7,
        true,
        2
      ),
      (
        'bd5f2a0c-f20f-4fe6-8add-70b74abb0009',
        'Beard Transplant',
        'Natural beard restoration and density enhancement',
        1800,
        'EUR',
        4,
        5,
        false,
        3
      );
  END IF;
END $$;

-- Add sample packages for HairTech Istanbul
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM clinic_packages WHERE clinic_id = 'bd5f2a0c-f20f-4fe6-8add-70b74abb0009') THEN
    INSERT INTO clinic_packages (
      clinic_id,
      package_name,
      tier,
      price,
      currency,
      graft_range_min,
      graft_range_max,
      inclusions,
      description,
      is_active,
      display_order
    )
    VALUES
      (
        'bd5f2a0c-f20f-4fe6-8add-70b74abb0009',
        'Essential Package',
        'Basic',
        1999,
        'EUR',
        2000,
        3000,
        '["Hair Transplant Procedure", "Post-op Medications", "PRP Session", "Airport Transfer", "1 Night Hotel Stay"]'::jsonb,
        'Perfect for small to medium coverage areas',
        true,
        1
      ),
      (
        'bd5f2a0c-f20f-4fe6-8add-70b74abb0009',
        'Premium Package',
        'Standard',
        2999,
        'EUR',
        3000,
        4500,
        '["Sapphire FUE Procedure", "Post-op Medications", "2 PRP Sessions", "VIP Airport Transfer", "3 Nights 4-Star Hotel", "City Tour"]'::jsonb,
        'Most popular choice with comprehensive care',
        true,
        2
      ),
      (
        'bd5f2a0c-f20f-4fe6-8add-70b74abb0009',
        'VIP Package',
        'Premium',
        4500,
        'EUR',
        4500,
        6000,
        '["DHI or Sapphire FUE", "Post-op Medications", "3 PRP Sessions", "VIP Luxury Transfer", "5 Nights 5-Star Hotel", "Private City Tour", "Post-op Care Kit", "1 Year Follow-up"]'::jsonb,
        'Complete VIP experience with maximum grafts',
        true,
        3
      );
  END IF;
END $$;