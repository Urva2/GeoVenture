#!/usr/bin/env python
# coding: utf-8

# In[26]:


import psycopg2

# =========================
# CONFIG
# =========================
DB_CONFIG = {
    "dbname": "Geo-Venture",
    "user": "postgres",
    "password": "Urv@3214",
    "host": "localhost",
    "port": "5432"
}

CSV_PATH = r'C:\Users\ASUS\Downloads\business_score_poi_wise.csv'


# In[27]:


# =========================
# CONNECT
# =========================
conn = psycopg2.connect(**DB_CONFIG)
cur = conn.cursor()

print("âœ… Connected to PostgreSQL")


# In[28]:


# =========================
# DROP TABLE
# =========================
cur.execute("""
DROP TABLE IF EXISTS business_scores;
""")

print("ðŸ—‘ï¸ Old table dropped")

# =========================
# CREATE TABLE
# =========================
cur.execute("""
CREATE TABLE business_scores (
    hex_id TEXT,
    competition TEXT,
    road_pct FLOAT,
    pofw_pct FLOAT,
    transport_pct FLOAT,
    traffic_pct FLOAT,
    poi_pct FLOAT,
    population_pct FLOAT
);
""")

print("ðŸ“¦ Table created")

# =========================
# COPY DATA (FASTEST)
# =========================
with open(CSV_PATH, 'r') as f:
    cur.copy_expert("""
        COPY business_scores
        FROM STDIN
        WITH CSV HEADER DELIMITER ','
    """, f)

print("ðŸš€ Data imported using COPY")

# =========================
# INDEXING
# =========================

# ðŸ”¥ Most important composite index
cur.execute("""
CREATE INDEX idx_hex_comp ON business_scores(hex_id, competition);
""")

# Optional but useful
cur.execute("""
CREATE INDEX idx_hex ON business_scores(hex_id);
""")

cur.execute("""
CREATE INDEX idx_comp ON business_scores(competition);
""")

print("âš¡ Indexes created")

# =========================
# COMMIT & CLOSE
# =========================
conn.commit()
cur.close()
conn.close()

print("âœ… DONE! Everything completed successfully")


# In[ ]:



