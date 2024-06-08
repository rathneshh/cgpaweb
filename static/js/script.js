document.getElementById('addCourse').addEventListener('click', () => {
    const coursesDiv = document.getElementById('courses');
    const newCourse = document.createElement('div');
    newCourse.classList.add('course');
    newCourse.innerHTML = `
        <input type="checkbox">
        <input type="text" placeholder="Course Name">
        <input type="number" placeholder="Credits">
        <input type="number" step="0.01" placeholder="Grade Point">
    `;
    coursesDiv.appendChild(newCourse);
});

document.getElementById('deleteCourse').addEventListener('click', () => {
    const coursesDiv = document.getElementById('courses');
    const courses = document.querySelectorAll('#courses .course');
    courses.forEach(course => {
        if (course.children[0].checked) {
            coursesDiv.removeChild(course);
        }
    });
});

document.getElementById('calculateGPA').addEventListener('click', () => {
    const courses = document.querySelectorAll('#courses .course');
    const courseData = Array.from(courses).map(course => ({
        name: course.children[1].value,
        credits: course.children[2].value,
        grade: course.children[3].value
    }));
    const name = document.getElementById('studentName').value || "Student";
    fetch('/gpa', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ courses: courseData, name: name, save_results: true })
    })
    .then(response => response.json())
    .then(data => {
        document.getElementById('result').innerText = `Your GPA is: ${data.gpa.toFixed(2)}`;
    });
});

document.getElementById('exportToExcel').addEventListener('click', () => {
    const courses = document.querySelectorAll('#courses .course');
    const courseData = Array.from(courses).map(course => ({
        name: course.children[1].value,
        credits: course.children[2].value,
        grade: course.children[3].value
    }));
    const name = document.getElementById('studentName').value || "Student";
    fetch('/gpa', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ courses: courseData, name: name, export_to_excel: true })
    })
    .then(response => response.blob())
    .then(blob => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = 'gpa_results.xlsx';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
    });
});

document.getElementById('exportToPNG').addEventListener('click', () => {
    const courses = document.querySelectorAll('#courses .course');
    const courseData = Array.from(courses).map(course => ({
        name: course.children[1].value,
        credits: course.children[2].value,
        grade: course.children[3].value
    }));
    const name = document.getElementById('studentName').value || "Student";
    fetch('/gpa', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ courses: courseData, name: name, export_to_png: true })
    })
    .then(response => response.blob())
    .then(blob => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = 'gpa_results.png';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
    });
});

document.getElementById('addSemester').addEventListener('click', () => {
    const semestersDiv = document.getElementById('semesters');
    const newSemester = document.createElement('div');
    newSemester.classList.add('semester');
    newSemester.innerHTML = `
        <input type="checkbox">
        <input type="number" step="0.01" placeholder="Semester GPA">
        <input type="number" placeholder="Credits">
    `;
    semestersDiv.appendChild(newSemester);
});

document.getElementById('deleteSemester').addEventListener('click', () => {
    const semestersDiv = document.getElementById('semesters');
    const semesters = document.querySelectorAll('#semesters .semester');
    semesters.forEach(semester => {
        if (semester.children[0].checked) {
            semestersDiv.removeChild(semester);
        }
    });
});

document.getElementById('calculateCGPA').addEventListener('click', () => {
    const semesters = document.querySelectorAll('#semesters .semester');
    const semesterData = Array.from(semesters).map(semester => ({
        gpa: semester.children[1].value,
        credits: semester.children[2].value
    }));
    const name = document.getElementById('studentName').value || "Student";
    fetch('/cgpa', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ semesters: semesterData, name: name, save_results: true })
    })
    .then(response => response.json())
    .then(data => {
        document.getElementById('result').innerText = `Your CGPA is: ${data.cgpa.toFixed(2)}`;
    });
});

document.getElementById('exportCGPAToExcel').addEventListener('click', () => {
    const semesters = document.querySelectorAll('#semesters .semester');
    const semesterData = Array.from(semesters).map(semester => ({
        gpa: semester.children[1].value,
        credits: semester.children[2].value
    }));
    const name = document.getElementById('studentName').value || "Student";
    fetch('/cgpa', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ semesters: semesterData, name: name, export_to_excel: true })
    })
    .then(response => response.blob())
    .then(blob => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = 'cgpa_results.xlsx';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
    });
});
