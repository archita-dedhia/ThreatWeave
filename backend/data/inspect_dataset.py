import pandas as pd
import json

df = pd.read_csv('backend/data/ThreatWeave_security_logs.csv')

unique_vals = {}
for col in df.columns:
    unique_vals[col] = df[col].dropna().unique().tolist()[:10]  # First 10 unique values

print(json.dumps(unique_vals, indent=2))
