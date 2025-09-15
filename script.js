document.addEventListener('DOMContentLoaded', () => {
    const mediaPlayerHeader = document.querySelector('.media-player-header');

    if (mediaPlayerHeader) {
        // Simulate activation on click
        mediaPlayerHeader.addEventListener('click', () => {
            mediaPlayerHeader.classList.add('active');
        });

        // Simulate deactivation when clicking outside
        window.addEventListener('click', (event) => {
            if (!mediaPlayerHeader.contains(event.target)) {
                mediaPlayerHeader.classList.remove('active');
            }
        });
    }

    // Initialize sliders
    const volumeSlider = document.getElementById('volume-slider');
    const panSlider = document.getElementById('pan-slider');
    if (volumeSlider && panSlider) {
        setupSlider(volumeSlider, 'volume');
        setupSlider(panSlider, 'pan');
    }

    // Initialize ApacheToob toolbar
    const apacheToob = document.getElementById('apacheToob');
    if (apacheToob) {
        const iframe = apacheToob.querySelector('.iframe-content');
        const toolbarHTML = `
            <div class="toolbar">
                <button id="homeButton">🏠</button>
                <button id="backButton">⬅️</button>
                <button id="forwardButton">➡️</button>
                <button id="refreshButton">🔄</button>
                <input type="text" id="urlBar" readonly value="https://apachetoob.com">
            </div>
        `;
        const iframeWrapper = apacheToob.querySelector('.iframe-wrapper');
        iframeWrapper.insertAdjacentHTML('beforebegin', toolbarHTML);

        const urlBar = document.getElementById('urlBar');
        const homeButton = document.getElementById('homeButton');
        const backButton = document.getElementById('backButton');
        const forwardButton = document.getElementById('forwardButton');
        const refreshButton = document.getElementById('refreshButton');

        const historyStack = [];
        let historyIndex = -1;

        function navigate(url, pushToHistory = true) {
            if (pushToHistory) {
                historyStack.splice(historyIndex + 1);
                historyStack.push(url);
                historyIndex++;
            }
            iframe.src = url;
            urlBar.value = url === 'youtube/atoob.html' ? 'https://apachetoob.com' : url;
        }

        iframe.addEventListener('load', () => {
            const currentURL = iframe.src;
            urlBar.value = currentURL.includes('youtube/atoob.html') ? 'https://apachetoob.com' : currentURL;
        });

        homeButton.addEventListener('click', () => navigate('youtube/atoob.html'));
        backButton.addEventListener('click', () => {
            if (historyIndex > 0) {
                historyIndex--;
                navigate(historyStack[historyIndex], false);
            }
        });
        forwardButton.addEventListener('click', () => {
            if (historyIndex < historyStack.length - 1) {
                historyIndex++;
                navigate(historyStack[historyIndex], false);
            }
        });
        refreshButton.addEventListener('click', () => {
            iframe.src = iframe.src;
        });

        navigate('youtube/atoob.html', false);
    }
});


const mediaPlayerState = { 
    originalWidth: null,
    originalHeight: null,
    originalX: null,
    originalY: null,
    maximized: false
};

function changeStartButtonImage(imagePath) {
    document.getElementById("startButtonImage").src = "images/" + imagePath;
}

// Function to toggle Start Menu visibility
function toggleStartMenu() {
    const startMenu = document.getElementById('startMenu');
    startMenu.classList.toggle('show');
    if (startMenu.classList.contains('show')) {
        startMenu.style.display = 'block';
        bringToFront(startMenu);
    } else {
        startMenu.style.display = 'none';
    }
}

    function togglePopup(popupId) {
        let popup = document.getElementById(popupId);
        if (!popup) {
            // Create the popup if it doesn't exist
            popup = document.createElement('div');
            popup.id = popupId;
            popup.classList.add('popup-window', 'show'); // Add 'show' class
            popup.style.display = 'flex'; // Ensure it's visible

            // Depending on popupId, create content
            const windowContent = document.createElement('div');
            windowContent.classList.add('window-content');

            if (popupId === 'wifiWindow') {
                const wifiList = document.createElement('ul');
                wifiList.classList.add('wifi-list');
                const fakeWifis = [
                    { name: "FBI Surveillance Van", locked: true },
                    { name: "Pretty Fly for a Wi-Fi", locked: true },
                    { name: "Wi-Fi not Available", locked: true },
                    { name: "Mom Click Here for Internet", locked: true },
                    { name: "TellMyWiFiLoveHer", locked: true },
                    { name: "CleverWifiName123", locked: true }
                ];
                fakeWifis.forEach(wifi => {
                    const listItem = document.createElement('li');
                    listItem.classList.add('wifi-item');

                    const wifiName = document.createElement('span');
                    wifiName.textContent = wifi.name;

                    const wifiStatus = document.createElement('span');
                    wifiStatus.classList.add('wifi-status');
                    wifiStatus.innerHTML = wifi.locked ? '🔒' : '🔓';

                    listItem.appendChild(wifiName);
                    listItem.appendChild(wifiStatus);
                    wifiList.appendChild(listItem);
                });
                windowContent.appendChild(wifiList);
            } else if (popupId === 'batteryWindow') {
                const powerList = document.createElement('ul');
                powerList.classList.add('power-list');
                const funnyOptions = [
                    { name: "Never Wake Up" },
                    { name: "Carbon-footprint Exterminator" },
                    { name: "Restart, but with Unicorns" },
                    { name: "Crash and Roll" }
                ];
                funnyOptions.forEach(option => {
                    const listItem = document.createElement('li');
                    listItem.classList.add('power-item');
                    listItem.textContent = option.name;
                    listItem.addEventListener('click', () => {
                        alert(`${option.name} selected! Just kidding...`);
                    });
                    powerList.appendChild(listItem);
                });
                windowContent.appendChild(powerList);
            }

            // Append content to popup
            popup.appendChild(windowContent);

            // Append popup to desktop
            document.querySelector('.desktop').appendChild(popup);

            // Position the popup window
            positionPopupWindow(popup, popupId === 'wifiWindow' ? 'networkTray' : 'batteryTray');

            // Close the popup when clicking outside
            closePopupOnClickOutside(popup, popupId === 'wifiWindow' ? 'networkTray' : 'batteryTray');
        } else {
            // Toggle the 'show' class
            popup.classList.toggle('show');
            if (popup.classList.contains('show')) {
                popup.style.display = 'flex';
                bringToFront(popup);
            } else {
                popup.style.display = 'none';
            }
        }
    }
// Function to bring the selected window to the front
function bringToFront(element) {
    const allElements = document.querySelectorAll('.popup-window, .start-menu');
    let maxZ = 500; // Base z-index

    allElements.forEach(el => {
        const z = parseInt(window.getComputedStyle(el).zIndex) || 0;
        if (z > maxZ) {
            maxZ = z;
        }
    });

    element.style.zIndex = maxZ + 1;
}
// Quirky Behaviors for Documents Popup
function showSecretMessage() {
    const message = document.getElementById('secretMessage');
    if (message.style.display === 'none') {
        message.style.display = 'block';
        // Animate the message
        message.style.transition = 'opacity 1s';
        message.style.opacity = 1;
    } else {
        message.style.display = 'none';
        message.style.opacity = 0;
    }
}

function enableUnicornMode() {
    alert("🦄 Unicorn Mode Activated! 🌈✨");
    document.querySelector('.desktop').style.backgroundImage = "url('images/unicorn_background.gif')";
}

function setBackgroundToDancingCats() {
    alert("🐱💃 Dancing Cats are grooving in the background!");
    document.querySelector('.desktop').style.backgroundImage = "url('images/dancing_cats.gif')";
}

function activateDanceParty() {
    alert("🎉 Dance Party Activated! Enjoy the music!");
    alert("There's actually no music.");
    const danceParty = document.createElement('div');
    danceParty.innerHTML = "<img src='images/dance_party.gif' alt='Dance Party' style='width:auto; height:100%;'>";
    danceParty.style.position = 'fixed';
    danceParty.style.top = '0';
    danceParty.style.left = '0';
    danceParty.style.width = '100%';
    danceParty.style.height = '100%';
    danceParty.style.backgroundColor = 'rgba(0,0,0,0.8)';
    danceParty.style.display = 'flex';
    danceParty.style.justifyContent = 'center';
    danceParty.style.alignItems = 'center';
    danceParty.style.zIndex = '10000';
    danceParty.id = 'dancePartyOverlay';
    danceParty.onclick = function() {
        this.remove();
    };
    document.body.appendChild(danceParty);
}

