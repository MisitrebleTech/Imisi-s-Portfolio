// State management
let currentSong = null;
let isPlaying = false;
let audio = new Audio();

// DOM Elements
const playBtn = document.getElementById('playBtn');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const songTitle = document.getElementById('songTitle');
const artistName = document.getElementById('artistName');
const albumArt = document.getElementById('albumArt');
const volumeSlider = document.getElementById('volumeSlider');
const progressBar = document.querySelector('.progress');
const songGrid = document.getElementById('songGrid');

// Event Listeners
playBtn.addEventListener('click', togglePlay);
prevBtn.addEventListener('click', playPrevious);
nextBtn.addEventListener('click', playNext);
volumeSlider.addEventListener('input', adjustVolume);
audio.addEventListener('timeupdate', updateProgress);
audio.addEventListener('ended', () => playNext());

// Fetch songs from the backend
async function fetchSongs() {
    try {
        const response = await fetch('/api/songs');
        const songs = await response.json();
        displaySongs(songs);
    } catch (error) {
        console.error('Error fetching songs:', error);
    }
}

// Display songs in the grid
function displaySongs(songs) {
    songGrid.innerHTML = songs.map(song => `
        <div class="song-card" onclick="playSong(${song.id})">
            <img src="${song.albumArt || 'default-album.png'}" alt="${song.title}">
            <h3>${song.title}</h3>
            <p>${song.artist}</p>
        </div>
    `).join('');
}

// Play/Pause toggle
function togglePlay() {
    if (!currentSong) return;
    
    if (isPlaying) {
        audio.pause();
        playBtn.innerHTML = '<i class="fas fa-play"></i>';
    } else {
        audio.play();
        playBtn.innerHTML = '<i class="fas fa-pause"></i>';
    }
    isPlaying = !isPlaying;
}

// Play a specific song
function playSong(songId) {
    const song = songs.find(s => s.id === songId);
    if (!song) return;

    currentSong = song;
    audio.src = song.url;
    songTitle.textContent = song.title;
    artistName.textContent = song.artist;
    albumArt.src = song.albumArt || 'default-album.png';
    
    audio.play();
    isPlaying = true;
    playBtn.innerHTML = '<i class="fas fa-pause"></i>';
}

// Play previous song
function playPrevious() {
    if (!currentSong) return;
    const currentIndex = songs.findIndex(s => s.id === currentSong.id);
    const prevIndex = (currentIndex - 1 + songs.length) % songs.length;
    playSong(songs[prevIndex].id);
}

// Play next song
function playNext() {
    if (!currentSong) return;
    const currentIndex = songs.findIndex(s => s.id === currentSong.id);
    const nextIndex = (currentIndex + 1) % songs.length;
    playSong(songs[nextIndex].id);
}

// Adjust volume
function adjustVolume() {
    audio.volume = volumeSlider.value / 100;
}

// Update progress bar
function updateProgress() {
    const progress = (audio.currentTime / audio.duration) * 100;
    progressBar.style.width = `${progress}%`;
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    fetchSongs();
});

// Handle keyboard controls
document.addEventListener('keydown', (e) => {
    switch(e.code) {
        case 'Space':
            e.preventDefault();
            togglePlay();
            break;
        case 'ArrowLeft':
            playPrevious();
            break;
        case 'ArrowRight':
            playNext();
            break;
    }
});

// Add drag and drop functionality for volume slider
let isDragging = false;

volumeSlider.addEventListener('mousedown', () => {
    isDragging = true;
});

document.addEventListener('mousemove', (e) => {
    if (isDragging) {
        const rect = volumeSlider.getBoundingClientRect();
        const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
        const volume = Math.round((x / rect.width) * 100);
        volumeSlider.value = volume;
        adjustVolume();
    }
});

document.addEventListener('mouseup', () => {
    isDragging = false;
});
