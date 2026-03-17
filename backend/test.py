from models.database import engine
from sqlalchemy import text
with engine.connect() as conn:
    try:
        conn.execute(text('ALTER TABLE resumes ADD COLUMN analysis_stage VARCHAR(100)'))
        conn.commit()
        print('Column added!')
    except Exception as e:
        print('Already exists or error:', e)