// SIDEBAR TOGGLE & SECTION SWITCHING
const menuToggle = document.getElementById('menuToggle');
const sidebar = document.getElementById('sidebar');
const mainWrapper = document.getElementById('mainWrapper');
const navLinks = document.querySelectorAll('.nav-link');
const adminSections = document.querySelectorAll('.admin-section');
const headerTitle = document.getElementById('headerTitle');
const logoutBtn = document.getElementById('logoutBtn');

menuToggle.addEventListener('click', () => {
    if (window.innerWidth <= 768) {
        sidebar.classList.toggle('active-mobile');
    } else {
        sidebar.classList.toggle('collapsed');
        mainWrapper.classList.toggle('expanded');
    }
});

navLinks.forEach(link => {
    link.addEventListener('click', function (e) {
        if (this.getAttribute('target') === '_blank') return;
        e.preventDefault();

        navLinks.forEach(l => l.classList.remove('active'));
        this.classList.add('active');

        adminSections.forEach(s => s.classList.remove('active'));
        const targetId = this.getAttribute('data-target');
        document.getElementById(targetId).classList.add('active');

        // Update Header Title dynamically based on active tab
        headerTitle.textContent = this.textContent.replace(/^[^\s]+\s/, '');

        if (window.innerWidth <= 768) {
            sidebar.classList.remove('active-mobile');
        }
    });
});

logoutBtn.addEventListener('click', async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    window.location.href = '/admin';
});

// Redirect to login if the session has expired and an API call comes back unauthorized
function handleUnauthorized(response) {
    if (response.status === 401) {
        window.location.href = '/admin';
        return true;
    }
    return false;
}

// FORM LOGIC FOR POSTS & EVENTS
const postType = document.getElementById('postType');
const eventFields = document.querySelectorAll('.event-field');
const publishForm = document.getElementById('publishForm');
const publishedTableBody = document.getElementById('publishedTableBody');

postType.addEventListener('change', function () {
    if (this.value === 'event') {
        eventFields.forEach(f => f.classList.remove('hidden'));
    } else {
        eventFields.forEach(f => f.classList.add('hidden'));
    }
});

async function getPublishedItems() {
    const response = await fetch('/api/posts');
    if (handleUnauthorized(response)) return [];
    return response.json();
}

async function renderPublishedTable() {
    const items = await getPublishedItems();
    publishedTableBody.innerHTML = '';

    if (items.length === 0) {
        publishedTableBody.innerHTML = `<tr><td colspan="4" class="empty-msg">No custom posts or events published yet.</td></tr>`;
        return;
    }

    items.forEach(item => {
        const isEvent = item.type === 'event';
        const badgeClass = isEvent ? 'badge-guest' : 'badge-ktrh';
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><span class="badge ${badgeClass}">${isEvent ? 'EVENT' : 'POST'}</span></td>
            <td><strong>${item.title}</strong></td>
            <td>${isEvent ? `📅 ${item.date} | 📍 ${item.location || 'N/A'}` : `Posted: ${item.date}`}</td>
            <td><button class="action-btn" onclick="deletePublishedItem(${item.id})">Delete</button></td>
        `;
        publishedTableBody.appendChild(row);
    });
}

publishForm.addEventListener('submit', async function (e) {
    e.preventDefault();

    const type = postType.value;
    const newItem = {
        type,
        title: document.getElementById('postTitle').value,
        content: document.getElementById('postContent').value,
        date: type === 'event' ? document.getElementById('eventDate').value : undefined,
        time: type === 'event' ? document.getElementById('eventTime').value : undefined,
        location: type === 'event' ? document.getElementById('eventVenue').value : undefined
    };

    const response = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newItem)
    });

    if (handleUnauthorized(response)) return;

    if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        alert(body.error || 'Failed to publish');
        return;
    }

    alert('Published successfully!');
    publishForm.reset();
    eventFields.forEach(f => f.classList.add('hidden'));
    renderPublishedTable();
});

window.deletePublishedItem = async function (id) {
    if (!confirm('Delete this published post/event?')) return;
    const response = await fetch(`/api/posts/${id}`, { method: 'DELETE' });
    if (handleUnauthorized(response)) return;
    renderPublishedTable();
};

// APPLICANTS TABLE LOGIC
const tableBody = document.getElementById('applicantTableBody');
const searchInput = document.getElementById('searchInput');
const filterCategory = document.getElementById('filterCategory');
const totalCountEl = document.getElementById('totalCount');
const clearAllBtn = document.getElementById('clearAllBtn');

let cachedApplications = [];

async function getApplications() {
    const response = await fetch('/api/applications');
    if (handleUnauthorized(response)) return [];
    return response.json();
}

function renderTable() {
    const searchTerm = searchInput.value.toLowerCase();
    const selectedCategory = filterCategory.value;

    const filteredApps = cachedApplications.filter(app => {
        const matchesSearch = app.fullName.toLowerCase().includes(searchTerm) ||
                              app.phone.toLowerCase().includes(searchTerm) ||
                              app.position.toLowerCase().includes(searchTerm);

        const matchesCategory = selectedCategory === 'ALL' || app.memberCategory === selectedCategory;

        return matchesSearch && matchesCategory;
    });

    totalCountEl.textContent = `Total Applicants: ${filteredApps.length}`;
    tableBody.innerHTML = '';

    if (filteredApps.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="8" class="empty-msg">No applicant records found.</td></tr>`;
        return;
    }

    filteredApps.forEach(app => {
        const badgeClass = app.memberCategory === 'KTRH Staff' ? 'badge-ktrh' : 'badge-guest';
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${app.submittedAt}</td>
            <td><strong>${app.fullName}</strong></td>
            <td><a href="tel:${app.phone}">${app.phone}</a></td>
            <td><span class="badge ${badgeClass}">${app.memberCategory}</span></td>
            <td>${app.affiliation || 'N/A'}</td>
            <td>${app.location || 'N/A'}</td>
            <td>${app.position}</td>
            <td><button class="action-btn" onclick="deleteRecord(${app.id})">Delete</button></td>
        `;
        tableBody.appendChild(row);
    });
}

async function loadApplications() {
    cachedApplications = await getApplications();
    renderTable();
}

window.deleteRecord = async function (id) {
    if (!confirm('Are you sure you want to delete this applicant?')) return;
    const response = await fetch(`/api/applications/${id}`, { method: 'DELETE' });
    if (handleUnauthorized(response)) return;
    loadApplications();
};

clearAllBtn.addEventListener('click', async function () {
    if (!confirm('Warning: This will permanently delete ALL applicant submissions.')) return;
    const response = await fetch('/api/applications', { method: 'DELETE' });
    if (handleUnauthorized(response)) return;
    loadApplications();
});

searchInput.addEventListener('input', renderTable);
filterCategory.addEventListener('change', renderTable);

// INITIAL LOAD
renderPublishedTable();
loadApplications();
