from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://casty:rathnesh12@localhost/messages'  # Update with your database URI
db = SQLAlchemy(app)
migrate = Migrate(app, db)

#python manage.py db init
#python manage.py db migrate -m "Initial migration"
#python manage.py db upgrade
