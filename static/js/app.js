let performanceChart = null;
let radarChartInstance = null;
let globalStudentData = [];

// ==========================================
// SINGLE, UNIFIED DOM INITIALIZATION ENGINE
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    
    // --- 1. HANDLE MENU SIDEBAR HIGHLIGHTING ---
    const dashboardMenu = document.getElementById('menuDashboard');
    const analysisMenu = document.getElementById('menuAnalysis');

    if (dashboardMenu && window.location.pathname === '/') {
        dashboardMenu.classList.add('active-link');
    }
    if (analysisMenu && window.location.pathname === '/analysis') {
        analysisMenu.classList.add('active-link');
    }

    // --- 2. CORE SYSTEM DATA CAPTURE ---
    if (document.getElementById('rankingTable') || document.getElementById('rankingChart')) {
        fetchRankings();
    }

    // --- 3. STUDENT REGISTRATION FORM SUBMISSION ---
    const studentForm = document.getElementById('studentForm');
    if (studentForm) {
        studentForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const payload = {
                name: document.getElementById('sName').value,
                roll_number: document.getElementById('sRoll').value,
                academic_score: parseFloat(document.getElementById('sAcad').value),
                attendance_score: parseFloat(document.getElementById('sAttend').value)
            };
            sendData('/api/students', payload, 'studentForm');
        });
    }

    // --- 4. EXTRACURRICULAR ACHIEVEMENT SUBMISSION ---
    const achievementForm = document.getElementById('achievementForm');
    if (achievementForm) {
        achievementForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const payload = {
                roll_number: document.getElementById('aRoll').value,
                title: document.getElementById('aTitle').value,
                category: document.getElementById('aCategory').value,
                points: parseFloat(document.getElementById('aPoints').value)
            };
            sendData('/api/achievements', payload, 'achievementForm');
        });
    }

    // --- 5. DATA ANALYSIS RADAR DROPDOWN CHANGE LISTENER ---
    const selectorMenu = document.getElementById('studentSelector');
    if (selectorMenu) {
        selectorMenu.addEventListener('change', (e) => {
            const selectedIndex = e.target.value;
            if (globalStudentData[selectedIndex]) {
                updateRadarChart(globalStudentData[selectedIndex]);
            }
        });
    }
});

// ==========================================
// CORE CORE FUNCTION PIPELINES
// ==========================================

// Client-side quick filter engine for real-time dashboard searches
function filterLeaderboardTable() {
    const input = document.getElementById('tableSearch');
    const filter = input.value.toLowerCase();
    const table = document.getElementById('rankingTable');
    const trs = table.getElementsByTagName('tr');

    for (let i = 1; i < trs.length; i++) {
        let nameField = trs[i].getElementsByTagName('td')[2];
        let rollField = trs[i].getElementsByTagName('td')[1];
        if (nameField || rollField) {
            let nameTxt = nameField.textContent || nameField.innerText;
            let rollTxt = rollField.textContent || rollField.innerText;
            if (nameTxt.toLowerCase().indexOf(filter) > -1 || rollTxt.toLowerCase().indexOf(filter) > -1) {
                trs[i].style.display = "";
            } else {
                trs[i].style.display = "none";
            }
        }
    }
}

// Asynchronous wrapper processing standard backend updates
function sendData(url, payload, formId) {
    fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    })
    .then(res => res.json())
    .then(data => {
        if (data.error) {
            alert("Error: " + data.error);
        } else {
            alert("Success: " + data.message);
            document.getElementById(formId).reset();
            fetchRankings(); 
        }
    });
}