// Quirky Behaviors for Find Popup
function searchFunny() {
    const input = document.getElementById('findInput').value.toLowerCase();
    const result = document.getElementById('searchResult');
    const funnyResponses = [
        `You searched for "${input}"? Did you mean "dooky butter"? 🤔`,
        `"${input}" is now trending on Mars! 🚀`,
        `Hmm, "${input}" doesn't exist. Maybe try "naval prolapse"? 🍌💃`,
        `Found nothing for "${input}", but here's a joke instead: Why did the computer show up at work late? It had a hard drive! 😂`,
        `"${input}" is currently out of office. Please don't try again later. 🕒`
    ];
    const randomIndex = Math.floor(Math.random() * funnyResponses.length);
    result.textContent = funnyResponses[randomIndex];
}

// Quirky Behaviors for Help Popup
function tellJoke() {
    const jokes = [
        "Why don't programmers like nature? It has too many bugs. 🐛",
        "Why do Java developers wear glasses? Because they don't see sharp! 🤓",
        "How many programmers does it take to change a light bulb? None, that's a hardware problem. 💡",
        "Why was the computer cold? It forgot to close its Windows! ❄️🪟"
    ];
    const randomJoke = jokes[Math.floor(Math.random() * jokes.length)];
    alert(randomJoke);
}

function showFunnyTip() {
    const tips = [
        "Tip: Always backup your files and stuff.",
        "Tip: To make your computer faster, get a different one.",
        "Tip: If all else fails, turn it off.",
        "Tip: Ummm.... hi!"
    ];
    const randomTip = tips[Math.floor(Math.random() * tips.length)];
    alert(randomTip);
}

function dance() {
    // Create a dancing element
    const dancer = document.createElement('div');
    dancer.innerHTML = "<img src='images/dancer.gif' alt='Dancer' style='width:100px; height:auto;'>";
    dancer.style.position = 'fixed';
    dancer.style.bottom = '10px';
    dancer.style.right = '10px';
    dancer.style.zIndex = '10000';
    dancer.id = 'dancer';
    dancer.onclick = function() {
        this.remove();
    };
    document.body.appendChild(dancer);

    // Remove the dancer after 10 seconds
    setTimeout(() => {
        const dancer = document.getElementById('dancer');
        if (dancer) dancer.remove();
    }, 10000);
}

// Close popups when clicking outside
    document.addEventListener('click', function(e) {
        const startMenu = document.getElementById('startMenu');
        const startButton = document.querySelector('.start-button');
        const activePopups = document.querySelectorAll('.popup-window.show');

        // If click is outside the Start Menu and Start Button, hide Start Menu and all popups
        if (!startMenu.contains(e.target) && !startButton.contains(e.target)) {
            // Hide Start Menu
            startMenu.classList.remove('show');
            startMenu.style.display = 'none';
            
            // Hide all submenus
            document.querySelectorAll('.start-menu-submenu').forEach(sub => {
                sub.classList.remove('show');
            });
            
            // Remove active class from all menu items
            document.querySelectorAll('.start-menu-item').forEach(item => {
            	item.addEventListener('click', function(e) {
            		const submenu = this.nextElementSibling;
            		if (submenu && submenu.classList.contains('start-menu-submenu')) {
            			submenu.classList.toggle('show');
            			this.classList.toggle('active');
            			bringToFront(submenu);
            		} else {
            			// If the item doesn't have a submenu, perform its action
            			// For example, if it's a direct link to a program
            			const action = this.getAttribute('data-action');
            			if (action) {
            				// Execute the action, e.g., open a window
            				toggleWindow(action);
            			}
            
            			// Hide the start menu after action
            			const startMenu = document.getElementById('startMenu');
            			startMenu.classList.remove('show');
            			startMenu.style.display = 'none';
            		}
            	});
            }); 

            // Hide all active popups
            activePopups.forEach(popup => {
                popup.classList.remove('show');
                popup.style.display = 'none';
            });
        }
    });

    // Prevent clicks inside popups from triggering the global click handler
    document.querySelectorAll('.popup-window').forEach(popup => {
        popup.addEventListener('click', function(e) {
            e.stopPropagation();
        });
    });

    // Prevent clicks inside Start Menu from triggering the global click handler
    const startMenu = document.getElementById('startMenu');
    if (startMenu) {
        startMenu.addEventListener('click', function(e) {
            e.stopPropagation();
        });
    }

    // Prevent clicks on system tray icons from propagating
    document.querySelectorAll('.system-tray .tray-icon').forEach(icon => {
        icon.addEventListener('click', function(e) {
            e.stopPropagation();
        });
    });

// Close Start Menu when clicking outside
document.addEventListener('click', function(event) {
    const startMenu = document.getElementById('startMenu');
    const startButton = document.querySelector('.start-button');
    if (!startMenu.contains(event.target) && !startButton.contains(event.target)) {
        startMenu.style.display = 'none';
    }
});

// Function to bring a window to the front
function bringToFront(windowElement) {
    const allWindows = document.querySelectorAll('.window, .media-player');
    allWindows.forEach(win => {
        win.style.zIndex = '500';
    });
    windowElement.style.zIndex = '1000';
}

// Functions to handle opening and closing of windows
function toggleWindow(windowId) {
    const windowElement = document.getElementById(windowId);
    if (windowElement.style.display === 'flex') {
        closeWindow(windowId);
    } else {
        openWindow(windowId);
    }
}

function isMobilePortrait() {
    return window.innerWidth <= 800 && window.matchMedia("(orientation: portrait)").matches;
}

function openWindow(windowId) {
    const windowElement = document.getElementById(windowId);
    const taskbarInstances = document.getElementById("taskbarInstances");

    // Show the window
    windowElement.classList.add("show");
    windowElement.classList.remove("hide");
    windowElement.style.display = "flex";
    bringToFront(windowElement);

    // Check if the device is mobile portrait
    if (isMobilePortrait()) {
        maximizeWindow(windowId, true); // Always maximize when opening on mobile portrait
    } else {
        // Optionally, maximize certain windows by default
        if (windowId === 'apacheToob' || windowId === 'apacheWindow' || windowId === 'starblasterWindow') {
            maximizeWindow(windowId, true); // Always maximize when opening
        }
    }

    // Adjust iframe scale
    adjustIframeScale(windowId);

    // Check if the taskbar button already exists
    let taskbarButton = document.getElementById(`taskbar-${windowId}`);
    if (!taskbarButton) {
        // Create taskbar button with icon
        taskbarButton = document.createElement("button");
        taskbarButton.id = `taskbar-${windowId}`;
        taskbarButton.classList.add("taskbar-button");

        // Create icon image element
        const icon = document.createElement("img");
        // Use appropriate icon for the window
        let iconSrc = '';
        if (windowId === 'apacheWindow') {
            iconSrc = 'images/apache.png';
        } else if (windowId === 'starblasterWindow') {
            iconSrc = 'images/starblaster.png';
        } else if (windowId === 'apacheToob') {
            iconSrc = 'youtube/apache-toob.png';
        } else {
            iconSrc = 'images/window_icon.png'; // Default icon
        }
        icon.src = iconSrc;
        icon.alt = `${windowId} icon`;
        icon.classList.add("taskbar-icon");

        // Set title text
        const title = document.createElement("span");
        if (windowId === 'apacheWindow') {
            title.innerText = 'Apache';
        } else if (windowId === 'starblasterWindow') {
            title.innerText = 'Starblaster';
        } else if (windowId === 'apacheToob') {
            title.innerText = 'A-Toob';
        } else {
            title.innerText = windowId;
        }

        // Add icon and title to the button
        taskbarButton.appendChild(icon);
        taskbarButton.appendChild(title);

        // Toggle minimize/restore on click
        taskbarButton.onclick = () => toggleMinimizeRestoreWindow(windowId);

        // Append button to taskbar
        taskbarInstances.appendChild(taskbarButton);
    }
}


