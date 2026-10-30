CREATE TABLE IF NOT EXISTS platforms (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE CHECK (char_length(trim(name)) BETWEEN 1 AND 100)
);

CREATE TABLE IF NOT EXISTS series (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL CHECK (char_length(trim(name)) BETWEEN 1 AND 150),
  platform_id INTEGER NOT NULL REFERENCES platforms(id) ON DELETE RESTRICT,
  UNIQUE (id, platform_id)
);

CREATE TABLE IF NOT EXISTS ratings (
  id SERIAL PRIMARY KEY,
  platform_id INTEGER NOT NULL REFERENCES platforms(id) ON DELETE RESTRICT,
  series_id INTEGER NOT NULL,
  score INTEGER NOT NULL CHECK (score BETWEEN 1 AND 10),
  observation TEXT NOT NULL CHECK (char_length(trim(observation)) BETWEEN 1 AND 2000),
  CONSTRAINT ratings_series_platform_fk
    FOREIGN KEY (series_id, platform_id)
    REFERENCES series(id, platform_id)
    ON DELETE CASCADE
);
