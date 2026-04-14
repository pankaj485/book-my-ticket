CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  age INT NOT NULL CHECK (age >= 18),
  first_name VARCHAR(255) NOT NULL,
  last_name VARCHAR(255),
  password VARCHAR(500) NOT NULL,
  refresh_token VARCHAR(500),
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);
CREATE TABLE seats (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255),
  isbooked BOOLEAN DEFAULT FALSE,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT now()
);