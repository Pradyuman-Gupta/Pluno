const home = document.querySelector('.home');
const h_img = home.querySelector('.h_img');

home.addEventListener('mouseenter', () => {
    h_img.src = h_img.getAttribute('a');
});
home.addEventListener('mouseleave', () => {
    h_img.src = h_img.getAttribute('s');
});

const info = document.querySelector('.info');
const i_img = info.querySelector('.i_img');

info.addEventListener('mouseenter', () => {
    i_img.src = i_img.getAttribute('a');
});
info.addEventListener('mouseleave', () => {
    i_img.src = i_img.getAttribute('s');
});

info.addEventListener('click', () => {
    const box = document.querySelector(".info_box");
    const currentLeft = box.style.left;

    if (currentLeft === "5%") {
        box.style.left = "-25%";
    } else {
        box.style.left = "5%";
    }
});

document.querySelector(".h_info").addEventListener('click', () => {
    const box = document.querySelector(".info_box");
    const currentLeft = box.style.left;

    if (currentLeft === "110%") {
        box.style.left = "calc(50% - 10px)";
    } else {
        box.style.left = "110%";
    }
});

document.querySelector(".hamburger").addEventListener('click', () => {
    const box = document.querySelector(".song_list_box");
    const currentLeft = box.style.left;

    if (currentLeft === "-60%") {
        box.style.left = "10px";
    } else {
        box.style.left = "-60%";
    }
});

let playlist = [];
let song = [];
let c_playlist = 0;
let c_song = 0;
let audio = new Audio();

function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) return "00:00";
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

// Show playlist from JSON file
async function get_playlist(jsonFile) {
    const response = await fetch(jsonFile);
    const data = await response.json();

    playlist = [];

    let playlist_box = document.querySelector(".playlist_list");
    playlist_box.innerHTML = "";

    for (const p of data) {
        playlist.push([
            p.name,
            p.songs,
            p.desc,
            p.cover
        ]);

        playlist_box.innerHTML += `
            <div class="playlist">
                <img src="${p.cover}">
                <div class="playlist_n">
                    <h1 class="p_name">${p.name}</h1>
                    <div class="p_desc">${p.desc}</div>
                </div>
            </div>`;
    }

    Array.from(document.querySelectorAll(".playlist")).forEach((e, index, allPlaylists) => {
        e.addEventListener("click", () => {
            allPlaylists.forEach(el => el.classList.remove("active"));
            e.classList.add("active");
            c_playlist = index;
            song = playlist[c_playlist][1];
            c_song = 0;
            playMusic();

            // Show songs of selected playlist
            let song_list = document.querySelector(".song_list");
            song_list.innerHTML = "";
            song.forEach((s, i) => {
                song_list.innerHTML += `
                    <li>
                        <div class="song">
                            <div class="name">
                                <div class="name_s">${s.title}</div>
                            </div>
                        </div>
                    </li>`;
            });

            // Click individual song to play
            Array.from(document.querySelectorAll(".song_list li")).forEach((el, i) => {
                el.addEventListener("click", () => {
                    c_song = i;
                    playMusic();
                });
            });
        });
    });
}

const playMusic = (pause = false) => {
    audio.src = song[c_song].file;
    if (!pause) {
        audio.play();
        button_img.src = button_img.getAttribute('p');
    }
    document.querySelector(".song_name").innerHTML = song[c_song].title;
    document.querySelector(".time").innerHTML = "00:00";
};

const button = document.querySelector('.play_button');
const button_img = button.querySelector('.img');

button.addEventListener('click', () => {
    if (button_img.src.endsWith(button_img.getAttribute('p'))) {
        button_img.src = button_img.getAttribute('s');
        audio.pause();
    } else {
        button_img.src = button_img.getAttribute('p');
        audio.play();
    }
});

audio.addEventListener("timeupdate", () => {
    document.querySelector(".time").innerHTML = `${secondsToMinutesSeconds(audio.currentTime)}`;
    const percent = (audio.currentTime / audio.duration) * 100;
    document.querySelector(".circle_box").style.left = `calc(${percent}% - 5px)`;
});

document.querySelector(".bar_line").addEventListener("click", e => {
    const percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
    document.querySelector(".circle_box").style.left = `calc(${percent}% - 5px)`;
    audio.currentTime = (audio.duration * percent) / 100;
});

audio.addEventListener("ended", () => {
    if (c_song + 1 < song.length) {
        c_song++;
    } else {
        c_playlist = (c_playlist + 1) % playlist.length;
        song = playlist[c_playlist][1];
        c_song = 0;
    }
    updatePlaylistUI();
    playMusic();
    showSongs();
});

function updatePlaylistUI() {
    document.querySelectorAll(".playlist").forEach((el, i) => {
        el.classList.toggle("active", i === c_playlist);
    });
}

function showSongs() {
    const song_list = document.querySelector(".song_list");
    song_list.innerHTML = "";
    song.forEach((s, i) => {
        song_list.innerHTML += `
            <li>
                <div class="song">
                    <div class="name">
                        <div class="name_s">${s.title}</div>
                    </div>
                </div>
            </li>`;
    });

    Array.from(document.querySelectorAll(".song_list li")).forEach((el, i) => {
        el.addEventListener("click", () => {
            c_song = i;
            playMusic();
        });
    });
}

document.querySelector(".previous_button").addEventListener("click", () => {
    if (c_song > 0) {
        c_song--;
    } else {
        c_playlist = (c_playlist - 1 + playlist.length) % playlist.length;
        song = playlist[c_playlist][1];
        c_song = song.length - 1;
    }
    updatePlaylistUI();
    playMusic();
    showSongs();
});

document.querySelector(".next_button").addEventListener("click", () => {
    if (c_song + 1 < song.length) {
        c_song++;
    } else {
        c_playlist = (c_playlist + 1) % playlist.length;
        song = playlist[c_playlist][1];
        c_song = 0;
    }
    updatePlaylistUI();
    playMusic();
    showSongs();
});

document.querySelector(".home").addEventListener("click", () => {
    location.reload();
});

document.querySelector(".h_home").addEventListener("click", () => {
    location.reload();
});

get_playlist("playlist.json");
