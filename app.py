from flask import Flask, render_template, request, jsonify, send_file, redirect, url_for, session
import xml.etree.ElementTree as ET
from flask_sqlalchemy import SQLAlchemy
import pandas as pd
import matplotlib
matplotlib.use('Agg')  # Use 'Agg' backend to avoid GUI issues
import matplotlib.pyplot as plt
import io
from PIL import Image
from flask_login import UserMixin
from flask_login import LoginManager, login_required, current_user
import os

from werkzeug.security import generate_password_hash, check_password_hash
from werkzeug.utils import secure_filename
from flask_login import UserMixin, login_user, logout_user, LoginManager, login_required, current_user

from matplotlib.font_manager import FontProperties

app = Flask(__name__)
app.secret_key = 'your_secret_key'

login_manager = LoginManager(app)
login_manager.login_view = 'login'

UPLOAD_FOLDER = 'static/uploads'
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://casty:rathnesh12@localhost/messages'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

from flask_login import UserMixin
from werkzeug.security import generate_password_hash, check_password_hash


    
# Define the Message model
class Message(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    sender = db.Column(db.String(80), nullable=False)
    content = db.Column(db.Text, nullable=False)
    image_path = db.Column(db.String(200), nullable=True)
    replies = db.relationship('Reply', backref='message', lazy=True)

    def __repr__(self):
        return f'<Message {self.sender}>'

# Define the Reply model
class Reply(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    message_id = db.Column(db.Integer, db.ForeignKey('message.id'), nullable=False)
    content = db.Column(db.Text, nullable=False)
    image_path = db.Column(db.String(200), nullable=True)

    def __repr__(self):
        return f'<Reply {self.content}>'


class User(db.Model, UserMixin):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password_hash = db.Column(db.String(200), nullable=False)

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)


# Create the database tables
with app.app_context():
    db.create_all()

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/gpa')
def gpa():
    return render_template('gpa.html')

@app.route('/cgpa')
def cgpa():
    return render_template('cgpa.html')



@app.route('/gpa', methods=['POST'])
def calculate_gpa():
    data = request.json
    courses = data['courses']
    name = data.get('name', 'Student')
    save_results = data.get('save_results', False)
    export_to_excel = data.get('export_to_excel', False)
    export_to_png = data.get('export_to_png', False)

    total_points = sum(float(course['credits']) * float(course['grade_points']) for course in courses)
    total_credits = sum(float(course['credits']) for course in courses)
    gpa = total_points / total_credits if total_credits else 0

    if save_results:
        root = ET.Element("GPAResults")
        for course in courses:
            course_elem = ET.SubElement(root, "Course")
            ET.SubElement(course_elem, "CourseName").text = course['course_name']
            ET.SubElement(course_elem, "Credits").text = course['credits']
            ET.SubElement(course_elem, "GradePoint").text = course['grade_points']
        ET.SubElement(root, "GPA").text = str(gpa)
        tree = ET.ElementTree(root)
        tree.write("gpa_results.xml")

    if export_to_excel:
        df = pd.DataFrame(courses)
        df.rename(columns={'course_name': 'Course Name', 'credits': 'Credits', 'grade_points': 'Grade Points'}, inplace=True)  # Rename columns for Excel
        output = io.BytesIO()  # Use BytesIO for in-memory file handling
        with pd.ExcelWriter(output, engine='xlsxwriter') as writer:
            df.to_excel(writer, index=False)  # Write DataFrame to Excel
        output.seek(0)
        return send_file(output, download_name="gpa_results.xlsx", as_attachment=True)  # Use download_name instead of attachment_filename

    if export_to_png:
        df = pd.DataFrame(courses)
        df.rename(columns={'course_name': 'Course Name', 'credits': 'Credits', 'grade_points': 'Grade Points'}, inplace=True)  # Rename columns for PNG
        fig, ax = plt.subplots()
        ax.axis('tight')
        ax.axis('off')
        table = ax.table(cellText=df.values, colLabels=df.columns, cellLoc='center', loc='center')
        fig.suptitle(f"{name}'s GPA Results", fontsize=16)

        # Load custom font
        font_path = 'static/fonts/font.ttf'  # Change to the path of your custom font
        font_properties = FontProperties(fname=font_path, size=12)
        
        # Add GPA text
        plt.figtext(0.95, 0.05, f'Your GPA is {gpa:.2f}', ha='right', fontsize=12, color='blue', fontproperties=font_properties)
        
        img = io.BytesIO()  # Use BytesIO for in-memory file handling
        plt.savefig(img, format='png')
        img.seek(0)
        plt.close(fig)  # Close the figure to free resources
        return send_file(img, download_name="gpa_results.png", as_attachment=True)  # Use download_name instead of attachment_filename

    return jsonify({'gpa': gpa})

@app.route('/cgpa', methods=['POST'])
def calculate_cgpa():
    data = request.json
    print('Received data:', data)  # Print received data for debugging
    semesters = data['semesters']
    name = data.get('name', 'Student')
    save_results = data.get('save_results', False)
    export_to_excel = data.get('export_to_excel', False)
    export_to_png = data.get('export_to_png', False)

    total_points = sum(float(sem['gpa']) * float(sem['credits']) for sem in semesters)
    total_credits = sum(float(sem['credits']) for sem in semesters)
    cgpa = total_points / total_credits if total_credits else 0

    print('Calculated CGPA:', cgpa)  # Print calculated CGPA for debugging

    if save_results:
        data = {
            "Semester GPA": [sem['gpa'] for sem in semesters],
            "Credits": [sem['credits'] for sem in semesters],
        }
        df = pd.DataFrame(data)
        df.loc['CGPA', :] = ''  # Add an empty row for CGPA
        df.loc['CGPA', 'CGPA'] = cgpa  # Set the CGPA value
        output = io.BytesIO()  # Use BytesIO for in-memory file handling
        with pd.ExcelWriter(output, engine='xlsxwriter') as writer:
            df.to_excel(writer, index=True)  # Write DataFrame to Excel with index
            workbook = writer.book
            worksheet = writer.sheets['Sheet1']
            # Add formatting to the CGPA cell (bottom right)
            cell_format = workbook.add_format({'align': 'right', 'valign': 'bottom'})
            worksheet.write_blank(df.shape[0], df.shape[1] - 1, None, cell_format)
            worksheet.write(df.shape[0], df.shape[1] - 1, cgpa, cell_format)
        output.seek(0)
        return send_file(output, download_name="cgpa_results.xlsx", as_attachment=True)  # Use download_name instead of attachment_filename

    if export_to_excel:
        data = {
            "Semester GPA": [sem['gpa'] for sem in semesters],
            "Credits": [sem['credits'] for sem in semesters],
        }
        df = pd.DataFrame(data)
        output = io.BytesIO()  # Use BytesIO for in-memory file handling
        with pd.ExcelWriter(output, engine='xlsxwriter') as writer:
            df.to_excel(writer, index=False)  # Write DataFrame to Excel
        output.seek(0)
        return send_file(output, download_name="cgpa_results.xlsx", as_attachment=True)  # Use download_name instead of attachment_filename

    if export_to_png:
        # Create a DataFrame to hold the semester-wise GPA data
        df_semesters = pd.DataFrame(semesters)

        # Generate a table plot for semester-wise GPA data
        fig, ax = plt.subplots(figsize=(8, 6))
        ax.axis('tight')
        ax.axis('off')
        table = ax.table(cellText=df_semesters.values, colLabels=df_semesters.columns, cellLoc='center', loc='center')
        table.auto_set_font_size(False)
        table.set_fontsize(10)
        # Load custom font
        font_path = 'static/fonts/font.ttf'  # Change to the path of your custom font
        font_properties = FontProperties(fname=font_path, size=12)
        # Add CGPA value as text annotation in the bottom right corner with padding
        plt.text(0.95, 0.05, f'Your CGPA is: {cgpa:.2f}', ha='right', va='bottom', transform=ax.transAxes, fontsize=12, bbox=dict(facecolor='lightblue', alpha=0.5, edgecolor='black', boxstyle='round,pad=0.5'))

        # Save the plot to a BytesIO object
        img_buffer = io.BytesIO()
        plt.savefig(img_buffer, format='png')
        img_buffer.seek(0)

        # Close the plot to free resources
        plt.close()

        # Send the PNG file back to the client
        return send_file(img_buffer, mimetype='image/png', as_attachment=True, download_name="cgpa_results.png")

    return jsonify({'cgpa': cgpa})

@app.route('/about', methods=['GET', 'POST'])
def about():
    if request.method == 'POST':
        sender = request.form['nickname']
        content = request.form['message']
        image = request.files['image'] if 'image' in request.files else None

        image_path = None
        if image:
            image_path = f'static/uploads/{image.filename}'
            image.save(image_path)

        new_message = Message(sender=sender, content=content, image_path=image_path)
        db.session.add(new_message)
        db.session.commit()

        return redirect(url_for('about'))
    else:
        messages = Message.query.all()
        return render_template('about.html', messages=messages)

@app.route('/messages')
def show_messages():
    messages = Message.query.all()
    return render_template('messages.html', messages=messages)



# Load user callback for Flask-Login
@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']
        user = User.query.filter_by(username=username).first()
        if user and user.check_password(password):
            login_user(user)
            return redirect(url_for('respond_to_messages'))
        else:
            return 'Invalid credentials. Please try again.'
    return render_template('login.html')

@app.route('/logout')
@login_required
def logout():
    logout_user()
    return redirect(url_for('login'))

@app.route('/respond_to_messages', methods=['GET', 'POST'])
@login_required
def respond_to_messages():
    if request.method == 'POST':
        message_id = int(request.form['message_id'])
        reply_content = request.form['reply_content']
        image = request.files['image'] if 'image' in request.files else None

        image_path = None
        if image:
            filename = secure_filename(image.filename)
            image_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
            with Image.open(image) as img:
                resized_img = img.resize((128, 128))
                resized_img.save(image_path)

        new_reply = Reply(message_id=message_id, content=reply_content, image_path=image_path)
        db.session.add(new_reply)
        db.session.commit()
        return redirect(url_for('respond_to_messages'))

    messages = Message.query.all()
    return render_template('respond.html', messages=messages, enumerate=enumerate)

@app.route('/delete_message/<int:message_id>', methods=['POST'])
@login_required
def delete_message(message_id):
    message = Message.query.get(message_id)
    if message:
        # Delete all replies associated with the message
        Reply.query.filter_by(message_id=message.id).delete()
        # Delete the message itself
        db.session.delete(message)
        db.session.commit()
        print(f'Message with ID {message_id} and its replies deleted successfully!')
    else:
        print(f'Message with ID {message_id} does not exist.')
    return redirect(url_for('respond_to_messages'))

@app.route('/delete_reply/<int:reply_id>', methods=['POST'])
@login_required
def delete_reply(reply_id):
    reply = Reply.query.get_or_404(reply_id)
    db.session.delete(reply)
    db.session.commit()
    return redirect(url_for('respond_to_messages'))

@app.route('/modify_reply/<int:reply_id>', methods=['POST'])
@login_required
def modify_reply(reply_id):
    new_content = request.form['new_content']
    image = request.files['image'] if 'image' in request.files else None

    reply = Reply.query.get_or_404(reply_id)
    reply.content = new_content

    if image:
        filename = secure_filename(image.filename)
        image_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        with Image.open(image) as img:
                resized_img = img.resize((128, 128))
                resized_img.save(image_path)
        reply.image_path = image_path

    db.session.commit()
    return redirect(url_for('respond_to_messages'))

if __name__ == '__main__':
    app.run(debug=True, port=1337)
