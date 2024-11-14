const apiUrl = "http://localhost:3000";

const classList = document.getElementById("classList");
const classInput = document.getElementById("classInput");
const addClassBtn = document.getElementById("addClass");
const studentList = document.getElementById("studentList");
const studentInput = document.getElementById("studentInput");
const addStudentBtn = document.getElementById("addStudent");
const randomStudentBtn = document.getElementById("randomStudentBtn");
const randomStudentResult = document.getElementById("randomStudentResult");
const classTitle = document.getElementById("classTitle");
const resetButton = document.getElementById("resetButton");

let selectedClassId = null;
let calledStudents = [];

// Afficher les classes
async function fetchClasses() {
    const res = await fetch(`${apiUrl}/classrooms`);
    const classes = await res.json();
    displayClasses(classes);
}

function displayClasses(classes) {
    classList.innerHTML = "";
    classes.forEach((cls) => {
        const li = document.createElement("li");
        li.textContent = cls.name;
        li.addEventListener("click", () => selectClass(cls.id, cls.name));
        classList.appendChild(li);
    });
}

// Ajouter une classe
addClassBtn.addEventListener("click", async () => {
    const className = classInput.value.trim();
    if (className) {
        await fetch(`${apiUrl}/classrooms`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: className }),
        });
        classInput.value = "";
        fetchClasses();
    }
});

// Sélectionner une classe
async function selectClass(classId, className) {
    selectedClassId = classId;
    classTitle.textContent = className;
    addStudentBtn.disabled = false;
    randomStudentBtn.disabled = false;
    resetButton.disabled = false;
    calledStudents = [];
    fetchStudents(classId);
}

// Afficher les étudiants
async function fetchStudents(classId) {
    const res = await fetch(`${apiUrl}/classrooms/${classId}/students`);
    const students = await res.json();
    displayStudents(students);
}

function displayStudents(students) {
    studentList.innerHTML = "";
    students.forEach((student) => {
        const li = document.createElement("li");
        li.textContent = student.name;
        if (calledStudents.includes(student.name)) li.classList.add("called");
        studentList.appendChild(li);
    });
}

// Ajouter un étudiant
addStudentBtn.addEventListener("click", async () => {
    const studentName = studentInput.value.trim();
    if (studentName && selectedClassId !== null) {
        await fetch(`${apiUrl}/classrooms/${selectedClassId}/students`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: studentName }),
        });
        studentInput.value = "";
        fetchStudents(selectedClassId);
    }
});

// Appeler un étudiant au hasard
randomStudentBtn.addEventListener("click", async () => {
    const res = await fetch(`${apiUrl}/classrooms/${selectedClassId}/students`);
    const students = await res.json();
    const remainingStudents = students.filter(
        (student) => !calledStudents.includes(student.name)
    );

    if (remainingStudents.length === 0) {
        randomStudentResult.textContent = "Tous les étudiants sont passés.";
    } else {
        const randomIndex = Math.floor(
            Math.random() * remainingStudents.length
        );
        const randomStudent = remainingStudents[randomIndex];
        calledStudents.push(randomStudent.name);
        randomStudentResult.textContent = `${randomStudent.name} est appelé au tableau.`;
        displayStudents(students);
    }
});

// Réinitialiser la soutenance
resetButton.addEventListener("click", () => {
    calledStudents = [];
    randomStudentResult.textContent = "La soutenance est réinitialisée.";
    fetchStudents(selectedClassId);
});

// Initialiser l'application
fetchClasses();