function closeWindow(windowId) {
    const windowElement = document.getElementById(windowId);
    const taskbarButton = document.getElementById(`taskbar-${windowId}`);

    // Hide the window
    windowElement.classList.add("hide");
    windowElement.classList.remove("show");
    windowElement.style.display = "none";

    // Remove the taskbar button if it exists
    if (taskbarButton) {
        taskbarButton.remove();
    }
}

function minimizeWindow(windowId) {
    const windowElement = document.getElementById(windowId);
    windowElement.classList.add("hide");
    windowElement.classList.remove("show");
    windowElement.style.display = "none";
}

function maximizeWindow(windowId, maximize = true) {
    const windowElement = document.getElementById(windowId);

    if (maximize) {
        // Maximize the window
        windowElement.classList.add('maximized');
        windowElement.style.top = '0';
        windowElement.style.left = '0';
        windowElement.style.width = '100%';
        windowElement.style.height = 'calc(100% - 40px)'; // Subtract taskbar height
    } else {
        // Restore to a smaller, default size
        windowElement.classList.remove('maximized');

        // Set a predefined "normal" size and center it
        windowElement.style.width = '600px'; // Set desired width
        windowElement.style.height = '500px'; // Set desired height

        // Center the window
        let topPosition = (window.innerHeight - parseInt(windowElement.style.height)) / 2;
        let leftPosition = (window.innerWidth - parseInt(windowElement.style.width)) / 2;
        windowElement.style.top = `${topPosition}px`;
        windowElement.style.left = `${leftPosition}px`;
    }

    // Adjust iframe scale
    adjustIframeScale(windowId);
}

function toggleMinimizeRestoreWindow(windowId) {
    const windowElement = document.getElementById(windowId);

    if (windowElement.style.display === "none" || windowElement.classList.contains("hide")) {
        // Restore the window
        windowElement.classList.remove("hide");
        windowElement.classList.add("show");
        windowElement.style.display = "flex";
        bringToFront(windowElement);
    } else {
        // Minimize the window
        minimizeWindow(windowId);
    }
}

// Media Player Functions
let mediaPlayerInitialized = false;
let youtubePlayerReady = false;

function toggleMediaPlayer() {
    const mediaPlayer = document.getElementById('mediaPlayer');
    if (mediaPlayer.style.display === 'flex') {
        closeMediaPlayer();
    } else {
        openMediaPlayer();
    }
}

function openMediaPlayer() {
    const mediaPlayer = document.getElementById('mediaPlayer');
    const taskbarInstances = document.getElementById("taskbarInstances");

    // Set initial size as a percentage of viewport size
    mediaPlayer.style.width = '100vw'; // 80% of viewport width
    mediaPlayer.style.height = '100vh'; // 80% of viewport height
    mediaPlayer.style.maxWidth = '556.42px'; // Optional maximum width
    mediaPlayer.style.maxHeight = '617px'; // Optional maximum height


    // Show the media player
    mediaPlayer.classList.add("show");
    mediaPlayer.classList.remove("hide");
    mediaPlayer.style.display = "flex";
    bringToFront(mediaPlayer);

    adjustMediaPlayerScale();

    // Initialize media player if not already done
    if (!mediaPlayerInitialized) {
        if (youtubePlayerReady) {
            initMediaPlayer();
            mediaPlayerInitialized = true;
        } else {
            // Wait until YouTube player is ready, then initialize
            let checkYouTubeReadyInterval = setInterval(() => {
                if (youtubePlayerReady) {
                    initMediaPlayer();
                    mediaPlayerInitialized = true;
                    clearInterval(checkYouTubeReadyInterval);
                }
            }, 100);
        }
    }

    if (isPortrait()) {
        maximizeMediaPlayer();
    } else {
        // Restore to normal size and center the media player
        mediaPlayer.classList.remove('maximized');
        centerWindow('mediaPlayer');
        adjustMediaPlayerScale();
    }

    // Check if the taskbar button already exists
    let taskbarButton = document.getElementById(`taskbar-mediaPlayer`);
    if (!taskbarButton) {
        // Create taskbar button with icon
        taskbarButton = document.createElement("button");
        taskbarButton.id = `taskbar-mediaPlayer`;
        taskbarButton.classList.add("taskbar-button");

        // Create icon image element
        const icon = document.createElement("img");
        icon.src = 'images/media_player.png';
        icon.alt = `Media Player icon`;
        icon.classList.add("taskbar-icon");

        // Set title text
        const title = document.createElement("span");
        title.innerText = 'Media Player';

        // Add icon and title to the button
        taskbarButton.appendChild(icon);
        taskbarButton.appendChild(title);

        // Toggle minimize/restore on click
        taskbarButton.onclick = () => toggleMinimizeRestoreMediaPlayer();

        // Add touch event listener for mobile devices
        taskbarButton.addEventListener('touchend', (e) => {
            e.preventDefault(); // Prevents the simulated mouse events
            toggleMinimizeRestoreMediaPlayer();
        });

        // Append button to taskbar
        taskbarInstances.appendChild(taskbarButton);
    }
}

function handleOrientationChange() {
    const openWindows = document.querySelectorAll('.window.show, .media-player.show, .popup-window.show');
    openWindows.forEach(win => {
        if (isMobilePortrait()) {
            maximizeWindow(win.id, true);
            // Disable resizing
            const resizeHandles = win.querySelectorAll('.resize-handle');
            resizeHandles.forEach(handle => {
                handle.style.display = 'none';
            });
        } else {
            // Re-enable resizing if needed
            const resizeHandles = win.querySelectorAll('.resize-handle');
            resizeHandles.forEach(handle => {
                handle.style.display = 'block';
            });
            // Optionally, restore window size or keep maximized
            // For this example, we'll keep them maximized unless manually resized
        }
    });
}

window.addEventListener('orientationchange', handleOrientationChange);
window.addEventListener('resize', handleOrientationChange); 

function closeMediaPlayer() {
    const mediaPlayer = document.getElementById('mediaPlayer');
    const taskbarButton = document.getElementById(`taskbar-mediaPlayer`);

    // Hide the media player
    mediaPlayer.classList.add("hide");
    mediaPlayer.classList.remove("show");
    mediaPlayer.style.display = "none";

    // Remove the taskbar button if it exists
    if (taskbarButton) {
        taskbarButton.remove();
    }

    // Stop media playback
    stop();
}

function minimizeMediaPlayer() {
    const mediaPlayer = document.getElementById('mediaPlayer');

    // Check if already minimized
    if (mediaPlayer.classList.contains('minimized')) return;

    // Save current state before minimizing
    mediaPlayerState.width = mediaPlayer.style.width;
    mediaPlayerState.height = mediaPlayer.style.height;
    mediaPlayerState.top = mediaPlayer.style.top;
    mediaPlayerState.left = mediaPlayer.style.left;
    mediaPlayerState.transform = mediaPlayer.style.transform;
    mediaPlayerState.maximized = mediaPlayer.classList.contains('maximized');

    // Hide the Media Player
    mediaPlayer.classList.add("hide");
    mediaPlayer.classList.remove("show");
    mediaPlayer.style.display = "none";
    mediaPlayer.classList.add('minimized');
}

function restoreMediaPlayer() {
    const mediaPlayer = document.getElementById('mediaPlayer');

    // Check if it's minimized
    if (!mediaPlayer.classList.contains('minimized')) return;

    // Restore state
    mediaPlayer.style.width = mediaPlayerState.width;
    mediaPlayer.style.height = mediaPlayerState.height;
    mediaPlayer.style.top = mediaPlayerState.top;
    mediaPlayer.style.left = mediaPlayerState.left;
    mediaPlayer.style.transform = mediaPlayerState.transform;

    if (mediaPlayerState.maximized) {
        mediaPlayer.classList.add('maximized');
    } else {
        mediaPlayer.classList.remove('maximized');
    }

    // Show the Media Player
    mediaPlayer.classList.remove("hide");
    mediaPlayer.classList.add("show");
    mediaPlayer.style.display = "flex";
    mediaPlayer.classList.remove('minimized');
    bringToFront(mediaPlayer);
}

