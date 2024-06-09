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
    let totalPoints = 0;
    let totalCredits = 0;

    semesters.forEach(semester => {
        const gpa = parseFloat(semester.children[1].value);
        const credits = parseFloat(semester.children[2].value);

        if (!isNaN(gpa) && !isNaN(credits)) {
            totalPoints += gpa * credits;
            totalCredits += credits;
        }
    });

    const cgpa = totalPoints / totalCredits;
    const resultElement = document.getElementById('result');
    resultElement.innerText = isNaN(cgpa) ? 'Please enter valid GPA and Credits for all semesters.' : `Your CGPA is: ${cgpa.toFixed(2)}`;

    // Add reactions based on CGPA
    const reactionDetails = determineReactionDetailsCGPA(cgpa);

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
    
    // Apply animation
    setTimeout(() => {
        reactionContainer.style.animation = 'shrinkAndMove 0.5s forwards';
        setTimeout(() => {
            overlay.style.display = 'none';
            reactionContainer.style.display = 'none'; // Hide the container after animation
        }, 500); // Duration of the shrink and move animation
    }, 2000); // Adjust the duration (in milliseconds) as needed
});

function determineReactionDetailsCGPA(cgpa) {
    // Define your reaction details based on CGPA
    // Example:
    if (cgpa === 10.0) {
        return {
            text: "",
            imageSrc: "/static/images/tchgrass.png"
        };
    } else if (cgpa >= 9.0) {
        return {
            text: "Nerd",
            imageSrc: "/static/images/nerd.png",
            width: 512,
            height: 512
        };
    } else if (cgpa >= 8.0) {
        return {
            text: "PURRFECT!",
            imageSrc: "/static/images/purrfect.png"
        };
    } else if (cgpa >= 7.0) {
        return {
            text: "Magnolia - carti",
            imageSrc: "/static/images/carti.png",
            width: 512,
            height: 512
        };
    } else if (cgpa >= 6.0) {
        return {
            text: "mid asf",
            imageSrc: "/static/images/mid.png"
        };
    } else if (cgpa >= 5.0) {
        return {
            text: "you do you man (you're cooked)",
            imageSrc: "/static/images/cooked.png"
        };
    } else if (cgpa >= 4.0) {
        return {
            text: "You Can Do Better! (mb let the ai cook)",
            imageSrc: "/static/images/youcan.png"
        };
    } else if (cgpa >= 3.0) {
        return {
            text: "Send Dudes",
            imageSrc: "/static/images/dudes.png"
        };
    } else if (cgpa >= 2.0) {
        return {
            text: "Caption.",
            imageSrc: "/static/images/of.png"
        };
    } else if (cgpa < 2.0) {
        return {
            text: "WAHAHAAHAHHAHAH",
            imageSrc: "/static/images/haha.png"
        };
    }
}




document.getElementById('exportCGPAToExcel').addEventListener('click', () => {
    const semesters = document.querySelectorAll('#semesters .semester');
    const semesterData = Array.from(semesters).map(semester => ({
        gpa: parseFloat(semester.children[1].value),
        credits: parseFloat(semester.children[2].value)
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
    })
    .catch(error => {
        console.error('Error exporting CGPA to Excel:', error);
        document.getElementById('result').innerText = 'Error exporting CGPA to Excel.';
    });
});

document.getElementById('exportToPNG').addEventListener('click', () => {
    const semesters = document.querySelectorAll('#semesters .semester');
    const semesterData = Array.from(semesters).map(semester => ({
        gpa: parseFloat(semester.children[1].value),
        credits: parseFloat(semester.children[2].value)
    }));
    const name = document.getElementById('studentName').value || "Student";

    fetch('/cgpa', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ semesters: semesterData, name: name, export_to_png: true })
    })
    .then(response => response.blob())
    .then(blob => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = 'cgpa_results.png';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
    })
    .catch(error => {
        console.error('Error exporting CGPA to PNG:', error);
        document.getElementById('result').innerText = 'Error exporting CGPA to PNG.';
    });
});
