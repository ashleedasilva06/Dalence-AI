from models.database import engine
from sqlalchemy import text

email = "ashy06tv@gmail.com"  # change this if needed

conn = engine.connect()
conn.execute(text(f"UPDATE users SET role = 'admin' WHERE email = '{email}'"))
conn.commit()
conn.close()
print(f"Done! {email} is now admin.")