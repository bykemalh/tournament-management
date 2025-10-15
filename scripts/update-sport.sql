-- Tüm takımların sport field'ını FOOTBALL olarak ayarla
UPDATE teams SET sport = 'FOOTBALL';

-- Kontrol et
SELECT id, name, sport, "referenceCode" FROM teams;