function maximizeMediaPlayer() {
    const mediaPlayer = document.getElementById('mediaPlayer');

    if (mediaPlayer.classList.contains('maximized')) {
        // Restore to previous size and position
        mediaPlayer.classList.remove('maximized');
        mediaPlayer.style.width = mediaPlayerState.originalWidth + 'px';
        mediaPlayer.style.height = mediaPlayerState.originalHeight + 'px';
        mediaPlayer.style.top = mediaPlayerState.originalY + 'px';
        mediaPlayer.style.left = mediaPlayerState.originalX + 'px';
        mediaPlayerState.maximized = false;
    } else {
        // Store original size and position
        mediaPlayerState.originalWidth = mediaPlayer.offsetWidth;
        mediaPlayerState.originalHeight = mediaPlayer.offsetHeight;
        mediaPlayerState.originalX = mediaPlayer.offsetLeft;
        mediaPlayerState.originalY = mediaPlayer.offsetTop;

        // Maximize the media player
        mediaPlayer.classList.add('maximized');
        mediaPlayer.style.top = '0';
        mediaPlayer.style.left = '0';
        mediaPlayer.style.width = '100%';
        mediaPlayer.style.height = 'calc(100% - 40px)'; // Adjust for taskbar height
        mediaPlayerState.maximized = true;
    }

    // Adjust media player scale
    adjustMediaPlayerScale();
}

function centerWindow(windowId) {
    const windowElement = document.getElementById(windowId);
    const windowWidth = windowElement.offsetWidth;
    const windowHeight = windowElement.offsetHeight;

    const left = (window.innerWidth - windowWidth) / 2;
    const top = (window.innerHeight - windowHeight - 40) / 2; // Adjust for taskbar height

    windowElement.style.left = `${left}px`;
    windowElement.style.top = `${top}px`;
}

function toggleMinimizeRestoreMediaPlayer() {
    const mediaPlayer = document.getElementById('mediaPlayer');

    if (mediaPlayer.classList.contains('minimized')) {
        // Restore the Media Player
        restoreMediaPlayer();
    } else {
        // Minimize the Media Player
        minimizeMediaPlayer();
    }
}

// Drag functionality variables
let isDragging = false;
let currentWindow = null;
let offsetX = 0;
let offsetY = 0;

// Attach mousedown and touchstart event to all window headers
document.querySelectorAll('.window-header, .media-player-header').forEach(header => {
    header.addEventListener('mousedown', startDrag);
    header.addEventListener('touchstart', startDragTouch, { passive: false });
});

function startDrag(e) {
    // Only left mouse button
    if (e.type === 'mousedown' && e.button !== 0) return;

    isDragging = true;
    currentWindow = this.parentNode;
    offsetX = e.clientX - currentWindow.getBoundingClientRect().left;
    offsetY = e.clientY - currentWindow.getBoundingClientRect().top;
    bringToFront(currentWindow);

    // Prevent text selection
    e.preventDefault();
}

function startDragTouch(e) {
    if (e.touches.length !== 1) return;

    const touch = e.touches[0];
    isDragging = true;
    currentWindow = this.parentNode;
    const rect = currentWindow.getBoundingClientRect();
    offsetX = touch.clientX - rect.left;
    offsetY = touch.clientY - rect.top;
    bringToFront(currentWindow);

    // Prevent scrolling
    e.preventDefault();
}

// Handle mousemove and touchmove events for dragging
document.addEventListener('mousemove', dragMove);
document.addEventListener('touchmove', dragMoveTouch, { passive: false });

function dragMove(e) {
    if (isDragging && currentWindow && !currentWindow.classList.contains('maximized')) {
        let clientX = e.clientX;
        let clientY = e.clientY;

        let newX = clientX - offsetX;
        let newY = clientY - offsetY;

        // Calculate maximum positions to prevent overlapping the taskbar and going off-screen
        const maxX = window.innerWidth - currentWindow.offsetWidth;
        const maxY = window.innerHeight - currentWindow.offsetHeight - 60; // 60px taskbar height on mobile

        newX = Math.max(0, Math.min(newX, maxX));
        newY = Math.max(0, Math.min(newY, maxY));

        currentWindow.style.left = newX + 'px';
        currentWindow.style.top = newY + 'px';
    }
}

function dragMoveTouch(e) {
    if (isDragging && currentWindow && !currentWindow.classList.contains('maximized')) {
        if (e.touches.length !== 1) return;

        const touch = e.touches[0];
        let clientX = touch.clientX;
        let clientY = touch.clientY;

        let newX = clientX - offsetX;
        let newY = clientY - offsetY;

        // Calculate maximum positions to prevent overlapping the taskbar and going off-screen
        const maxX = window.innerWidth - currentWindow.offsetWidth;
        const maxY = window.innerHeight - currentWindow.offsetHeight - 60; // 60px taskbar height on mobile

        newX = Math.max(0, Math.min(newX, maxX));
        newY = Math.max(0, Math.min(newY, maxY));

        currentWindow.style.left = newX + 'px';
        currentWindow.style.top = newY + 'px';
    }

    // Prevent scrolling while dragging
    e.preventDefault();
}

// Handle mouseup and touchend events to stop dragging
document.addEventListener('mouseup', stopDrag);
document.addEventListener('touchend', stopDrag, { passive: false });

function stopDrag() {
    isDragging = false;
    currentWindow = null;
}

// Resizable Windows
document.querySelectorAll('.resize-handle').forEach(handle => {
    handle.addEventListener('mousedown', initResize, false);
    handle.addEventListener('touchstart', initResizeTouch, { passive: false });
});

let currentResizeWindow = null;
let originalWidth = 0;
let originalHeight = 0;
let originalX = 0;
let originalY = 0;
let originalMouseX = 0;
let originalMouseY = 0;

function initResize(e) {
    e.preventDefault();
    currentResizeWindow = e.target.parentElement;
    originalWidth = parseFloat(getComputedStyle(currentResizeWindow, null).getPropertyValue('width').replace('px', ''));
    originalHeight = parseFloat(getComputedStyle(currentResizeWindow, null).getPropertyValue('height').replace('px', ''));
    originalX = currentResizeWindow.getBoundingClientRect().left;
    originalY = currentResizeWindow.getBoundingClientRect().top;
    originalMouseX = e.clientX;
    originalMouseY = e.clientY;

    window.addEventListener('mousemove', Resize, false);
    window.addEventListener('mouseup', stopResize, false);
}

function initResizeTouch(e) {
    e.preventDefault();
    if (e.touches.length !== 1) return;

    const touch = e.touches[0];
    currentResizeWindow = e.target.parentElement;
    originalWidth = parseFloat(getComputedStyle(currentResizeWindow, null).getPropertyValue('width').replace('px', ''));
    originalHeight = parseFloat(getComputedStyle(currentResizeWindow, null).getPropertyValue('height').replace('px', ''));
    originalX = currentResizeWindow.getBoundingClientRect().left;
    originalY = currentResizeWindow.getBoundingClientRect().top;
    originalMouseX = touch.clientX;
    originalMouseY = touch.clientY;

    window.addEventListener('touchmove', ResizeTouch, { passive: false });
    window.addEventListener('touchend', stopResizeTouch, false);
}

