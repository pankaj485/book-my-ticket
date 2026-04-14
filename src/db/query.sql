SELECT s.id,
  s.isbooked,
  s.name,
  u.email,
  FROM seats as s
  LEFT JOIN users as u ON u.id = s.user_id
ORDER BY s.id ASC