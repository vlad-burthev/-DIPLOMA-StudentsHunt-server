INSERT INTO vacancies (
    id,
    company_id,
    recruiter_id,
    title,
    description,
    requirements,
    salary_from,
    salary_to,
    currency,
    location,
    is_active,
    work_type,
    created_at,
    updated_at
  )
VALUES
  (gen_random_uuid(), (SELECT id FROM companies ORDER BY random() LIMIT 1), gen_random_uuid(), 'Software Engineer', 'Develop and maintain software applications.', ARRAY['JavaScript', 'React', 'Node.js'], 70000, 100000, 'USD', 'New York, USA', true, 1, now(), now()),
  (gen_random_uuid(), (SELECT id FROM companies ORDER BY random() LIMIT 1), gen_random_uuid(), 'Data Analyst', 'Analyze and interpret complex data sets.', ARRAY['SQL', 'Python', 'Data Visualization'], 60000, 90000, 'EUR', 'Berlin, Germany', true, 2, now(), now()),
  (gen_random_uuid(), (SELECT id FROM companies ORDER BY random() LIMIT 1), gen_random_uuid(), 'Cybersecurity Specialist', 'Ensure security of IT infrastructure.', ARRAY['Security', 'Network', 'Ethical Hacking'], 75000, 110000, 'GBP', 'London, UK', true, 1, now(), now()),
  -- Добавьте ещё 47 вакансий аналогичным образом
  (gen_random_uuid(), (SELECT id FROM companies ORDER BY random() LIMIT 1), gen_random_uuid(), 'Cloud Engineer', 'Develop and manage cloud solutions.', ARRAY['AWS', 'GCP', 'Kubernetes'], 80000, 120000, 'USD', 'San Francisco, USA', true, 1, now(), now());