// Handle Login Form Submission
const loginForm = document.getElementById('login-form');

if (loginForm) {
    loginForm.addEventListener('submit', (event) => {
        event.preventDefault(); // Prevent actual form submission

        const username = document.getElementById('username').value;
        // For demonstration, we'll just alert the username
        alert(`Logged in as ${username}`);
        // Clear the form
        loginForm.reset();
    });
}

// Like and Subscribe Buttons (only on video.html)
if (document.getElementById('like-button')) {
    const likeButton = document.getElementById('like-button');
    likeButton.addEventListener('click', () => {
        if (likeButton.textContent === 'Like 👍') {
            likeButton.textContent = 'Liked 👍';
            likeButton.style.backgroundColor = '#4CAF50';
            likeButton.style.color = '#fff';
        } else {
            likeButton.textContent = 'Like 👍';
            likeButton.style.backgroundColor = '#e1e1e1';
            likeButton.style.color = '#000';
        }
    });
}

if (document.getElementById('subscribe-button')) {
    const subscribeButton = document.getElementById('subscribe-button');
    subscribeButton.addEventListener('click', () => {
        if (subscribeButton.textContent === 'Subscribe') {
            subscribeButton.textContent = 'Subscribed ✔️';
            subscribeButton.style.backgroundColor = '#4CAF50';
            subscribeButton.style.color = '#fff';
        } else {
            subscribeButton.textContent = 'Subscribe';
            subscribeButton.style.backgroundColor = '#e1e1e1';
            subscribeButton.style.color = '#000';
        }
    });
}


function getQueryParams() {
    const params = {};
    window.location.search.substring(1).split("&").forEach(pair => {
        const [key, value] = pair.split("=");
        params[key] = decodeURIComponent(value);
    });
    return params;
}

// Populate video details based on URL parameter
const params = getQueryParams();
if (params.video) {
    const videoId = params.video;
    const videoTitle = `Video Title ${videoId}`;
    const videoDescription = `This is the description for Video ${videoId}. Enjoy watching!`;

    document.getElementById('video-title').textContent = videoTitle;
    document.getElementById('video-description').textContent = videoDescription;

    // Optionally, change the video player image
    const videoPlayer = document.querySelector('.video-player img');
    videoPlayer.src = `https://via.placeholder.com/640x360.png?text=Video+${videoId}`;
    videoPlayer.alt = `Video Player ${videoId}`;
}

document.addEventListener("DOMContentLoaded", () => {
    const tabs = document.querySelectorAll(".tabs .tab");

    // Define the page each tab should link to
    const tabPages = {
        "Videos": "video_tab.html",
        "Categories": "cat_tab.html",
        "Channels": "chan_tab.html",
        "Community": "comm_tab.html"
    };

    // Attach click event to each tab
    tabs.forEach(tab => {
        tab.addEventListener("click", (event) => {
            event.preventDefault(); // Prevent default link behavior

            const tabText = tab.textContent.trim();
            const pageUrl = tabPages[tabText];

            if (pageUrl) {
                // Redirect to the specified page
                window.location.href = pageUrl;
            }
        });
    });
});