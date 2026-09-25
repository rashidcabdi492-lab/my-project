const feedContainer = document.getElementById('feedContainer');
const searchInput = document.getElementById('searchInput');
const tabButtons = document.querySelectorAll('.tab-btn');

let currentFilter = 'all';
let cachedItems = [];

// Retrieve published posts/events from the backend
async function fetchPublishedItems() {
    const response = await fetch('/api/posts');
    if (!response.ok) return [];
    return response.json();
}

// Render posts/events into the page
function renderFeed() {
    const searchTerm = searchInput.value.toLowerCase();

    // Filter items by tab and search box
    const filteredItems = cachedItems.filter(item => {
        const matchesTab = currentFilter === 'all' || item.type === currentFilter;
        const matchesSearch = item.title.toLowerCase().includes(searchTerm) ||
                              item.content.toLowerCase().includes(searchTerm);
        return matchesTab && matchesSearch;
    });

    feedContainer.innerHTML = '';

    if (filteredItems.length === 0) {
        feedContainer.innerHTML = `
            <div class="empty-feed">
                <h3>No posts or events found</h3>
                <p>Check back later for new announcements from the Polaris FC management.</p>
            </div>
        `;
        return;
    }

    // Generate HTML for each post or event
    filteredItems.forEach(item => {
        const card = document.createElement('div');
        card.className = 'feed-card';

        const isEvent = item.type === 'event';
        const badgeText = isEvent ? 'Upcoming Event' : 'News & Post';
        const badgeClass = isEvent ? 'badge-event' : 'badge-post';

        card.innerHTML = `
            <div class="card-content">
                <span class="card-type-badge ${badgeClass}">${badgeText}</span>
                <h2 class="card-title">${item.title}</h2>
                <div class="card-meta">Posted on ${item.date} ${item.author ? 'by ' + item.author : ''}</div>

                ${isEvent ? `
                    <div class="event-details">
                        <p>📅 <strong>Date:</strong> ${item.date}</p>
                        ${item.time ? `<p>⏰ <strong>Time:</strong> ${item.time}</p>` : ''}
                        ${item.location ? `<p>📍 <strong>Venue:</strong> ${item.location}</p>` : ''}
                    </div>
                ` : ''}

                <div class="card-body">
                    <p>${item.content}</p>
                </div>
            </div>
        `;

        feedContainer.appendChild(card);
    });
}

async function loadFeed() {
    cachedItems = await fetchPublishedItems();
    renderFeed();
}

// Tab Filter Switching
tabButtons.forEach(btn => {
    btn.addEventListener('click', function () {
        tabButtons.forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        currentFilter = this.getAttribute('data-filter');
        renderFeed();
    });
});

// Search Input Handling
searchInput.addEventListener('input', renderFeed);

// Initial Load
loadFeed();