function Resize(e) {
    if (currentResizeWindow) {
        // Only proceed if not maximized
        if (currentResizeWindow.classList.contains('maximized')) return;

        if (currentResizeWindow.id === 'mediaPlayer') {
            // Resize the media player while maintaining aspect ratio
            let newWidth = originalWidth + (e.clientX - originalMouseX);
            const aspectRatio = originalWidth / originalHeight;
            let newHeight = newWidth / aspectRatio;

            // Ensure new dimensions do not exceed window boundaries
            const maxWidth = window.innerWidth - currentResizeWindow.offsetLeft;
            const maxHeight = window.innerHeight - currentResizeWindow.offsetTop - 60; // Subtract taskbar height

            newWidth = Math.max(300, Math.min(newWidth, maxWidth));
            newHeight = Math.max(200, Math.min(newHeight, maxHeight));

            currentResizeWindow.style.width = `${newWidth}px`;
            currentResizeWindow.style.height = `${newHeight}px`;

            // Do not re-center the media player
            // Adjust media player scale
            adjustMediaPlayerScale();

        } else {
            // Resize other windows normally
            const width = originalWidth + (e.clientX - originalMouseX);
            const height = originalHeight + (e.clientY - originalMouseY);

            // Set minimum and maximum sizes
            const minWidth = 300;
            const minHeight = 200;
            const maxWidth = window.innerWidth - currentResizeWindow.offsetLeft;
            const maxHeight = window.innerHeight - currentResizeWindow.offsetTop - 60; // Subtract taskbar height

            currentResizeWindow.style.width = Math.max(minWidth, Math.min(width, maxWidth)) + 'px';
            currentResizeWindow.style.height = Math.max(minHeight, Math.min(height, maxHeight)) + 'px';

            // Adjust iframe scale
            adjustIframeScale(currentResizeWindow.id);
        }
    }
}
function ResizeTouch(e) {
    if (currentResizeWindow && e.touches.length === 1) {
        // Only proceed if not maximized
        if (currentResizeWindow.classList.contains('maximized')) return;

        const touch = e.touches[0];

        if (currentResizeWindow.id === 'mediaPlayer') {
            // Resize the media player while maintaining aspect ratio
            let newWidth = originalWidth + (touch.clientX - originalMouseX);
            const aspectRatio = originalWidth / originalHeight;
            let newHeight = newWidth / aspectRatio;

            // Ensure new dimensions do not exceed window boundaries
            const maxWidth = window.innerWidth - currentResizeWindow.offsetLeft;
            const maxHeight = window.innerHeight - currentResizeWindow.offsetTop - 60; // Subtract taskbar height

            newWidth = Math.max(300, Math.min(newWidth, maxWidth));
            newHeight = Math.max(200, Math.min(newHeight, maxHeight));

            currentResizeWindow.style.width = `${newWidth}px`;
            currentResizeWindow.style.height = `${newHeight}px`;

            // Do not re-center the media player
            // Adjust media player scale
            adjustMediaPlayerScale();

        } else {
            // Resize other windows normally
            const width = originalWidth + (touch.clientX - originalMouseX);
            const height = originalHeight + (touch.clientY - originalMouseY);

            // Set minimum and maximum sizes
            const minWidth = 300;
            const minHeight = 200;
            const maxWidth = window.innerWidth - currentResizeWindow.offsetLeft;
            const maxHeight = window.innerHeight - currentResizeWindow.offsetTop - 60; // Subtract taskbar height

            currentResizeWindow.style.width = Math.max(minWidth, Math.min(width, maxWidth)) + 'px';
            currentResizeWindow.style.height = Math.max(minHeight, Math.min(height, maxHeight)) + 'px';

            // Adjust iframe scale
            adjustIframeScale(currentResizeWindow.id);
        }

        // Prevent scrolling
        e.preventDefault();
    }
}
function stopResize() {
    window.removeEventListener('mousemove', Resize, false);
    window.removeEventListener('mouseup', stopResize, false);
    currentResizeWindow = null;
}

function stopResizeTouch() {
    window.removeEventListener('touchmove', ResizeTouch, { passive: false });
    window.removeEventListener('touchend', stopResizeTouch, false);
    currentResizeWindow = null;
}

// Ensure windows do not go beyond the taskbar upon resizing
function constrainWindow(windowElement) {
    const rect = windowElement.getBoundingClientRect();
    const maxHeight = window.innerHeight - 60; // 60px taskbar height on mobile
    const maxWidth = window.innerWidth;

    if (rect.top + rect.height > maxHeight) {
        windowElement.style.height = (maxHeight - rect.top) + 'px';
    }

    if (rect.left + rect.width > maxWidth) {
        windowElement.style.width = (maxWidth - rect.left) + 'px';
    }
}

// Call constrainWindow after resizing ends
window.addEventListener('mouseup', function() {
    if (currentResizeWindow) {
        constrainWindow(currentResizeWindow);
    }
});
window.addEventListener('touchend', function() {
    if (currentResizeWindow) {
        constrainWindow(currentResizeWindow);
    }
}, { passive: false });

/* Media Player Script */

let youtubePlayer;
let isPlaying = false;
let isDraggingHead = false;
let seekBarRect;
let playlist = [
    { title: "River Drift : (mis) Guided Imagery", type: "video", youtubeId: "f305CJq5eRM" },
    { title: "Cold Ice Tea : Uriah Wilde", type: "video", youtubeId: "wTs5KJab1cE" },
    { title: "Johnny Depp Wins", type: "video", youtubeId: "2_a-CKrx4t0" }
];
let currentTrackIndex = null;

// Initialize when YouTube API is ready
function onYouTubeIframeAPIReady() {
    youtubePlayer = new YT.Player('youtube-video', {
        height: '200',
        width: '100%',
        videoId: '',
        playerVars: {
            'autoplay': 0,
            'controls': 0,
            'showinfo': 0,
            'rel': 0,
            'iv_load_policy': 3,
            'modestbranding': 1
        },
        events: {
            'onReady': onPlayerReady,
            'onStateChange': onPlayerStateChange
        }
    });
}

function onPlayerReady() {
    youtubePlayerReady = true;
}

function onPlayerStateChange(event) {
    if (event.data === YT.PlayerState.ENDED) {
        nextTrack();
    } else if (event.data === YT.PlayerState.PLAYING) {
        isPlaying = true;
        updatePlayButton();
        if (playlist[currentTrackIndex] && playlist[currentTrackIndex].type === 'audio') {
            setupVisualizer();
        }
    } else {
        isPlaying = false;
        updatePlayButton();
    }
}

function initMediaPlayer() {
    const playButton = document.getElementById('play');
    const stopButton = document.getElementById('stop');
    const prevButton = document.getElementById('prev');
    const nextButton = document.getElementById('next');
    const head = document.getElementById('head');
    const track = document.getElementById('track');
    const volumeSlider = document.getElementById('volume-slider');
    const panSlider = document.getElementById('pan-slider');
    const playlistElement = document.getElementById('playlist-items');
    const canvas = document.getElementById('visualizer');
    const canvasCtx = canvas.getContext('2d');

    // Set canvas dimensions
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    // Populate the playlist
    playlist.forEach((trackItem, index) => {
        let li = document.createElement('li');
        li.textContent = trackItem.title;
        li.addEventListener('click', () => {
            loadTrack(index);
            play();
        });
        playlistElement.appendChild(li);
    });

    // Do not load the first track by default

    // Add event listeners for buttons
    setupButtonEvents(playButton, stopButton, prevButton, nextButton);

    // Add event listeners for seek bar
    setupSeekBar(head, track);

    // Add event listeners for sliders
    setupSliders(volumeSlider, panSlider);

    // Update the seek bar as the media plays
    setInterval(() => updateSeekBar(head, track), 100);

    // Start the visualizer
    drawVisualizer(canvas, canvasCtx);
}

function loadTrack(index) {
    currentTrackIndex = index;
    let track = playlist[index];

    // Update playlist UI
    let items = document.getElementById('playlist-items').getElementsByTagName('li');
    for (let i = 0; i < items.length; i++) {
        items[i].classList.remove('active');
    }
    items[index].classList.add('active');

    if (track.type === 'audio') {
        youtubePlayer.cueVideoById(track.youtubeId);
        youtubePlayer.mute();
        document.getElementById('visualizer').style.display = 'block';
        document.getElementById('youtube-video').style.display = 'none';
    } else if (track.type === 'video') {
        youtubePlayer.cueVideoById(track.youtubeId);
        youtubePlayer.unMute();
        document.getElementById('visualizer').style.display = 'none';
        document.getElementById('youtube-video').style.display = 'block';
    }
    isPlaying = false;
    updatePlayButton();
}

function play() {
    if (!youtubePlayer || currentTrackIndex === null) {
        console.log('No track selected. Please select a track from the playlist.');
        return;
    }
    youtubePlayer.playVideo();
    isPlaying = true;
    updatePlayButton();
}

function pause() {
    if (!youtubePlayer) return;
    youtubePlayer.pauseVideo();
    isPlaying = false;
    updatePlayButton();
}

