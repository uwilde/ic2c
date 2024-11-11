// Function to change the start button image on mousedown and mouseup
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
        // Restore to a smaller, default size
        mediaPlayer.classList.remove('maximized');

        // Set the predefined "normal" size and center it
        mediaPlayer.style.width = '386.989px';
        mediaPlayer.style.height = '426.983px';

        let topPosition = (window.innerHeight - mediaPlayer.offsetHeight) / 2;
        let leftPosition = (window.innerWidth - mediaPlayer.offsetWidth) / 2;

        mediaPlayer.style.top = `${topPosition}px`;
        mediaPlayer.style.left = `${leftPosition}px`;
    } else {
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

// Attach mousedown event to all window headers
document.querySelectorAll('.window-header, .media-player-header').forEach(header => {
    header.addEventListener('mousedown', function (e) {
        // Only left mouse button
        if (e.button !== 0) return;

        isDragging = true;
        currentWindow = this.parentNode;
        offsetX = e.clientX - currentWindow.getBoundingClientRect().left;
        offsetY = e.clientY - currentWindow.getBoundingClientRect().top;
        bringToFront(currentWindow);
    });
});

// Handle mousemove and mouseup events for dragging
document.addEventListener('mousemove', function (e) {
    if (isDragging && currentWindow && !currentWindow.classList.contains('maximized')) {
        let newX = e.clientX - offsetX;
        let newY = e.clientY - offsetY;

        // Calculate maximum positions to prevent overlapping the taskbar and going off-screen
        const maxX = window.innerWidth - currentWindow.offsetWidth;
        const maxY = window.innerHeight - currentWindow.offsetHeight - 40; // 40px taskbar height

        newX = Math.max(0, Math.min(newX, maxX));
        newY = Math.max(0, Math.min(newY, maxY));

        currentWindow.style.left = newX + 'px';
        currentWindow.style.top = newY + 'px';
    }
});

document.addEventListener('mouseup', function () {
    isDragging = false;
    currentWindow = null;
});

// Resizable Windows
document.querySelectorAll('.resize-handle').forEach(handle => {
    handle.addEventListener('mousedown', initResize, false);
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

function Resize(e) {
    if (currentResizeWindow) {
        const width = originalWidth + (e.clientX - originalMouseX);
        const height = originalHeight + (e.clientY - originalMouseY);

        // Set minimum and maximum sizes
        const minWidth = 300;
        const minHeight = 200;
        const maxWidth = window.innerWidth - originalX;
        const maxHeight = window.innerHeight - originalY - 40; // 40px taskbar height

        currentResizeWindow.style.width = Math.max(minWidth, Math.min(width, maxWidth)) + 'px';
        currentResizeWindow.style.height = Math.max(minHeight, Math.min(height, maxHeight)) + 'px';

        // Adjust iframe or media player scale
        if (currentResizeWindow.id === 'mediaPlayer') {
            adjustMediaPlayerScale();
        } else {
            adjustIframeScale(currentResizeWindow.id);
        }
    }
}

function stopResize() {
    window.removeEventListener('mousemove', Resize, false);
    window.removeEventListener('mouseup', stopResize, false);
    currentResizeWindow = null;
}

// Ensure windows do not go beyond the taskbar upon resizing
function constrainWindow(windowElement) {
    const rect = windowElement.getBoundingClientRect();
    const maxHeight = window.innerHeight - 40; // 40px taskbar height
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
    setInterval(() => updateSeekBar(head, track), 1000);

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
    });

    playButton.addEventListener('click', () => {
        if (isPlaying) {
            pause();
        } else {
            play();
        }
    });

    stopButton.addEventListener('click', stop);
    prevButton.addEventListener('click', prevTrack);
    nextButton.addEventListener('click', nextTrack);
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
}

function onDragHead(e) {
    if (isDraggingHead) {
        let x = e.clientX - seekBarRect.left;
        x = Math.max(0, Math.min(x, seekBarRect.width));
        document.getElementById('head').style.left = `${x}px`;

        let duration = youtubePlayer.getDuration() || 0;
        let seekTime = (x / seekBarRect.width) * duration;
        youtubePlayer.seekTo(seekTime, true);
    }
}

function onReleaseHead() {
    isDraggingHead = false;
    document.getElementById('head').src = 'icons/HEAD.png';
    document.removeEventListener('mousemove', onDragHead);
    document.removeEventListener('mouseup', onReleaseHead);
}

function updateSeekBar(head, track) {
    if (!youtubePlayer || !youtubePlayer.getDuration || currentTrackIndex === null) return;
    let duration = youtubePlayer.getDuration();
    let currentTime = youtubePlayer.getCurrentTime();
    if (duration > 0) {
        let progress = (currentTime / duration) * track.offsetWidth;
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

// Desktop Icons Drag-and-Drop Functionality
document.querySelectorAll('.desktop-icon').forEach(icon => {
    // Handle dragging
    icon.addEventListener('mousedown', function(e) {
        // Prevent dragging if clicking on inner elements
        if (e.target.tagName.toLowerCase() !== 'img' && e.target.tagName.toLowerCase() !== 'span') return;

        e.preventDefault(); // Prevent default behavior like text selection

        let iconElement = this;
        let shiftX = e.clientX - iconElement.getBoundingClientRect().left;
        let shiftY = e.clientY - iconElement.getBoundingClientRect().top;

        iconElement.style.position = 'absolute';
        iconElement.style.zIndex = 1000;

        moveAt(e.pageX, e.pageY);

        // Move the icon under the pointer
        function moveAt(pageX, pageY) {
            iconElement.style.left = pageX - shiftX + 'px';
            iconElement.style.top = pageY - shiftY + 'px';
        }

        // Move the icon as the mouse moves
        function onMouseMove(event) {
            moveAt(event.pageX, event.pageY);
        }

        // Listen for mousemove on the document
        document.addEventListener('mousemove', onMouseMove);

        // Define the onMouseUp handler
        function onMouseUp() {
            // Remove the event listeners to stop dragging
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);

            // Optionally, snap the icon to a grid or perform other drop logic here
        }

        // Listen for mouseup on the document
        document.addEventListener('mouseup', onMouseUp);
    });

    // Handle double-click to open window
    icon.addEventListener('dblclick', function() {
        const windowId = this.getAttribute('data-window');
        if (windowId === 'mediaPlayer') {
            toggleMediaPlayer();
        } else {
            toggleWindow(windowId);
        }
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
