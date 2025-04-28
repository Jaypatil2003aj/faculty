// Check if user is logged in
const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
if (!loggedInUser) {
    alert('Please login first!');
    window.location.href = 'login.html';
}

// Set username on dashboard
document.getElementById('user-name').innerText = loggedInUser.name;

// Sidebar navigation handling
const sideMenu = document.querySelector("aside");
const menuBtn = document.getElementById("menu-btn");
const closeBtn = document.getElementById("close-btn");
const themeToggler = document.querySelector(".theme-toggler");
const logoutBtn = document.getElementById('logout-btn');
const sidebarLinks = document.querySelectorAll('.sidebar a');
const sections = document.querySelectorAll('.page-section');
const messageCount = document.getElementById('message-count');

// Mapping pages
const pageMap = {
    "Dashboard": "dashboard-section",
    "Department": "departments-section",
    "Leave": "leave-types-section",
    "Faculties": "faculties-section",
    "Messages": "messages-section",
    "Leave Management": "leave-management-section",
    "Settings": "settings-section"
};

// Sidebar navigation click
sidebarLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        sidebarLinks.forEach(l => l.classList.remove('active'));
        link.classList.add('active');

        const pageName = link.dataset.page;
        const sectionId = pageMap[pageName];
        if (!sectionId) return;

        sections.forEach(sec => sec.style.display = 'none');
        document.getElementById(sectionId).style.display = 'block';

        if (sectionId === 'messages-section') {
            if (loggedInUser.role === 'admin') {
                renderAdminMessagesLayout();
                setupTabs();
                renderApplications();
            } else {
                renderUserInbox();
            }
        }
    });
});

// Menu button
menuBtn.addEventListener('click', () => sideMenu.style.display = 'block');
closeBtn.addEventListener('click', () => sideMenu.style.display = 'none');

// Theme toggle
themeToggler.addEventListener('click', () => {
    document.body.classList.toggle('dark-theme-variables');
    themeToggler.querySelector('span:nth-child(1)').classList.toggle('active');
    themeToggler.querySelector('span:nth-child(2)').classList.toggle('active');
});

// Logout button
logoutBtn.addEventListener('click', function(e) {
    e.preventDefault();
    if (confirm('Are you sure you want to logout?')) {
        localStorage.removeItem('loggedInUser');
        window.location.href = 'login.html';
    }
});

// Show dashboard initially
document.getElementById('dashboard-section').style.display = 'block';

// Update current date
function updateDate() {
    const now = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    document.getElementById('current-date').innerText = now.toLocaleDateString('en-US', options);
}
updateDate();

// Handle departments and faculties (Optional part)

// --- LEAVE FORM SUBMISSION ---
const leaveForm = document.getElementById('leave-form');
leaveForm?.addEventListener('submit', function(e) {
    e.preventDefault();

    const name = document.getElementById('leave-name').value.trim();
    const email = document.getElementById('leave-email').value.trim();
    const reason = document.getElementById('leave-reason').value.trim();
    const fromDate = document.getElementById('leave-from').value;
    const toDate = document.getElementById('leave-to').value;

    if (!name || !email || !reason || !fromDate || !toDate) {
        alert('Please fill all fields!');
        return;
    }

    const newApplication = {
        id: Date.now(),
        name,
        email,
        reason,
        fromDate,
        toDate,
        status: 'pending'
    };

    let applications = JSON.parse(localStorage.getItem('leaveApplications')) || [];
    applications.push(newApplication);
    localStorage.setItem('leaveApplications', JSON.stringify(applications));

    leaveForm.reset();
    alert('Leave Application Submitted Successfully!');
    updateMessages();
});

// --- MESSAGES SECTION ---
function renderAdminMessagesLayout() {
    const messagesSection = document.getElementById('messages-section');
    messagesSection.innerHTML = `
        <h2>Leave Applications</h2>
        <div class="messages-header">
          <div class="tabs">
              <button class="tab-btn active" data-tab="pending">Pending</button>
              <button class="tab-btn" data-tab="approved">Approved</button>
              <button class="tab-btn" data-tab="rejected">Rejected</button>
          </div>
          <button id="clear-all-btn" class="clear-btn">Clear All Records</button>
        </div>
        <div id="pending" class="tab-content"></div>
        <div id="approved" class="tab-content" style="display:none;"></div>
        <div id="rejected" class="tab-content" style="display:none;"></div>
    `;
}

// Setup tabs
function setupTabs() {
    const tabs = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            const tabName = this.dataset.tab;
            tabContents.forEach(content => content.style.display = 'none');
            document.getElementById(tabName).style.display = 'block';
            renderApplications();
        });
    });
}

// Render applications
function renderApplications() {
    const apps = JSON.parse(localStorage.getItem('leaveApplications')) || [];
    const pendingContainer = document.getElementById('pending');
    const approvedContainer = document.getElementById('approved');
    const rejectedContainer = document.getElementById('rejected');

    if (!pendingContainer || !approvedContainer || !rejectedContainer) return;

    pendingContainer.innerHTML = '';
    approvedContainer.innerHTML = '';
    rejectedContainer.innerHTML = '';

    apps.forEach(app => {
        const card = document.createElement('div');
        card.className = 'application-card';
        card.innerHTML = `
            <h3>${app.name}</h3>
            <p><strong>Email:</strong> ${app.email}</p>
            <p><strong>Reason:</strong> ${app.reason}</p>
            <p><strong>From:</strong> ${app.fromDate}</p>
            <p><strong>To:</strong> ${app.toDate}</p>
            ${app.status === 'pending' ? `
                <button onclick="approveApplication(${app.id})">Approve</button>
                <button onclick="rejectApplication(${app.id})">Reject</button>
            ` : `<p><strong>Status:</strong> ${app.status}</p>`}
        `;
        if (app.status === 'pending') pendingContainer.appendChild(card);
        else if (app.status === 'approved') approvedContainer.appendChild(card);
        else if (app.status === 'rejected') rejectedContainer.appendChild(card);
    });
}