function stop() {
    if (!youtubePlayer) return;
    youtubePlayer.stopVideo();
    isPlaying = false;
    updatePlayButton();
}

function prevTrack() {
    if (currentTrackIndex === null || currentTrackIndex <= 0) {
        console.log('No previous track.');
        return;
    }
    loadTrack(currentTrackIndex - 1);
    play();
}

function nextTrack() {
    if (currentTrackIndex === null || currentTrackIndex >= playlist.length - 1) {
        console.log('No next track.');
        return;
    }
    loadTrack(currentTrackIndex + 1);
    play();
}

function setupButtonEvents(playButton, stopButton, prevButton, nextButton) {
    const buttons = [playButton, stopButton, prevButton, nextButton];

    buttons.forEach(button => {
        button.addEventListener('mousedown', () => {
            let baseName = button.id.toUpperCase();
            button.src = `icons/${baseName}_CLICK.png`;
        });

        button.addEventListener('mouseup', () => {
            updateButtonImage(button);
        });

        button.addEventListener('mouseout', () => {
            updateButtonImage(button);
        });

        // Add touch events for mobile devices
        button.addEventListener('touchstart', () => {
            let baseName = button.id.toUpperCase();
            button.src = `icons/${baseName}_CLICK.png`;
        }, { passive: true });

        button.addEventListener('touchend', () => {
            updateButtonImage(button);
        }, { passive: true });
    });

    const addClickAndTouchListener = (element, handler) => {
        element.addEventListener('click', handler);
        element.addEventListener('touchend', (e) => {
            e.preventDefault();
            handler();
        });
    };

    addClickAndTouchListener(playButton, () => {
        if (isPlaying) {
            pause();
        } else {
            play();
        }
    });

    addClickAndTouchListener(stopButton, stop);
    addClickAndTouchListener(prevButton, prevTrack);
    addClickAndTouchListener(nextButton, nextTrack);
}

function updateButtonImage(button) {
    let baseName = button.id.toUpperCase();
    if (button.id === 'play') {
        updatePlayButton();
    } else {
        button.src = `icons/${baseName}.png`;
    }
}

function updatePlayButton() {
    const playButton = document.getElementById('play');
    playButton.src = isPlaying ? 'icons/PAUSE.png' : 'icons/PLAY.png';
}

function setupSeekBar(head, track) {
    head.addEventListener('mousedown', (e) => {
        isDraggingHead = true;
        head.src = 'icons/HEAD_CLICK.png';
        seekBarRect = track.getBoundingClientRect();
        document.addEventListener('mousemove', onDragHead);
        document.addEventListener('mouseup', onReleaseHead);
        e.preventDefault();
    });

    track.addEventListener('mousedown', (e) => {
        isDraggingHead = true;
        head.src = 'icons/HEAD_CLICK.png';
        seekBarRect = track.getBoundingClientRect();
        onDragHead(e);
        document.addEventListener('mousemove', onDragHead);
        document.addEventListener('mouseup', onReleaseHead);
        e.preventDefault();
    });

    // Add touch events
    head.addEventListener('touchstart', (e) => {
        isDraggingHead = true;
        head.src = 'icons/HEAD_CLICK.png';
        seekBarRect = track.getBoundingClientRect();
        document.addEventListener('touchmove', onDragHeadTouch, { passive: false });
        document.addEventListener('touchend', onReleaseHeadTouch);
        e.preventDefault();
    });

    track.addEventListener('touchstart', (e) => {
        isDraggingHead = true;
        head.src = 'icons/HEAD_CLICK.png';
        seekBarRect = track.getBoundingClientRect();
        onDragHeadTouch(e);
        document.addEventListener('touchmove', onDragHeadTouch, { passive: false });
        document.addEventListener('touchend', onReleaseHeadTouch);
        e.preventDefault();
    });
}

function onDragHead(e) {
    if (isDraggingHead) {
        let x = e.clientX - seekBarRect.left - (head.offsetWidth / 2);
        x = Math.max(0, Math.min(x, seekBarRect.width - head.offsetWidth));
        head.style.left = `${x}px`;

        let duration = youtubePlayer.getDuration() || 0;
        let seekTime = (x / (seekBarRect.width - head.offsetWidth)) * duration;
        youtubePlayer.seekTo(seekTime, true);
    }
}

function onReleaseHead() {
    isDraggingHead = false;
    document.getElementById('head').src = 'icons/HEAD.png';
    document.removeEventListener('mousemove', onDragHead);
    document.removeEventListener('mouseup', onReleaseHead);
}

function onDragHeadTouch(e) {
    if (isDraggingHead && e.touches.length === 1) {
        const touch = e.touches[0];
        let x = touch.clientX - seekBarRect.left - (head.offsetWidth / 2);
        x = Math.max(0, Math.min(x, seekBarRect.width - head.offsetWidth));
        head.style.left = `${x}px`;

        let duration = youtubePlayer.getDuration() || 0;
        let seekTime = (x / (seekBarRect.width - head.offsetWidth)) * duration;
        youtubePlayer.seekTo(seekTime, true);

        e.preventDefault();
    }
}

function onReleaseHeadTouch() {
    isDraggingHead = false;
    document.getElementById('head').src = 'icons/HEAD.png';
    document.removeEventListener('touchmove', onDragHeadTouch);
    document.removeEventListener('touchend', onReleaseHeadTouch);
}

function updateSeekBar(head, track) {
    if (!youtubePlayer || !youtubePlayer.getDuration || currentTrackIndex === null) return;
    if (isDraggingHead) return; // Do not update while dragging

    let duration = youtubePlayer.getDuration();
    let currentTime = youtubePlayer.getCurrentTime();
    if (duration > 0) {
        let progress = (currentTime / duration) * (track.offsetWidth - head.offsetWidth);
        head.style.left = `${progress}px`;
    }
}

function setupSliders(volumeSlider, panSlider) {
    setupSlider(volumeSlider, 'volume');
    setupSlider(panSlider, 'pan');

    initializeSliderPositions(volumeSlider, panSlider);
}

function initializeSliderPositions(volumeSlider, panSlider) {
    updateSliderPosition(volumeSlider, 1);
    updateSliderPosition(panSlider, 0.5);
}

function updateSliderPosition(sliderElement, value) {
    let sliderButton = sliderElement.querySelector('.slide-button');
    let sliderWidth = sliderElement.clientWidth - sliderButton.clientWidth;
    let position = value * sliderWidth;
    sliderButton.style.left = `${position}px`;

    let frame = Math.floor(value * 27);
    sliderElement.style.backgroundPosition = `0px ${-frame * 15}px`;
}

