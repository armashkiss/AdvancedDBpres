-- Advanced JSONB Querying / full runnable demo dataset
-- Run in psql: \i sample-data.sql
-- PostgreSQL 12+ supports all demonstrated operators.

DROP TABLE IF EXISTS catalog;
CREATE TABLE catalog (
    id BIGSERIAL PRIMARY KEY,
    data JSONB NOT NULL
);

INSERT INTO catalog (data) VALUES
('{
  "name": "Atlas Pro 14", "category": "laptop", "brand": "Astra",
  "price": 1299, "specs": {"ram": 16, "cpu": "Core i7"},
  "tags": ["portable", "premium"], "stock": true
}'),
('{
  "name": "Nova Air", "category": "laptop", "brand": "Nova",
  "price": 899, "specs": {"ram": 8, "cpu": "Ryzen 5"},
  "tags": ["student", "lightweight"], "stock": true
}'),
('{
  "name": "Pulse X", "category": "headset", "brand": "Sonic",
  "price": 149, "wireless": true,
  "tags": ["gaming", "wireless", "audio"], "stock": false
}'),
('{
  "name": "Forge 16", "category": "laptop", "brand": "Forge",
  "price": 1699, "specs": {"ram": 32, "cpu": "Ryzen 9"},
  "tags": ["gaming", "premium"], "stock": true
}'),
('{
  "name": "Orbit Key", "category": "keyboard", "brand": "Orbit",
  "price": 99, "mechanical": true,
  "tags": ["mechanical", "office"], "stock": true
}'),
('{
  "name": "Wave Mini", "category": "headset", "brand": "Wave",
  "price": 79, "wireless": true,
  "tags": ["wireless", "budget"], "stock": true
}');

-- A. Navigate a nested JSON path
SELECT data->>'name' AS name, (data #>> '{specs,ram}')::int AS ram
FROM catalog
WHERE data->>'category' = 'laptop';

-- B. Containment (@>)
SELECT data->>'name' AS name FROM catalog
WHERE data @> '{"category":"laptop"}'::jsonb;

-- C. Top-level key existence (?)
SELECT data->>'name' AS name FROM catalog
WHERE data ? 'specs';

-- D. JSONPath query exists (@?)
SELECT data->>'name' AS name FROM catalog
WHERE data @? '$.tags[*] ? (@ == "gaming")';

-- E. JSONPath predicate check (@@)
SELECT data->>'name' AS name FROM catalog
WHERE data @@ '$.price > 1000';

-- F. Flatten arrays with a lateral set-returning function
SELECT tag, COUNT(*) AS uses
FROM catalog c
CROSS JOIN LATERAL jsonb_array_elements_text(c.data->'tags') AS tag
GROUP BY tag ORDER BY uses DESC, tag;

-- G. Index options (choose for your workload)
CREATE INDEX catalog_gin_ops ON catalog USING GIN (data);
-- CREATE INDEX catalog_gin_paths ON catalog USING GIN (data jsonb_path_ops);
CREATE INDEX catalog_price_idx ON catalog (((data->>'price')::numeric));

-- H. Inspect plan shape. On six rows, a sequential scan may be optimal.
EXPLAIN (ANALYZE, BUFFERS)
SELECT id FROM catalog WHERE data @> '{"category":"laptop"}';