// Fetch global records data arrays safely from internal JSON API endpoint 
function fetchRankings() {
    fetch('/api/rankings')
        .then(res => res.json())
        .then(data => {
            globalStudentData = data;
            
            updateTopSummaryMetrics(data);

            const tbody = document.querySelector('#rankingTable tbody');
            if (tbody) {
                tbody.innerHTML = '';
                data.forEach(student => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td><strong>#${student.rank}</strong></td>
                        <td>${student.roll_number}</td>
                        <td>${student.name}</td>
                        <td>${student.academic_score}</td>
                        <td>${student.attendance_score}%</td>
                        <td>${student.extracurricular_score}</td>
                        <td><strong>${student.final_score}</strong></td>
                    `;
                    tbody.appendChild(row);
                });
            }

            if (document.getElementById('rankingChart')) {
                populateDropdownMenu(data);
                renderAnalysisChart(data);
                if (data.length > 0) { updateRadarChart(data[0]); }
            }
        });
}

// Compute batch mathematical statistics for metric summary tiles
function updateTopSummaryMetrics(data) {
    const totalNode = document.getElementById('statTotalStudents');
    const avgNode = document.getElementById('statAvgScore');
    const topperNode = document.getElementById('statTopPerformer');

    if (!totalNode) return; 

    const count = data.length;
    totalNode.textContent = count;

    if (count > 0) {
        let aggregateSum = data.reduce((acc, curr) => acc + curr.final_score, 0);
        avgNode.textContent = (aggregateSum / count).toFixed(1);
        topperNode.textContent = data[0].name; 
    } else {
        avgNode.textContent = "0.0";
        topperNode.textContent = "-";
    }
}

// Populate structural select box option lists dynamically
function populateDropdownMenu(data) {
    const selector = document.getElementById('studentSelector');
    if (!selector || selector.options.length > 0) return;

    data.forEach((student, index) => {
        const option = document.createElement('option');
        option.value = index;
        option.textContent = `${student.name} (${student.roll_number})`;
        selector.appendChild(option);
    });
}

// Chart.js Bar Chart Render Configuration Logic Block
function renderAnalysisChart(studentData) {
    const ctx = document.getElementById('rankingChart').getContext('2d');
    const labels = studentData.map(s => s.name);
    const compositeScores = studentData.map(s => s.final_score);
    const academicScores = studentData.map(s => s.academic_score);

    if (performanceChart) { performanceChart.destroy(); }

    performanceChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Composite Weighted Score',
                    data: compositeScores,
                    backgroundColor: 'rgba(52, 152, 219, 0.6)',
                    borderColor: 'rgba(52, 152, 219, 1)',
                    borderWidth: 2
                },
                {
                    label: 'Raw Academic Score',
                    data: academicScores,
                    borderColor: 'rgba(46, 204, 113, 1)',
                    backgroundColor: 'transparent',
                    borderWidth: 3,
                    type: 'line',
                    tension: 0.2
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: { y: { beginAtZero: true, max: 100 } }
        }
    });
}

// Chart.js Radar Chart Render Configuration Logic Block
function updateRadarChart(student) {
    const radarCanvas = document.getElementById('radarChart');
    if (!radarCanvas) return;

    const ctx = radarCanvas.getContext('2d');
    if (radarChartInstance) { radarChartInstance.destroy(); }

    radarChartInstance = new Chart(ctx, {
        type: 'radar',
        data: {
            labels: ['Academic Prowess', 'Attendance Consistency', 'Extracurricular Footprint'],
            datasets: [{
                label: `${student.name}'s Footprint Metrics`,
                data: [student.academic_score, student.attendance_score, student.extracurricular_score * 2],
                backgroundColor: 'rgba(155, 89, 182, 0.2)',
                borderColor: 'rgba(155, 89, 182, 1)',
                pointBackgroundColor: 'rgba(155, 89, 182, 1)',
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: { r: { angleLines: { display: true }, suggestedMin: 0, suggestedMax: 100 } }
        }
    });
}
// ==========================================
// ADVANCED LAYER: REAL-TIME DYNAMIC WEIGHT RECALCULATION
// ==========================================

function adjustWeights(changedSlider) {
    // 1. Grab current slider values
    let wAcad = parseInt(document.getElementById('weightAcad').value);
    let wAttend = parseInt(document.getElementById('weightAttend').value);
    let wAchieve = parseInt(document.getElementById('weightCheck') ? 0 : document.getElementById('weightAchieve').value);

    // 2. Update the numeric label text indicators instantly
    document.getElementById('wAcadVal').textContent = wAcad;
    document.getElementById('wAttendVal').textContent = wAttend;
    document.getElementById('wAchieveVal').textContent = wAchieve;

    let total = wAcad + wAttend + wAchieve;
    const warningBox = document.getElementById('weightWarning');
    const totalNumSpan = document.getElementById('weightTotalNum');

    // 3. Validation feedback check
    if (total !== 100) {
        totalNumSpan.textContent = total;
        warningBox.style.display = "block";
        // Optional: you can leave the table as is or continue computing based on relative normalization
    } else {
        warningBox.style.display = "none";
    }

    // Update table title details subtitle context text mapping string template
    document.getElementById('weightSubtitle').textContent = `Weights: Academics (${wAcad}%) | Attendance (${wAttend}%) | Achievements (${wAchieve}%)`;

    // 4. Recalculate and Re-sort local memory datasets without firing database backend queries!
    recalculateLeaderboardLocal(wAcad / 100, wAttend / 100, wAchieve / 100);
}

function recalculateLeaderboardLocal(wAcadPct, wAttendPct, wAchievePct) {
    if (!globalStudentData || globalStudentData.length === 0) return;

    // Recalculate composite criteria scores based on new floating point modifiers
    let computedList = globalStudentData.map(student => {
        // Match algorithm criteria: Academics raw + Attendance raw + Achievements points normalized (scaled)
        let rawFinal = (student.academic_score * wAcadPct) + 
                       (student.attendance_score * wAttendPct) + 
                       (student.extracurricular_score * 2 * wAchievePct);
        
        return {
            ...student,
            final_score: parseFloat(rawFinal.toFixed(1))
        };
    });

    // Re-sort array descending by the new computed final values
    computedList.sort((a, b) => b.final_score - a.final_score);

    // Assign new dynamic relative ranking ranks
    computedList.forEach((student, index) => {
        student.rank = index + 1;
    });

    // Repopulate table UI layout immediately with the newly sorted layout records array
    const tbody = document.querySelector('#rankingTable tbody');
    if (tbody) {
        tbody.innerHTML = '';
        computedList.forEach(student => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td><strong>#${student.rank}</strong></td>
                <td>${student.roll_number}</td>
                <td>${student.name}</td>
                <td>${student.academic_score}</td>
                <td>${student.attendance_score}%</td>
                <td>${student.extracurricular_score}</td>
                <td><strong>${student.final_score}</strong></td>
            `;
            tbody.appendChild(row);
        });
    }
    
    // Update metric tiles instantly to reflect the new dynamic top ranker!
    updateTopSummaryMetrics(computedList);
}