function setupSlider(sliderElement, type) {
    let isDragging = false;
    let sliderRect;
    let sliderButton = sliderElement.querySelector('.slide-button');

    const limitOffset = 6;

    sliderButton.addEventListener('mousedown', (e) => {
        isDragging = true;
        sliderButton.style.backgroundImage = 'url("icons/MINI_SLIDE_CLICK.png")';
        sliderRect = sliderElement.getBoundingClientRect();
        onDragSlider(e);
        document.addEventListener('mousemove', onDragSlider);
        document.addEventListener('mouseup', onReleaseSlider);
        e.preventDefault();
    });

    // Add touch events
    sliderButton.addEventListener('touchstart', (e) => {
        isDragging = true;
        sliderButton.style.backgroundImage = 'url("icons/MINI_SLIDE_CLICK.png")';
        sliderRect = sliderElement.getBoundingClientRect();
        onDragSliderTouch(e);
        document.addEventListener('touchmove', onDragSliderTouch, { passive: false });
        document.addEventListener('touchend', onReleaseSliderTouch);
        e.preventDefault();
    });

    function onDragSlider(e) {
        if (isDragging) {
            let x = e.clientX - sliderRect.left - (sliderButton.offsetWidth / 2);
            // Reduce max allowed x by limitOffset to limit rightward movement
            x = Math.max(0, Math.min(x, sliderRect.width - sliderButton.offsetWidth - limitOffset));
            let percentage = (x / (sliderRect.width - sliderButton.offsetWidth)) * 100;
            sliderButton.style.left = `${percentage}%`;

            if (type === 'volume') {
                youtubePlayer.setVolume(percentage);
            } else if (type === 'pan') {
                console.log(`Pan value adjusted to: ${percentage.toFixed(2)}`);
            }

            let frame = Math.floor((percentage / 100) * 27);
            sliderElement.style.backgroundPosition = `0px ${-frame * 15}px`;
        }
    }

    function onReleaseSlider() {
        isDragging = false;
        sliderButton.style.backgroundImage = 'url("icons/MINI_SLIDE.png")';
        document.removeEventListener('mousemove', onDragSlider);
        document.removeEventListener('mouseup', onReleaseSlider);
    }

    function onDragSliderTouch(e) {
        if (isDragging && e.touches.length === 1) {
            const touch = e.touches[0];
            let x = touch.clientX - sliderRect.left - (sliderButton.offsetWidth / 2);
            x = Math.max(0, Math.min(x, sliderRect.width - sliderButton.offsetWidth - limitOffset));
            let percentage = (x / (sliderRect.width - sliderButton.offsetWidth)) * 100;
            sliderButton.style.left = `${percentage}%`;

            if (type === 'volume') {
                youtubePlayer.setVolume(percentage);
            } else if (type === 'pan') {
                console.log(`Pan value adjusted to: ${percentage.toFixed(2)}`);
            }

            let frame = Math.floor((percentage / 100) * 27);
            sliderElement.style.backgroundPosition = `0px ${-frame * 15}px`;

            e.preventDefault();
        }
    }

    function onReleaseSliderTouch() {
        isDragging = false;
        sliderButton.style.backgroundImage = 'url("icons/MINI_SLIDE.png")';
        document.removeEventListener('touchmove', onDragSliderTouch);
        document.removeEventListener('touchend', onReleaseSliderTouch);
    }
}

function setupVisualizer() {
    const canvas = document.getElementById('visualizer');
    const canvasCtx = canvas.getContext('2d');
    drawVisualizer(canvas, canvasCtx);
}

function drawVisualizer(canvas, canvasCtx) {
    requestAnimationFrame(() => drawVisualizer(canvas, canvasCtx));
    if (!isPlaying || !playlist[currentTrackIndex] || playlist[currentTrackIndex].type !== 'audio') {
        canvasCtx.clearRect(0, 0, canvas.width, canvas.height);
        return;
    }

    const barCount = 64;
    const barWidth = canvas.width / barCount;
    canvasCtx.fillStyle = 'rgb(0, 0, 0)';
    canvasCtx.fillRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < barCount; i++) {
        const barHeight = Math.random() * canvas.height;
        canvasCtx.fillStyle = 'rgb(0, 255, 0)';
        canvasCtx.fillRect(i * barWidth, canvas.height - barHeight, barWidth - 2, barHeight);
    }
}

const desktopElement = document.querySelector('.desktop');
const taskbarElement = document.querySelector('.taskbar');
const ICON_DRAG_THRESHOLD = 5;

if (desktopElement) {
    const desktopIcons = document.querySelectorAll('.desktop-icon');

    desktopIcons.forEach(icon => {
        makeDesktopIconDraggable(icon, desktopElement, taskbarElement);

        icon.addEventListener('click', function(event) {
            if (icon.dataset.dragJustEnded === 'true') {
                event.preventDefault();
                event.stopPropagation();
                icon.dataset.dragJustEnded = 'false';
                return;
            }

            handleIconClick(event);
        });

        icon.addEventListener('dblclick', function() {
            const windowId = this.getAttribute('data-window');
            if (windowId === 'mediaPlayer') {
                toggleMediaPlayer();
            } else {
                toggleWindow(windowId);
            }
        });

        let lastTap = 0;
        icon.addEventListener('touchend', function(e) {
            if (icon.dataset.dragging === 'true' || icon.dataset.dragJustEnded === 'true') {
                lastTap = 0;
                return;
            }

            const currentTime = Date.now();
            const tapLength = currentTime - lastTap;
            if (tapLength < 300 && tapLength > 0) {
                const windowId = this.getAttribute('data-window');
                if (windowId === 'mediaPlayer') {
                    toggleMediaPlayer();
                } else {
                    toggleWindow(windowId);
                }
                e.preventDefault();
                lastTap = 0;
            } else {
                lastTap = currentTime;
            }
        }, { passive: false });
    });

    window.addEventListener('resize', () => {
        document.querySelectorAll('.desktop-icon').forEach(icon => {
            clampIconWithinDesktop(icon, desktopElement, taskbarElement);
        });
    });
}

function makeDesktopIconDraggable(icon, desktopElement, taskbarElement) {
    let pointerId = null;
    let startPointerX = 0;
    let startPointerY = 0;
    let startLeft = 0;
    let startTop = 0;
    let isDraggingIcon = false;

    icon.dataset.dragging = 'false';
    icon.dataset.dragJustEnded = 'false';

    icon.addEventListener('pointerdown', event => {
        if (event.pointerType === 'mouse' && event.button !== 0) return;

        pointerId = event.pointerId;
        startPointerX = event.clientX;
        startPointerY = event.clientY;
        startLeft = getNumericValue(icon.style.left, icon.offsetLeft);
        startTop = getNumericValue(icon.style.top, icon.offsetTop);

        icon.style.left = `${startLeft}px`;
        icon.style.top = `${startTop}px`;

        isDraggingIcon = false;
        icon.dataset.dragging = 'false';
        icon.dataset.dragJustEnded = 'false';

        if (icon.setPointerCapture) {
            icon.setPointerCapture(pointerId);
        }
        icon.addEventListener('pointermove', onPointerMove);
        icon.addEventListener('pointerup', onPointerUp);
        icon.addEventListener('pointercancel', onPointerUp);
    });

    function onPointerMove(event) {
        if (event.pointerId !== pointerId) return;

        const deltaX = event.clientX - startPointerX;
        const deltaY = event.clientY - startPointerY;

        if (!isDraggingIcon) {
            if (Math.hypot(deltaX, deltaY) < ICON_DRAG_THRESHOLD) {
                return;
            }
            isDraggingIcon = true;
            icon.dataset.dragging = 'true';
            icon.classList.add('dragging');
            icon.style.position = 'absolute';
            icon.style.zIndex = '1000';
        }

        const desktopRect = desktopElement.getBoundingClientRect();
        const maxLeft = Math.max(0, desktopRect.width - icon.offsetWidth);
        const taskbarHeight = taskbarElement ? taskbarElement.offsetHeight : 0;
        const maxTop = Math.max(0, desktopRect.height - taskbarHeight - icon.offsetHeight);

        let nextLeft = startLeft + deltaX;
        let nextTop = startTop + deltaY;

        nextLeft = Math.min(Math.max(0, nextLeft), maxLeft);
        nextTop = Math.min(Math.max(0, nextTop), maxTop);

        icon.style.left = `${nextLeft}px`;
        icon.style.top = `${nextTop}px`;

        event.preventDefault();
    }

    function onPointerUp(event) {
        if (event.pointerId !== pointerId) return;

        if (icon.hasPointerCapture && icon.hasPointerCapture(pointerId) && icon.releasePointerCapture) {
            icon.releasePointerCapture(pointerId);
        }
        icon.removeEventListener('pointermove', onPointerMove);
        icon.removeEventListener('pointerup', onPointerUp);
        icon.removeEventListener('pointercancel', onPointerUp);

        if (isDraggingIcon) {
            isDraggingIcon = false;
            icon.dataset.dragging = 'false';
            icon.dataset.dragJustEnded = 'true';
            icon.classList.remove('dragging');
            icon.style.zIndex = '';
            clampIconWithinDesktop(icon, desktopElement, taskbarElement);
            event.preventDefault();
            requestAnimationFrame(() => {
                icon.dataset.dragJustEnded = 'false';
            });
        } else {
            icon.dataset.dragging = 'false';
            icon.dataset.dragJustEnded = 'false';
        }

        pointerId = null;
    }

    clampIconWithinDesktop(icon, desktopElement, taskbarElement);
}

