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
        // Display GPA
        const resultElement = document.getElementById('result');
        resultElement.innerText = `Your GPA is: ${data.gpa.toFixed(2)}`;
        // Add reactions based on GPA
        const reactionDetails = determineReactionDetails(data.gpa);

        // Show overlay
        const overlay = document.querySelector('.overlay');
        overlay.style.display = 'block';

        // Show reaction container
        const reactionContainer = document.querySelector('.reaction-container');
        reactionContainer.style.display = 'block';
        

        // Show reaction text
        const reactionText = document.querySelector('.reaction-text');
        reactionText.innerText = reactionDetails.text;

        // Show reaction image
        const reactionImg = document.querySelector('.reaction-img');
        if (reactionDetails.width && reactionDetails.height) {
            reactionImg.style.width = `${reactionDetails.width}px`;
            reactionImg.style.height = `${reactionDetails.height}px`;
        } else {
            reactionImg.style.width = '100%';
            reactionImg.style.height = '100%';
        }
        reactionImg.src = reactionDetails.imageSrc;
        reactionImg.style.display = 'block';
        // Reset animation
        reactionContainer.style.animation = 'none';

        // Trigger reflow
        reactionContainer.offsetHeight;

        // const resultRect = resultElement.getBoundingClientRect();
        // //console.log('Result Rect:', resultRect); // Debugging
        // reactionContainer.style.top = `${resultRect.bottom + 50}px`; // Adjust as needed
        // reactionContainer.style.left = `${resultRect.left}px`; // Adjust as needed

        // Hide overlay and keep reaction container at the end point after 2 seconds
        setTimeout(function(){
            reactionContainer.style.animation = 'shrinkAndMove 0.5s forwards';
            setTimeout(function(){
                overlay.style.display = 'none';
                reactionContainer.style.display = 'none'; // Hide the container after animation
            }, 500); // Duration of the shrink and move animation
        }, 2000); // Adjust the duration (in milliseconds) as needed
    });
});

function determineReactionDetails(gpa) {
    if (gpa === 10.0) {
        return {
            text: "",
            imageSrc: "/static/images/tchgrass.png"
        };
    } else if (gpa >= 9.0) {
        return {
            text: "Nerd",
            imageSrc: "/static/images/nerd.png",
            width: 512,
            height: 512
        };
    } else if (gpa >= 8.0) {
        return {
            text: "PURRFECT!",
            imageSrc: "/static/images/purrfect.png"
        };
    } else if (gpa >= 7.0) {
        return {
            text: "Magnolia - carti",
            imageSrc: "/static/images/carti.png",
            width: 512,
            height: 512
        };
    } else if (gpa >= 6.0) {
        return {
            text: "mid asf",
            imageSrc: "/static/images/mid.png"
        };
    } else if (gpa >= 5.0) {
        return {
            text: "you do you man (you're cooked)",
            imageSrc: "/static/images/cooked.png"
        };
    } else if (gpa >= 4.0) {
        return {
            text: "You Can Do Better! (mb let the ai cook)",
            imageSrc: "/static/images/youcan.png"
        };
    } else if (gpa >= 3.0) {
        return {
            text: "Send Dudes",
            imageSrc: "/static/images/dudes.png"
        };
    } else if (gpa >= 2.0) {
        return {
            text: "Caption.",
            imageSrc: "/static/images/of.png"
        };
    } else {
        return {
            text: "WAHAHAAHAHHAHAH",
            imageSrc: "/static/images/haha.png"
        };
    }
}




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