// Approve application
window.approveApplication = function(id) {
    let applications = JSON.parse(localStorage.getItem('leaveApplications')) || [];
    let userMessages = JSON.parse(localStorage.getItem('userMessages')) || {};
    const app = applications.find(app => app.id === id);
    if (!app) return;

    app.status = 'approved';

    if (!userMessages[app.email]) userMessages[app.email] = [];
    userMessages[app.email].push({
        title: "Leave Application Approved",
        message: `Hi ${app.name}, your leave from ${app.fromDate} to ${app.toDate} is approved.`
    });

    localStorage.setItem('leaveApplications', JSON.stringify(applications));
    localStorage.setItem('userMessages', JSON.stringify(userMessages));

    alert('Application Approved Successfully!');
    updateMessages();
}

// Reject application
window.rejectApplication = function(id) {
    const reason = prompt('Enter reason for rejection:');
    if (!reason) {
        alert('Rejection reason is mandatory.');
        return;
    }

    let applications = JSON.parse(localStorage.getItem('leaveApplications')) || [];
    let userMessages = JSON.parse(localStorage.getItem('userMessages')) || {};
    const app = applications.find(app => app.id === id);
    if (!app) return;

    app.status = 'rejected';
    app.rejectionReason = reason;

    if (!userMessages[app.email]) userMessages[app.email] = [];
    userMessages[app.email].push({
        title: "Leave Application Rejected",
        message: `Hi ${app.name}, your leave application was rejected. Reason: ${reason}`
    });

    localStorage.setItem('leaveApplications', JSON.stringify(applications));
    localStorage.setItem('userMessages', JSON.stringify(userMessages));

    alert('Application Rejected Successfully!');
    updateMessages();
}

// Clear all messages
document.addEventListener('click', function(e) {
    if (e.target && e.target.id === 'clear-all-btn') {
        if (confirm('Are you sure you want to clear all leave records?')) {
            localStorage.removeItem('leaveApplications');
            localStorage.removeItem('userMessages');
            alert('All leave records cleared successfully!');
            updateMessages();
        }
    }
});

// Render user inbox (for non-admin)
function renderUserInbox() {
    const messagesSection = document.getElementById('messages-section');
    const userInbox = JSON.parse(localStorage.getItem('userMessages')) || {};

    messagesSection.innerHTML = `<h2>Your Messages</h2>`;
    if (userInbox[loggedInUser.email]) {
        userInbox[loggedInUser.email].forEach(msg => {
            const messageCard = document.createElement('div');
            messageCard.className = 'application-card';
            messageCard.innerHTML = `
                <h3>${msg.title}</h3>
                <p>${msg.message}</p>
            `;
            messagesSection.appendChild(messageCard);
        });
    } else {
        messagesSection.innerHTML += `<p>No Messages Yet!</p>`;
    }
}

// Update messages
function updateMessages() {
    let applications = JSON.parse(localStorage.getItem('leaveApplications')) || [];
    const pendingApplications = applications.filter(app => app.status === 'pending');
    if (messageCount) {
        messageCount.innerText = pendingApplications.length;
    }
    if (loggedInUser.role === 'admin') {
        renderApplications();
    }
    renderAttendancePieChart(); // Update pie chart too
}

// Attendance Pie Chart
let attendanceChart;

function renderAttendancePieChart() {
    const apps = JSON.parse(localStorage.getItem('leaveApplications')) || [];
    const allFaculties = JSON.parse(localStorage.getItem('users'))?.filter(user => user.role === 'user') || [];

    const totalFaculties = allFaculties.length;
    const absentFaculties = apps.filter(app => app.status === 'approved').length;
    const presentFaculties = totalFaculties - absentFaculties;

    const ctx = document.getElementById('attendancePieChart')?.getContext('2d');
    if (!ctx) return;

    if (attendanceChart) {
        attendanceChart.destroy();
    }

    // Calculate percentages
    const presentPercent = totalFaculties > 0 ? ((presentFaculties / totalFaculties) * 100).toFixed(1) : 0;
    const absentPercent = totalFaculties > 0 ? ((absentFaculties / totalFaculties) * 100).toFixed(1) : 0;

    document.getElementById('present-percent').innerText = `Present: ${presentPercent}%`;
    document.getElementById('absent-percent').innerText = `Absent: ${absentPercent}%`;

    attendanceChart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: ['Present Faculties', 'Absent Faculties'],
            datasets: [{
                label: 'Faculty Attendance',
                data: [presentFaculties, absentFaculties],
                backgroundColor: [
                    'rgba(0, 255, 0, 0.6)',
                    'rgba(255, 0, 0, 0.6)'
                ],
                borderColor: [
                    'rgba(0, 255, 0, 1)',
                    'rgba(255, 0, 0, 1)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        color: '#333',
                        font: {
                            size: 14,
                            weight: 'bold'
                        }
                    }
                },
                title: {
                    display: true,
                    text: `Total Faculties: ${totalFaculties}`,
                    color: '#555',
                    font: {
                        size: 18
                    }
                },
                datalabels: {
                    color: '#fff',
                    font: {
                        weight: 'bold',
                        size: 14
                    },
                    formatter: (value, ctx) => {
                        return value;
                    }
                }
            }
        },
        plugins: [ChartDataLabels]
    });
}

// Initialize dashboard
updateMessages();
