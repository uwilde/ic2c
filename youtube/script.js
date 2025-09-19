

// Handle Login Form Submission
const loginForm = document.getElementById('login-form');

window.addEventListener('DOMContentLoaded', () => {
  if (window.parent && window.parent !== window) {
    const path = window.location.pathname.replace(/^\//, '');
    window.parent.postMessage({ type: 'loaded', url: path }, '*');
  }
});

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

const videoData = {
    '1': {
        'title': 'Video Title 1',
        'description': 'This is the description for Video 1. Enjoy watching!',
        'youtubeId': 'viLXLTMRQAI'
    },
    '2': {
        'title': 'Video Title 2',
        'description': 'This is the description for Video 2. Enjoy watching!',
        'youtubeId': 'Rwsqb4B1lKY'
    },
    '3': {
        'title': 'Promo Video 1',
        'description': 'This is the description for Promo Video 1. Enjoy watching!',
        'youtubeId': 'znNllvBt_Jg'
    },
    '4': {
        'title': 'Promo Video 2',
        'description': 'This is the description for Promo Video 2. Enjoy watching!',
        'youtubeId': 'fMDKn9iuOsA'
    },
    '5': {
        'title': 'Featured Video 1',
        'description': 'This is the description for Featured Video 1. Enjoy watching!',
        'youtubeId': 'IEi5QerpOqs'
    },
    '6': {
        'title': 'Featured Video 2',
        'description': 'This is the description for Featured Video 2. Enjoy watching!',
        'youtubeId': 'z4sK_zUqf0Q'
    }
};

// Populate video details based on URL parameter
const params = getQueryParams();
if (params.video) {
    const videoId = params.video;
    const videoInfo = videoData[videoId];

    if (videoInfo) {
        // Update the video title and description
        const titleElement = document.getElementById('video-title');
        if (titleElement) {
            titleElement.textContent = videoInfo.title;
        }

        const descriptionElement = document.getElementById('video-description');
        if (descriptionElement) {
            descriptionElement.textContent = videoInfo.description;
        }

        // Embed the YouTube video
        const videoPlayer = document.getElementById('video-player');
        if (videoPlayer) {
            const embedUrl = `https://www.youtube.com/embed/${videoInfo.youtubeId}`;
            videoPlayer.innerHTML = `<iframe src="${embedUrl}" allowfullscreen></iframe>`;
        }
    } else {
        console.error('Video not found for ID:', videoId);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const commentToggle = document.querySelector('.comment-toggle');
    const commentsContainer = document.querySelector('.comments-container');

    if (commentToggle && commentsContainer) {
        commentToggle.addEventListener('click', () => {
            if (commentsContainer.style.display === 'none' || commentsContainer.style.display === '') {
                commentsContainer.style.display = 'block';
                commentToggle.textContent = 'Hide Comments';
            } else {
                commentsContainer.style.display = 'none';
                commentToggle.textContent = 'Show Comments';
            }
        });
    }
});

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
                const full = pageUrl.startsWith('youtube/') ? pageUrl : `youtube/${pageUrl}`;
                if (window.parent && window.parent !== window) {
                  window.parent.postMessage({ type: 'navigate', url: full }, '*');
                } else {
                  window.location.href = pageUrl; // fallback if opened directly
                }
            }
        });
    });
});


/* =========================
   Global Link Router (SPA-lite)
   Intercepts clicks on common nav links across all pages and routes to specific HTML files.
   Works even when links have href="#" because we inspect the link's text.
   ========================= */
(function setupGlobalLinkRouter() {
  if (window.__atoobRouterInstalled) return;
  window.__atoobRouterInstalled = true;

  function normalize(text) {
    return (text || "").toLowerCase().replace(/\s+/g, " ").trim();
  }

  const routeMap = new Map([
    ["login", "atoob_login.html"],
    ["sign in", "atoob_login.html"],
    ["sign up", "atoob_signup.html"],
    ["signup", "atoob_signup.html"],
    ["help", "atoob_help.html"],
    ["help center", "atoob_help.html"],
    ["history", "atoob_history.html"],
    ["company info", "atoob_companyInfo.html"],
    ["code of conduct", "atoob_404.html"],
    ["my account", "atoob_account.html"],
    ["account", "atoob_account.html"],
    ["inbox", "atoob_inbox.html"]
  ]);

  function getRouteForAnchor(a) {
    const txt = normalize(a.textContent);
    if (routeMap.has(txt)) return routeMap.get(txt);

    for (const [key, dest] of routeMap.entries()) {
      if (txt.includes(key)) return dest;
    }

    const href = (a.getAttribute("href") || "").toLowerCase();
    if (href) {
      for (const [key, dest] of routeMap.entries()) {
        const keyNoSpace = key.replace(/\s+/g, "");
        if (href.includes(keyNoSpace) || href.includes(key)) return dest;
      }
    }
    return null;
  }

  document.addEventListener("click", (ev) => {
    const a = ev.target.closest && ev.target.closest("a");
    if (!a) return;

    const dest = getRouteForAnchor(a);
    if (!dest) return;

    if (ev.metaKey || ev.ctrlKey || ev.shiftKey || ev.button === 1) return;

    ev.preventDefault();
    const full = dest.startsWith('youtube/') ? dest : `youtube/${dest}`;
    if (window.parent && window.parent !== window) {
      window.parent.postMessage({ type: 'navigate', url: full }, '*');
    } else {
      window.location.href = dest;
    }
  }, true);

  document.addEventListener('click', (ev) => {
    const anchor = ev.target.closest('a');
    if (!anchor) return;
    const href = anchor.getAttribute('href') || '';
    // Ignore external links, hash links, or javascript: links.
    if (/^https?:/i.test(href) || href.startsWith('#') || href.startsWith('javascript')) return;

    ev.preventDefault();
    const full = href.startsWith('youtube/') ? href : `youtube/${href}`;
    if (window.parent && window.parent !== window) {
      window.parent.postMessage({ type: 'navigate', url: full }, '*');
    } else {
      window.location.href = href; // fallback if not in iframe
    }
  }, true);  
  
})();