function clampIconWithinDesktop(icon, desktopElement, taskbarElement) {
    if (!desktopElement) return;

    const taskbarHeight = taskbarElement ? taskbarElement.offsetHeight : 0;
    const maxLeft = Math.max(0, desktopElement.clientWidth - icon.offsetWidth);
    const maxTop = Math.max(0, desktopElement.clientHeight - taskbarHeight - icon.offsetHeight);

    const currentLeft = getNumericValue(icon.style.left, icon.offsetLeft);
    const currentTop = getNumericValue(icon.style.top, icon.offsetTop);

    const clampedLeft = Math.min(Math.max(0, currentLeft), maxLeft);
    const clampedTop = Math.min(Math.max(0, currentTop), maxTop);

    icon.style.left = `${clampedLeft}px`;
    icon.style.top = `${clampedTop}px`;
}

function getNumericValue(value, fallback) {
    const parsed = parseFloat(value);
    return isNaN(parsed) ? fallback : parsed;
}
// Fullscreen Media Player
function fullscreenMediaPlayer() {
    const screenElement = document.getElementById('screen');
    if (!document.fullscreenElement) {
        if (screenElement.requestFullscreen) {
            screenElement.requestFullscreen();
        } else if (screenElement.webkitRequestFullscreen) { /* Safari */
            screenElement.webkitRequestFullscreen();
        } else if (screenElement.msRequestFullscreen) { /* IE11 */
            screenElement.msRequestFullscreen();
        }
    } else {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.webkitExitFullscreen) { /* Safari */
            document.webkitExitFullscreen();
        } else if (document.msExitFullscreen) { /* IE11 */
            document.msExitFullscreen();
        }
    }
}

document.addEventListener('fullscreenchange', (event) => {
    const mediaPlayerContent = document.querySelector('#mediaPlayer .media-player-content');
    if (document.fullscreenElement) {
        // In fullscreen mode
        mediaPlayerContent.classList.add('fullscreen');
    } else {
        // Exited fullscreen mode
        mediaPlayerContent.classList.remove('fullscreen');
    }
});

// Function to adjust iframe scaling
function adjustIframeScale(windowId) {
    const windowElement = document.getElementById(windowId);
    const iframeWrapper = windowElement.querySelector('.iframe-wrapper');
    const iframeContent = windowElement.querySelector('.iframe-content');

    if (!iframeWrapper || !iframeContent) return;

    if (windowId === 'apacheToob') {
        // For apacheToob, make the iframe fill the wrapper without scaling
        iframeContent.style.width = '100%';
        iframeContent.style.height = '100%';
        iframeContent.style.transform = 'none';
    } else {
        // Existing scaling logic for other windows
        const originalWidth = parseInt(windowElement.getAttribute('data-original-width'), 10);
        const originalHeight = parseInt(windowElement.getAttribute('data-original-height'), 10);

        if (!originalWidth || !originalHeight) return;

        // Set the width and height of iframe-content to original dimensions
        iframeContent.style.width = `${originalWidth}px`;
        iframeContent.style.height = `${originalHeight}px`;

        // Get the size of the iframe wrapper
        const wrapperWidth = iframeWrapper.clientWidth;
        const wrapperHeight = iframeWrapper.clientHeight;

        // Calculate the scale factor
        const scale = Math.min(wrapperWidth / originalWidth, wrapperHeight / originalHeight);

        // Apply the scale and center the iframe content
        iframeContent.style.transform = `translate(-50%, -50%) scale(${scale})`;
    }
}

window.addEventListener('resize', () => {
    const openWindows = document.querySelectorAll('.window.show, .media-player.show');
    openWindows.forEach(win => {
        if (win.id === 'mediaPlayer') {
            adjustMediaPlayerScale();
        } else {
            adjustIframeScale(win.id);
        }
    });
});

function adjustMediaPlayerScale() {
    const mediaPlayer = document.getElementById('mediaPlayer');
    const wrapper = mediaPlayer.querySelector('.media-player-wrapper');
    const playerContent = mediaPlayer.querySelector('#player');

    if (!wrapper || !playerContent) return;

    // Get original size from data attributes
    const originalWidth = parseFloat(mediaPlayer.getAttribute('data-original-width'));
    const originalHeight = parseFloat(mediaPlayer.getAttribute('data-original-height'));

    if (!originalWidth || !originalHeight) return;

    // Get the size of the wrapper
    const wrapperWidth = wrapper.clientWidth;
    const wrapperHeight = wrapper.clientHeight;

    // Calculate the scale factor
    const scale = Math.min(wrapperWidth / originalWidth, wrapperHeight / originalHeight);

    // Apply the scale and center the player content
    playerContent.style.transform = `translate(-50%, -50%) scale(${scale})`;
}

let isMuted = false;

// Select the sound tray icon
const soundTray = document.getElementById('soundTray');
const soundIcon = soundTray.querySelector('img');

// Add click event listener to toggle mute
soundTray.addEventListener('click', () => {
    if (isMuted) {
        // Unmute all audio
        if (youtubePlayer && typeof youtubePlayer.unMute === 'function') {
            youtubePlayer.unMute();
        }
        // Unmute other audio elements if any
        const audioElements = document.querySelectorAll('audio, video');
        audioElements.forEach(audio => {
            audio.muted = false;
        });
        // Change icon to sound.png
        soundIcon.src = 'images/sound.png';
        isMuted = false;
    } else {
        // Mute all audio
        if (youtubePlayer && typeof youtubePlayer.mute === 'function') {
            youtubePlayer.mute();
        }
        // Mute other audio elements if any
        const audioElements = document.querySelectorAll('audio, video');
        audioElements.forEach(audio => {
            audio.muted = true;
        });
        // Change icon to no_sound.png
        soundIcon.src = 'images/no_sound.png';
        isMuted = true;
    }
});

    function openWifiWindow() {
        const windowId = 'wifiWindow';
        togglePopup(windowId);
    }

    // Updated openBatteryWindow
    function openBatteryWindow() {
        const windowId = 'batteryWindow';
        togglePopup(windowId);
    }

const networkTray = document.getElementById('networkTray');
networkTray.addEventListener('click', () => {
    openWifiWindow();
});



function positionPopupWindow(popupWindow, trayIconId) {
    const trayIcon = document.getElementById(trayIconId);
    const trayRect = trayIcon.getBoundingClientRect();
    const popupRect = popupWindow.getBoundingClientRect();

    // Calculate position to align above the tray icon
    let left = trayRect.left + trayRect.width / 2 - popupRect.width / 2;
    let top = trayRect.top - popupRect.height;

    // Adjust if the popup goes beyond the viewport
    if (left < 0) left = 0;
    if (left + popupRect.width > window.innerWidth) left = window.innerWidth - popupRect.width;
    if (top < 0) top = trayRect.bottom;

    popupWindow.style.left = `${left}px`;
    popupWindow.style.top = `${top}px`;
}

function closePopupOnClickOutside(popupWindow, trayIconId) {
    setTimeout(() => {
        document.addEventListener('click', handleClickOutside);
    }, 0);

    function handleClickOutside(event) {
        const trayIcon = document.getElementById(trayIconId);
        if (!popupWindow.contains(event.target) && !trayIcon.contains(event.target)) {
            popupWindow.remove();
            document.removeEventListener('click', handleClickOutside);
        }
    }
}



// Update Event Listener for Battery Tray Icon
const batteryTray = document.getElementById('batteryTray');
batteryTray.addEventListener('click', () => {
    openBatteryWindow();
});

function clearSelections() {
    const selectedIcons = document.querySelectorAll('.desktop-icon.selected');
    selectedIcons.forEach(icon => {
        icon.classList.remove('selected');
    });
}

function handleIconClick(event) {
    const icon = event.currentTarget;
    
    // If the clicked icon is already selected, deselect it
    if (icon.classList.contains('selected')) {
        icon.classList.remove('selected');
    } else {
        // Deselect all other icons and select the clicked one
        clearSelections();
        icon.classList.add('selected');
    }
}

document.querySelectorAll('.window-buttons button, .media-player-buttons button').forEach(button => {
    // For touch devices
    button.addEventListener('touchstart', function(e) {
        e.stopPropagation();
    }, { passive: true });

    // For mouse devices (optional but good practice)
    button.addEventListener('mousedown', function(e) {
        e.stopPropagation();
    });
});

function isPortrait() {
    return window.matchMedia("(orientation: portrait)").matches;
}




