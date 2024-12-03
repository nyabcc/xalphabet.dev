document.addEventListener('DOMContentLoaded', () => {
    const loadingScreen = document.querySelector('.loading-screen');
    const loadingContent = document.querySelector('.loading-content');
    const loadingProgress = document.querySelector('.loading-progress');
    const content = document.querySelector('.content');
    const clickPrompt = document.querySelector('.click-prompt');
    const playlist = document.querySelectorAll('.audio-container audio');
    const nowPlaying = document.querySelector('.now-playing');
    const songTitle = document.querySelector('.song-title');
    let playlistIndex = 0;
    let isReady = false;
    let isMuted = false;
    let fadeOutInterval = null;
    let fadeInInterval = null;

    // Configure audio settings
    playlist.forEach(audio => {
        audio.volume = 0;
    });

    // Function to shuffle array (Fisher-Yates algorithm)
    const shuffleArray = (array) => {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    };

    // Convert NodeList to Array and shuffle
    let playlistArray = Array.from(playlist);
    playlistArray = shuffleArray(playlistArray);

    // Function to get next song
    const getNextSong = () => {
        let nextIndex;
        do {
            nextIndex = Math.floor(Math.random() * playlistArray.length);
        } while (nextIndex === playlistIndex && playlistArray.length > 1);
        
        playlistIndex = nextIndex;
        return playlistArray[playlistIndex];
    };

    // Function to update now playing display
    const updateNowPlaying = (audio) => {
        const title = audio.dataset.title;
        const artist = audio.dataset.artist;
        songTitle.textContent = `${title} - ${artist}`;
        nowPlaying.style.display = 'block';
        setTimeout(() => {
            nowPlaying.classList.add('visible');
        }, 100);
    };

    // Function to play next song with crossfade
    const playNextSong = async () => {
        const currentAudio = playlistArray[playlistIndex];
        const nextAudio = getNextSong();

        // Immediately stop any ongoing fade animations
        clearAllFadeIntervals();
        
        // Immediately stop and reset current song
        currentAudio.pause();
        currentAudio.currentTime = 0;
        currentAudio.volume = 0;

        // Make sure all other songs are stopped
        playlistArray.forEach(audio => {
            if (audio !== nextAudio) {
                audio.pause();
                audio.currentTime = 0;
                audio.volume = 0;
            }
        });

        // Start and fade in next song
        try {
            await nextAudio.play();
            updateNowPlaying(nextAudio);
            
            fadeInInterval = setInterval(() => {
                if (nextAudio.volume < 0.3) {
                    nextAudio.volume += 0.02;
                } else {
                    clearInterval(fadeInInterval);
                }
            }, 100);
        } catch (err) {
            console.log('Music playback failed:', err);
        }
    };

    // Function to clear all fade intervals
    const clearAllFadeIntervals = () => {
        if (fadeOutInterval) {
            clearInterval(fadeOutInterval);
            fadeOutInterval = null;
        }
        if (fadeInInterval) {
            clearInterval(fadeInInterval);
            fadeInInterval = null;
        }
    };

    // Handle click event
    loadingScreen.addEventListener('click', async (e) => {
        if (!isReady || loadingScreen.classList.contains('unlocking')) return;
        
        // Start playing random first song with fade in
        try {
            playlistIndex = Math.floor(Math.random() * playlistArray.length);
            const firstSong = playlistArray[playlistIndex];
            await firstSong.play();
            updateNowPlaying(firstSong);
            
            let volume = 0;
            const fadeIn = setInterval(() => {
                if (volume < 0.3) {
                    volume += 0.02;
                    firstSong.volume = volume;
                } else {
                    clearInterval(fadeIn);
                }
            }, 100);
        } catch (err) {
            console.log('Music playback failed:', err);
        }

        // Add ripple effect and continue with existing animations...
        const ripple = document.createElement('div');
        ripple.classList.add('ripple');
        ripple.style.left = `${e.clientX}px`;
        ripple.style.top = `${e.clientY}px`;
        loadingScreen.appendChild(ripple);
        
        loadingScreen.classList.add('unlocking');
        
        if (clickPrompt) {
            clickPrompt.style.opacity = '0';
            clickPrompt.style.transform = 'translateY(20px)';
        }
        
        setTimeout(() => {
            loadingScreen.classList.add('fade-out');
            
            setTimeout(() => {
                content.classList.remove('hidden');
                requestAnimationFrame(() => {
                    content.classList.add('visible');
                });
                
                setTimeout(() => {
                    loadingScreen.style.display = 'none';
                    ripple.remove();
                }, 1000);
            }, 300);
        }, 400);
    });

    // Add song end event listener to each song
    playlistArray.forEach(audio => {
        audio.addEventListener('ended', () => {
            audio.pause();
            audio.currentTime = 0;
            clearAllFadeIntervals();
            playNextSong();
        });
    });

    // Text sequence variables
    const textList = [
        "Photographer",
        "Developer",
        "xalphabet.dev",
        "Volleyball",
        "You :)"
    ];

    let sequenceIndex = 0;
    let isSequenceRunning = false;
    let sequenceTimeout = null;

    function showSequence() {
        // Safety check
        if (!document.querySelector('.content').classList.contains('visible')) {
            return;
        }

        const subtitle = document.querySelector('.profile-subtitle');
        if (!subtitle) return;

        // Clear any existing timeouts
        if (sequenceTimeout) {
            clearTimeout(sequenceTimeout);
        }

        // Fade out
        subtitle.style.opacity = '0';
        subtitle.style.transform = 'translateY(10px)';
        
        // Wait for fade out, then change text
        sequenceTimeout = setTimeout(() => {
            // Update text
            subtitle.textContent = textList[sequenceIndex];
            
            // Trigger reflow
            subtitle.offsetHeight;
            
            // Fade in
            subtitle.style.opacity = '1';
            subtitle.style.transform = 'translateY(0)';
            
            // Prepare next word
            sequenceTimeout = setTimeout(() => {
                sequenceIndex = (sequenceIndex + 1) % textList.length;
                showSequence();
            }, 2500); // Show for 2.5 seconds
        }, 500); // Fade transition takes 0.5 seconds
    }

    // Loading sequence
    setTimeout(() => {
        loadingProgress.style.width = '100%';
    }, 100);

    setTimeout(() => {
        isReady = true;
        loadingContent.classList.add('ready');
        
        if (clickPrompt) {
            clickPrompt.style.opacity = '1';
            clickPrompt.style.transform = 'translateY(0)';
        }
    }, 3000);

    // Start sequence when content is visible
    document.querySelector('.content').addEventListener('transitionend', () => {
        if (document.querySelector('.content').classList.contains('visible') && !isSequenceRunning) {
            isSequenceRunning = true;
            
            const subtitle = document.querySelector('.profile-subtitle');
            if (subtitle) {
                // Show first word with fade in
                subtitle.textContent = textList[0];
                subtitle.offsetHeight; // Trigger reflow
                subtitle.style.opacity = '1';
                subtitle.style.transform = 'translateY(0)';
                
                // Start sequence
                sequenceIndex = 1;
                sequenceTimeout = setTimeout(showSequence, 3000);
            }
        }
    });

    // Cleanup on page unload
    window.addEventListener('unload', () => {
        if (sequenceTimeout) {
            clearTimeout(sequenceTimeout);
        }
    });

    function updateProgress(audio) {
        const progress = document.querySelector('.progress');
        const currentTime = document.querySelector('.current-time');
        const duration = document.querySelector('.duration');
        
        const currentMinutes = Math.floor(audio.currentTime / 60);
        const currentSeconds = Math.floor(audio.currentTime % 60).toString().padStart(2, '0');
        const durationMinutes = Math.floor(audio.duration / 60);
        const durationSeconds = Math.floor(audio.duration % 60).toString().padStart(2, '0');
        
        currentTime.textContent = `${currentMinutes}:${currentSeconds}`;
        duration.textContent = `${durationMinutes}:${durationSeconds}`;
        
        const progressPercent = (audio.currentTime / audio.duration) * 100;
        progress.style.width = `${progressPercent}%`;
    }

    // Add event listeners for controls
    document.querySelector('.mute-btn').addEventListener('click', () => {
        const currentAudio = playlistArray[playlistIndex];
        isMuted = !isMuted;
        currentAudio.muted = isMuted;
        document.querySelector('.mute-btn i').className = 
            isMuted ? 'fas fa-volume-mute' : 'fas fa-volume-up';
    });

    document.querySelector('.skip-btn').addEventListener('click', () => {
        clearAllFadeIntervals(); // Clear any ongoing fades
        playNextSong();
    });

    document.querySelector('.progress-bar').addEventListener('click', (e) => {
        const progressBar = e.currentTarget;
        const clickPosition = e.offsetX / progressBar.offsetWidth;
        const currentAudio = playlistArray[playlistIndex];
        currentAudio.currentTime = clickPosition * currentAudio.duration;
    });

    // Add progress update
    function setupAudioListeners(audio) {
        audio.addEventListener('timeupdate', () => updateProgress(audio));
    }

    playlistArray.forEach(audio => {
        setupAudioListeners(audio);
    });

    // Add performance optimizations
    // Lazy load non-critical images
    const lazyImages = document.querySelectorAll('img[loading="lazy"]');
    if ('loading' in HTMLImageElement.prototype) {
        lazyImages.forEach(img => {
            img.loading = 'lazy';
        });
    } else {
        // Fallback for browsers that don't support lazy loading
        const lazyLoadScript = document.createElement('script');
        lazyLoadScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/lazysizes/5.3.2/lazysizes.min.js';
        document.body.appendChild(lazyLoadScript);
    }

    // Debounce progress updates
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    const debouncedUpdateProgress = debounce(updateProgress, 100);

    // Optimize audio loading
    playlistArray.forEach(audio => {
        audio.preload = 'metadata';
        audio.addEventListener('timeupdate', () => debouncedUpdateProgress(audio), { passive: true });
    });

    // Add error handling
    window.addEventListener('error', (e) => {
        console.error('Runtime error:', e);
        // You could add error reporting service here
    });

    // Cleanup resources
    window.addEventListener('beforeunload', () => {
        playlistArray.forEach(audio => {
            audio.pause();
            audio.src = '';
            audio.load();
        });
    });

    document.querySelector('.toggle-controls').addEventListener('click', function() {
        document.querySelector('.now-playing').classList.toggle('expanded');
    });
}); 