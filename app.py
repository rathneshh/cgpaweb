from flask import Flask, render_template, request, jsonify, send_file
import xml.etree.ElementTree as ET
import pandas as pd
import matplotlib
matplotlib.use('Agg')  # Use 'Agg' backend to avoid GUI issues
import matplotlib.pyplot as plt
import io
import os
from matplotlib.font_manager import FontProperties

app = Flask(__name__)

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/gpa')
def gpa():
    return render_template('gpa.html')

@app.route('/cgpa')
def cgpa():
    return render_template('cgpa.html')

@app.route('/about')
def about():
    return render_template('about.html')

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
    semesters = data['semesters']
    name = data.get('name', 'Student')
    save_results = data.get('save_results', False)
    export_to_excel = data.get('export_to_excel', False)

    total_points = sum(float(sem['gpa']) * float(sem['credits']) for sem in semesters)
    total_credits = sum(float(sem['credits']) for sem in semesters)
    cgpa = total_points / total_credits if total_credits else 0

    if save_results:
        data = {
            "Semester GPA": [sem['gpa'] for sem in semesters],
            "Credits": [sem['credits'] for sem in semesters],
            "CGPA": [cgpa] * len(semesters)
        }
        df = pd.DataFrame(data)
        output = io.BytesIO()  # Use BytesIO for in-memory file handling
        with pd.ExcelWriter(output, engine='xlsxwriter') as writer:
            df.to_excel(writer, index=False)  # Write DataFrame to Excel
        output.seek(0)
        return send_file(output, download_name="cgpa_results.xlsx", as_attachment=True)  # Use download_name instead of attachment_filename

    return jsonify({'cgpa': cgpa})

if __name__ == '__main__':
    app.run(debug=True, port=1337)
