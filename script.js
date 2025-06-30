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

info.addEventListener('click', () => {
    document.querySelector(".info_box").style.zIndex = "20";
});

document.querySelector(".info_box").addEventListener('mouseleave', () => {
    document.querySelector(".info_box").style.zIndex = "-10";
});

info.addEventListener('mouseleave', () => {
    i_img.src = i_img.getAttribute('s');
});

let playlist;
let song;
let c_playlist;
let c_song;
let audio = new Audio();


function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');

    return `${formattedMinutes}:${formattedSeconds}`;
}

async function name_maker(raw) {
    const decoded = decodeURIComponent(raw);
    const clean = decoded.replace(/\/$/, "");
    return clean;
}

async function get_desc(t) {
    let f_data = await fetch(`${t[1]}`);
    let f_text = await f_data.text();
    let div = document.createElement("div");
    div.innerHTML = f_text;
    let f_atags = div.getElementsByTagName('a');
    for (let i = 1; i < f_atags.length; i++) {
        const e = f_atags[i];
        if (e.href.endsWith(".jpg")) {
            const url = new URL(e.href);
            const fileName = decodeURIComponent(url.pathname.split('/').pop());
            const cleanName = fileName.replace(/\.jpg$/i, "");
            t.push(cleanName);
            t.push(e.href);
        }
    }
    return t;
}

async function get_playlist(folder) {
    console.log("Playlist making begin")

    let f_data = await fetch(`${folder}`);
    let f_text = await f_data.text();
    let div = document.createElement("div");
    div.innerHTML = f_text;

    let f_atags = div.getElementsByTagName('a');

    playlist = [];
    for (let i = 1; i < f_atags.length; i++) {
        let temp = [];
        const e = f_atags[i];
        const name = await name_maker(e.href.split(`/${folder}/`)[1]);
        const link = e.href;
        temp.push(name);
        temp.push(link);
        temp = await get_desc(temp);
        playlist.push(temp);
    }

    let playlist_box = document.querySelector(".playlist_list")
    playlist_box.innerHTML = "";
    for (const p of playlist) {
        playlist_box.innerHTML = playlist_box.innerHTML +
            `<div class="playlist">
                        <img src="${p[3]}">
                        <div class="playlist_n">
                            <h1 class="p_name">${p[0]} </h1>
                            <div class="p_desc">${p[2]} </div>
                        </div>
                    </div>`;
    }

    Array.from(document.querySelector(".playlist_list").querySelectorAll(".playlist")).forEach((e, index, allPlaylists) => {
        e.addEventListener("click", async element => {
            allPlaylists.forEach(el => el.classList.remove("active"));
            e.classList.add("active");
            c_playlist = index;
            console.log("current playlist is ", index);
            await get_songs();
            c_song = 0;
            playMusic();
        })
    })
}

async function get_songs() {
    console.log("Songs making begin");

    let f_data = await fetch(`${playlist[c_playlist][1]}`);
    let f_text = await f_data.text();
    let div = document.createElement("div");
    div.innerHTML = f_text;

    let f_atags = div.getElementsByTagName('a');
    song = [];
    for (let i = 1; i < f_atags.length; i++) {
        let temp = [];
        const e = f_atags[i];
        if (e.href.endsWith(".mp3")) {
            const url = new URL(e.href);
            const fileName = decodeURIComponent(url.pathname.split('/').pop());
            const cleanName = fileName.replace(/\.mp3$/i, "");
            temp.push(cleanName);
            temp.push(e.href);
            song.push(temp);
        }
    }

    let song_list = document.querySelector(".song_list")
    song_list.innerHTML = "";
    for (const s of song) {
        song_list.innerHTML = song_list.innerHTML +
            `<li>
                        <div class="song">
                            <div class="name">
                                <div class="name_s">${s[0]} </div>
                            </div>
                        </div>
                    </li>`;
    }

    Array.from(document.querySelector(".song_list").getElementsByTagName("li")).forEach((e, index) => {
        e.addEventListener("click", element => {
            c_song = index;
            console.log("current song is ", index);
            playMusic();
        })
    })
}

const playMusic = (pause = false) => {
    audio.src = song[c_song][1];
    if (!pause) {
        audio.play()
        button_img.src = button_img.getAttribute('p');
    }
    document.querySelector(".song_name").innerHTML = song[c_song][0];
    document.querySelector(".time").innerHTML = "00:00";
}

const button = document.querySelector('.play_button');
const button_img = button.querySelector('.img');

button.addEventListener('click', () => {
    console.log("play/pause button clicked")
    if (button_img.src.endsWith(button_img.getAttribute('p'))) {
        button_img.src = button_img.getAttribute('s');
        audio.pause()
    }
    else {
        button_img.src = button_img.getAttribute('p');
        audio.play()
    }
});

audio.addEventListener("timeupdate", () => {
    document.querySelector(".time").innerHTML = `${secondsToMinutesSeconds(audio.currentTime)}`
    let percent = (audio.currentTime / audio.duration) * 100;
    document.querySelector(".circle_box").style.left = `calc(${percent}% - 5px)`;
})

document.querySelector(".bar_line").addEventListener("click", e => {
    let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
    document.querySelector(".circle_box").style.left = `calc(${percent}% - 5px)`;
    audio.currentTime = ((audio.duration) * percent) / 100
})

audio.addEventListener("ended", async () => {
    if (c_song + 1 < song.length) {
        c_song = c_song + 1;
        playMusic();
    }
    else {
        c_playlist = c_playlist + 1;
        await get_songs();
        c_song = 0;
        playMusic();
        const allPlaylists = document.querySelectorAll(".playlist_list .playlist");
        allPlaylists.forEach((el, i) => {
            el.classList.toggle("active", i === c_playlist);
        });
    }
});

document.querySelector(".previous_button").addEventListener("click", async () => {
    if (c_song - 1 >= 0) {
        c_song = c_song - 1;
        playMusic();
    }
    else {
        let t = 0;
        while (t == 0) {
            if (c_playlist - 1 >= 0) {
                c_playlist = c_playlist - 1;
            }
            else {
                c_playlist = playlist.length - 1;
            }
            await get_songs();
            if (song.length > 0) {
                t = 1;
                break;
            }
        }
        c_song = song.length - 1;
        playMusic();
        const allPlaylists = document.querySelectorAll(".playlist_list .playlist");
        allPlaylists.forEach((el, i) => {
            el.classList.toggle("active", i === c_playlist);
        });
    }
})

document.querySelector(".next_button").addEventListener("click", async () => {
    if (c_song + 1 < song.length) {
        c_song = c_song + 1;
        playMusic();
    }
    else {
        let t = 0;
        while (t == 0) {
            if (c_playlist + 1 < playlist.length) {
                c_playlist = c_playlist + 1;
            }
            else {
                c_playlist = 0;
            }
            await get_songs();
            if (song.length > 0) {
                t = 1;
                break;
            }
        }
        c_song = 0;
        playMusic();
        const allPlaylists = document.querySelectorAll(".playlist_list .playlist");
        allPlaylists.forEach((el, i) => {
            el.classList.toggle("active", i === c_playlist);
        });
    }
})

document.querySelector(".home").addEventListener("click", () => {
    location.reload(); // or window.location.reload();
});

get_playlist("Songs")