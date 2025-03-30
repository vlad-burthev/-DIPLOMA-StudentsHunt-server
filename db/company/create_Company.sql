INSERT INTO companies (id, name, country, market_share, renewable_energy_percentage, yearly_revenue)
VALUES
  (gen_random_uuid(), 'TechNova', 'USA', 15.2, 40, 500000000),
  (gen_random_uuid(), 'CyberWave', 'Germany', 10.8, 60, 300000000),
  (gen_random_uuid(), 'InnovateX', 'UK', 12.5, 50, 450000000),
  (gen_random_uuid(), 'QuantumSoft', 'Canada', 8.9, 55, 275000000),
  (gen_random_uuid(), 'NextGen Solutions', 'France', 7.6, 30, 320000000),
  (gen_random_uuid(), 'CloudSphere', 'India', 14.3, 35, 410000000),
  (gen_random_uuid(), 'AI Dynamics', 'China', 9.2, 70, 290000000),
  (gen_random_uuid(), 'SoftHorizon', 'Japan', 6.8, 45, 260000000),
  (gen_random_uuid(), 'DataFusion', 'Brazil', 5.5, 25, 190000000),
  (gen_random_uuid(), 'FutureWare', 'Australia', 11.1, 65, 380000000),
  -- Добавьте ещё 40 компаний аналогичным образом
  (gen_random_uuid(), 'AlphaTech', 'USA', 8.0, 20, 210000000);
