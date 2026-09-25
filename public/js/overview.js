// --- SIDEBAR TOGGLE & NAVIGATION LOGIC ---
const sidebar = document.getElementById('sidebar');
const sidebarOverlay = document.getElementById('sidebarOverlay');
const openSidebarBtn = document.getElementById('openSidebar');
const closeSidebarBtn = document.getElementById('closeSidebar');
const sidebarLinks = document.querySelectorAll('.sidebar-link');

function openNav() {
    sidebar.classList.add('open');
    sidebarOverlay.classList.add('active');
    openSidebarBtn.setAttribute('aria-expanded', 'true');
}

function closeNav() {
    sidebar.classList.remove('open');
    sidebarOverlay.classList.remove('active');
    openSidebarBtn.setAttribute('aria-expanded', 'false');
}

openSidebarBtn.addEventListener('click', openNav);
closeSidebarBtn.addEventListener('click', closeNav);
sidebarOverlay.addEventListener('click', closeNav);

sidebarLinks.forEach(link => {
    link.addEventListener('click', function (e) {
        const href = this.getAttribute('href');

        // If navigating to an external page / HTML file, allow natural browser navigation
        if (href && !href.startsWith('#')) {
            closeNav();
            return;
        }

        // For internal anchor scroll links
        sidebarLinks.forEach(l => l.classList.remove('active'));
        this.classList.add('active');

        closeNav();
    });
});

// Submit an application to the backend
async function saveApplication(data) {
    const response = await fetch('/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });

    if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body.error || 'Failed to submit application');
    }

    return response.json();
}

// 1. KTRH Form Submission
document.getElementById('ktrhForm').addEventListener('submit', async function (e) {
    e.preventDefault();

    const applicantData = {
        fullName: document.getElementById('ktrhName').value,
        phone: document.getElementById('ktrhPhone').value,
        memberCategory: 'KTRH Staff',
        affiliation: document.getElementById('ktrhDept').value,
        location: 'KTRH Hospital',
        position: document.getElementById('ktrhPosition').value
    };

    try {
        await saveApplication(applicantData);
        alert(`Thank you ${applicantData.fullName}! Your KTRH Staff application has been submitted.`);
        this.reset();
    } catch (err) {
        alert(err.message);
    }
});

// 2. Non-KTRH Guest Form Submission
document.getElementById('nonKtrhForm').addEventListener('submit', async function (e) {
    e.preventDefault();

    const applicantData = {
        fullName: document.getElementById('guestName').value,
        phone: document.getElementById('guestPhone').value,
        memberCategory: 'Non-KTRH Guest',
        affiliation: document.getElementById('guestOccupation').value,
        location: document.getElementById('guestLocation').value,
        position: document.getElementById('guestPosition').value
    };

    try {
        await saveApplication(applicantData);
        alert(`Thank you ${applicantData.fullName}! Your Guest application has been submitted.`);
        this.reset();
    } catch (err) {
        alert(err.message);
    }
});
