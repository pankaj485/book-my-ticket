CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  first_name VARCHAR(255) NOT NULL,
  last_name VARCHAR(255),
  password VARCHAR(500) NOT NULL,
  refresh_token VARCHAR(500),
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);
CREATE TABLE movies (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  show_time TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT now()
);
CREATE TABLE seats (
  id SERIAL PRIMARY KEY,
  row_number VARCHAR(20) NOT NULL,
  seat_number VARCHAR(20) NOT NULL,
  isbooked BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT now()
);
CREATE TABLE bookings (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  movie_id INT NOT NULL REFERENCES movies(id) ON DELETE CASCADE,
  seat_id INT NOT NULL REFERENCES seats(id) ON DELETE CASCADE,
  booked_at TIMESTAMP DEFAULT now(),
  UNIQUE (seat_id) -- one booking per seat; prevents double-booking at the DB level
);