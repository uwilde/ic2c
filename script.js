function changeStartButtonImage(imagePath) {
    document.getElementById("startButtonImage").src = "images/" + imagePath;
}

// Function to toggle Start Menu visibility
function toggleStartMenu() {
    const startMenu = document.getElementById('startMenu');
    startMenu.style.display = startMenu.style.display === 'block' ? 'none' : 'block';
}

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

function openWindow(windowId) {
    const windowElement = document.getElementById(windowId);
    const taskbarInstances = document.getElementById("taskbarInstances");

    // Show the window
    windowElement.classList.add("show");
    windowElement.classList.remove("hide");
    windowElement.style.display = "flex";
    bringToFront(windowElement);

    // Maximize Apache and Starblaster windows when opened
    if (windowId === 'apacheWindow' || windowId === 'starblasterWindow') {
        maximizeWindow(windowId);
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

function maximizeWindow(windowId) {
    const windowElement = document.getElementById(windowId);
    let topPosition = (window.innerHeight - windowElement.offsetHeight) / 2;
    let leftPosition = (window.innerWidth - windowElement.offsetWidth) / 2;

    if (windowElement.classList.contains('maximized')) {
        // Restore to a smaller, default size
        windowElement.classList.remove('maximized');

        // Set a predefined "normal" size and center it
        windowElement.style.width = '600px'; // Set desired width
        windowElement.style.height = '500px'; // Set desired height
        windowElement.style.top = `${topPosition}px`;
        windowElement.style.left = `${leftPosition}px`;
    } else {
        // Maximize the window
        windowElement.classList.add('maximized');
        windowElement.style.top = '0';
        windowElement.style.left = '0';
        windowElement.style.width = '100%';
        windowElement.style.height = 'calc(100% - 40px)'; // Subtract taskbar height
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

    // Set initial size and maximum dimensions
    mediaPlayer.style.width = '556.42px';
    mediaPlayer.style.height = '617px';
    mediaPlayer.style.maxWidth = '556.42px';
    mediaPlayer.style.maxHeight = '617px';

    // Center the mediaPlayer
    const topPosition = (window.innerHeight - 617) / 2;
    const leftPosition = (window.innerWidth - 556.42) / 2;
    mediaPlayer.style.top = `${topPosition}px`;
    mediaPlayer.style.left = `${leftPosition}px`;

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
    mediaPlayer.classList.add("hide");
    mediaPlayer.classList.remove("show");
    mediaPlayer.style.display = "none";
}

function maximizeMediaPlayer() {
    const mediaPlayer = document.getElementById('mediaPlayer');

    if (mediaPlayer.classList.contains('maximized')) {
        // Restore to previous size and position
        mediaPlayer.classList.remove('maximized');
        mediaPlayer.style.width = originalWidth + 'px';
        mediaPlayer.style.height = originalHeight + 'px';
        mediaPlayer.style.top = originalY + 'px';
        mediaPlayer.style.left = originalX + 'px';
    } else {
        // Store original size and position
        originalWidth = mediaPlayer.offsetWidth;
        originalHeight = mediaPlayer.offsetHeight;
        originalX = mediaPlayer.offsetLeft;
        originalY = mediaPlayer.offsetTop;

        // Maximize the media player
        mediaPlayer.classList.add('maximized');
        mediaPlayer.style.top = '0';
        mediaPlayer.style.left = '0';
        mediaPlayer.style.width = '100%';
        mediaPlayer.style.height = 'calc(100% - 40px)'; // Subtract taskbar height
    }

    // Adjust media player scale
    adjustMediaPlayerScale();
}

function toggleMinimizeRestoreMediaPlayer() {
    const mediaPlayer = document.getElementById('mediaPlayer');

    if (mediaPlayer.style.display === "none" || mediaPlayer.classList.contains("hide")) {
        // Restore the media player
        mediaPlayer.classList.remove("hide");
        mediaPlayer.classList.add("show");
        mediaPlayer.style.display = "flex";
        bringToFront(mediaPlayer);

        // Re-center the mediaPlayer
        const width = parseFloat(mediaPlayer.style.width);
        const height = parseFloat(mediaPlayer.style.height);
        const topPosition = (window.innerHeight - height) / 2;
        const leftPosition = (window.innerWidth - width) / 2;
        mediaPlayer.style.top = `${topPosition}px`;
        mediaPlayer.style.left = `${leftPosition}px`;
    } else {
        // Minimize the media player
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
    let sliderWidth = sliderElement.offsetWidth - sliderButton.offsetWidth;
    let position = value * sliderWidth;
    sliderButton.style.left = `${position}px`;

    let frame = Math.floor(value * 27);
    sliderElement.style.backgroundPosition = `0px ${-frame * 15}px`;
}

function setupSlider(sliderElement, type) {
    let isDragging = false;
    let sliderRect;
    let sliderButton = sliderElement.querySelector('.slide-button');

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
            let x = e.clientX - sliderRect.left;
            x = Math.max(0, Math.min(x, sliderRect.width - sliderButton.offsetWidth));
            sliderButton.style.left = `${x}px`;

            let value = x / (sliderRect.width - sliderButton.offsetWidth);

            if (type === 'volume') {
                youtubePlayer.setVolume(value * 100);
            } else if (type === 'pan') {
                // Placeholder functionality for Pan slider
                console.log(`Pan value adjusted to: ${value.toFixed(2)}`);
                // Future implementation can utilize Web Audio API if feasible
            }

            let frame = Math.floor(value * 27);
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
            let x = touch.clientX - sliderRect.left;
            x = Math.max(0, Math.min(x, sliderRect.width - sliderButton.offsetWidth));
            sliderButton.style.left = `${x}px`;

            let value = x / (sliderRect.width - sliderButton.offsetWidth);

            if (type === 'volume') {
                youtubePlayer.setVolume(value * 100);
            } else if (type === 'pan') {
                console.log(`Pan value adjusted to: ${value.toFixed(2)}`);
            }

            let frame = Math.floor(value * 27);
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

document.querySelectorAll('.desktop-icon').forEach(icon => {
    icon.addEventListener('click', handleIconClick);

    icon.addEventListener('mousedown', function(e) {
        // Only left mouse button
        if (e.button !== 0) return;

        let iconElement = this;
        let startX = e.pageX;
        let startY = e.pageY;
        let shiftX = e.clientX - iconElement.getBoundingClientRect().left;
        let shiftY = e.clientY - iconElement.getBoundingClientRect().top;
        let isDragging = false;
        const dragThreshold = 5; // Pixels

        function onMouseMove(event) {
            let moveX = event.pageX - startX;
            let moveY = event.pageY - startY;
            let distance = Math.sqrt(moveX * moveX + moveY * moveY);

            if (!isDragging && distance > dragThreshold) {
                isDragging = true;
                // Begin dragging
                iconElement.style.position = 'absolute';
                iconElement.style.zIndex = 1000;
            }

            if (isDragging) {
                let pageX = event.pageX;
                let pageY = event.pageY;
                iconElement.style.left = pageX - shiftX + 'px';
                iconElement.style.top = pageY - shiftY + 'px';
                e.preventDefault(); // Prevent text selection
            }
        }

        function onMouseUp(event) {
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);

            if (!isDragging) {
                // This was a click, not a drag
                // Optionally, handle the click here
                // For example, select the icon or open it
            } else {
                // Optionally, snap the icon to a grid or perform other drop logic here
            }
        }

        // Listen for mousemove and mouseup on the document
        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
    });

    // Handle touch events for dragging icons
    icon.addEventListener('touchstart', function(e) {
        if (e.touches.length !== 1) return;

        const touch = e.touches[0];
        let iconElement = this;
        let startX = touch.pageX;
        let startY = touch.pageY;
        let shiftX = touch.clientX - iconElement.getBoundingClientRect().left;
        let shiftY = touch.clientY - iconElement.getBoundingClientRect().top;
        let isDragging = false;
        const dragThreshold = 5; // Pixels

        function onTouchMove(event) {
            if (event.touches.length !== 1) return;
            const moveTouch = event.touches[0];
            let moveX = moveTouch.pageX - startX;
            let moveY = moveTouch.pageY - startY;
            let distance = Math.sqrt(moveX * moveX + moveY * moveY);

            if (!isDragging && distance > dragThreshold) {
                isDragging = true;
                // Begin dragging
                iconElement.style.position = 'absolute';
                iconElement.style.zIndex = 1000;
                e.preventDefault(); // Prevent scrolling
            }

            if (isDragging) {
                let pageX = moveTouch.pageX;
                let pageY = moveTouch.pageY;
                iconElement.style.left = pageX - shiftX + 'px';
                iconElement.style.top = pageY - shiftY + 'px';
                e.preventDefault(); // Prevent scrolling
            }
        }

        function onTouchEnd() {
            document.removeEventListener('touchmove', onTouchMove);
            document.removeEventListener('touchend', onTouchEnd);
            if (isDragging) {
                iconElement.style.zIndex = ''; // Reset z-index if necessary
            } else {
                // This was a tap, not a drag
                // Optionally, handle the tap here
            }
        }

        document.addEventListener('touchmove', onTouchMove, { passive: false });
        document.addEventListener('touchend', onTouchEnd, { passive: false });
    });

    // Handle double-click and double-tap to open window
    let lastTap = 0;
    icon.addEventListener('dblclick', function() {
        const windowId = this.getAttribute('data-window');
        if (windowId === 'mediaPlayer') {
            toggleMediaPlayer();
        } else {
            toggleWindow(windowId);
        }
    });

    icon.addEventListener('touchend', function(e) {
        const currentTime = new Date().getTime();
        const tapLength = currentTime - lastTap;
        if (tapLength < 300 && tapLength > 0) {
            // Double-tap detected
            const windowId = this.getAttribute('data-window');
            if (windowId === 'mediaPlayer') {
                toggleMediaPlayer();
            } else {
                toggleWindow(windowId);
            }
            e.preventDefault();
        }
        lastTap = currentTime;
    });
});
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

    // Get original size from data attributes
    const originalWidth = parseInt(windowElement.getAttribute('data-original-width'), 10);
    const originalHeight = parseInt(windowElement.getAttribute('data-original-height'), 10);

    if (!originalWidth || !originalHeight) return;

    // Set the width and height of iframe-content
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
    const title = 'Wi-Fi';
    const message = ''; // We'll build the content dynamically

    // Check if window already exists
    let existingWindow = document.getElementById(windowId);
    if (existingWindow) {
        toggleWindow(windowId);
        return;
    }

    // Create window element
    const windowElement = document.createElement('div');
    windowElement.id = windowId;
    windowElement.classList.add('window');
    windowElement.setAttribute('data-original-width', '300');
    windowElement.setAttribute('data-original-height', '400');

    // Window Header
    const windowHeader = document.createElement('div');
    windowHeader.classList.add('window-header');

    const windowTitle = document.createElement('span');
    windowTitle.classList.add('window-title');
    windowTitle.textContent = title;

    const windowButtons = document.createElement('div');
    windowButtons.classList.add('window-buttons');

    // Minimize Button
    const minimizeBtn = document.createElement('button');
    minimizeBtn.classList.add('minimize');
    minimizeBtn.textContent = '_';
    minimizeBtn.onclick = () => minimizeWindow(windowId);

    // Maximize Button
    const maximizeBtn = document.createElement('button');
    maximizeBtn.classList.add('maximize');
    maximizeBtn.textContent = '□';
    maximizeBtn.onclick = () => maximizeWindow(windowId);

    // Close Button
    const closeBtn = document.createElement('button');
    closeBtn.classList.add('close');
    closeBtn.textContent = 'X';
    closeBtn.onclick = () => closeWindow(windowId);

    // Append buttons to windowButtons
    windowButtons.appendChild(minimizeBtn);
    windowButtons.appendChild(maximizeBtn);
    windowButtons.appendChild(closeBtn);

    // Append title and buttons to header
    windowHeader.appendChild(windowTitle);
    windowHeader.appendChild(windowButtons);

    // Window Content
    const windowContent = document.createElement('div');
    windowContent.classList.add('window-content');

    // Create Wi-Fi connections list
    const wifiList = document.createElement('ul');
    wifiList.classList.add('wifi-list');

    // Fake Wi-Fi connections with humorous names
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
        if (wifi.locked) {
            wifiStatus.innerHTML = '🔒'; // Lock icon
        } else {
            wifiStatus.innerHTML = '🔓'; // Unlock icon
        }

        listItem.appendChild(wifiName);
        listItem.appendChild(wifiStatus);
        wifiList.appendChild(listItem);
    });

    windowContent.appendChild(wifiList);

    // Append header and content to window
    windowElement.appendChild(windowHeader);
    windowElement.appendChild(windowContent);

    // Add resize handle
    const resizeHandle = document.createElement('div');
    resizeHandle.classList.add('resize-handle', 'resize-handle-bottom-right');
    windowElement.appendChild(resizeHandle);

    // Append window to desktop
    document.querySelector('.desktop').appendChild(windowElement);

    // Open the window
    openWindow(windowId);
}

// Update Event Listener for Network Tray Icon
const networkTray = document.getElementById('networkTray');
networkTray.addEventListener('click', () => {
    openWifiWindow();
});

function openBatteryWindow() {
    const windowId = 'batteryWindow';
    const title = 'Power Options';
    const message = ''; // We'll build the content dynamically

    // Check if window already exists
    let existingWindow = document.getElementById(windowId);
    if (existingWindow) {
        toggleWindow(windowId);
        return;
    }

    // Create window element
    const windowElement = document.createElement('div');
    windowElement.id = windowId;
    windowElement.classList.add('window');
    windowElement.setAttribute('data-original-width', '250');
    windowElement.setAttribute('data-original-height', '300');

    // Window Header
    const windowHeader = document.createElement('div');
    windowHeader.classList.add('window-header');

    const windowTitle = document.createElement('span');
    windowTitle.classList.add('window-title');
    windowTitle.textContent = title;

    const windowButtons = document.createElement('div');
    windowButtons.classList.add('window-buttons');

    // Minimize Button
    const minimizeBtn = document.createElement('button');
    minimizeBtn.classList.add('minimize');
    minimizeBtn.textContent = '_';
    minimizeBtn.onclick = () => minimizeWindow(windowId);

    // Maximize Button
    const maximizeBtn = document.createElement('button');
    maximizeBtn.classList.add('maximize');
    maximizeBtn.textContent = '□';
    maximizeBtn.onclick = () => maximizeWindow(windowId);

    // Close Button
    const closeBtn = document.createElement('button');
    closeBtn.classList.add('close');
    closeBtn.textContent = 'X';
    closeBtn.onclick = () => closeWindow(windowId);

    // Append buttons to windowButtons
    windowButtons.appendChild(minimizeBtn);
    windowButtons.appendChild(maximizeBtn);
    windowButtons.appendChild(closeBtn);

    // Append title and buttons to header
    windowHeader.appendChild(windowTitle);
    windowHeader.appendChild(windowButtons);

    // Window Content
    const windowContent = document.createElement('div');
    windowContent.classList.add('window-content');

    // Create power options list
    const powerList = document.createElement('ul');
    powerList.classList.add('power-list');

    // Funny Power Options
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

    // Append header and content to window
    windowElement.appendChild(windowHeader);
    windowElement.appendChild(windowContent);

    // Add resize handle
    const resizeHandle = document.createElement('div');
    resizeHandle.classList.add('resize-handle', 'resize-handle-bottom-right');
    windowElement.appendChild(resizeHandle);

    // Append window to desktop
    document.querySelector('.desktop').appendChild(windowElement);

    // Open the window
    openWindow(windowId);
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

