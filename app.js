let allAlbums = [];
let currentPath = [];

function renderAlbumLevel(data) {
    const grid = document.getElementById('albumGrid');
    const navLogo = document.getElementById('navLogo');
    const navSeparator = document.getElementById('navSeparator');
    const currentTitle = document.getElementById('currentTitle');
    const currentCount = document.getElementById('currentCount');

    grid.innerHTML = '';
    window.scrollTo(0, 0);

    // 1. DYNAMIC NAVBAR LOGIC
    if (currentPath.length > 0) {
        const folder = currentPath[currentPath.length - 1];
        navSeparator.style.display = 'block';
        currentTitle.innerText = folder.title;
        currentCount.innerText = folder.subAlbums.length > 0 
            ? `${folder.subAlbums.length} GALLERIES` 
            : `${folder.items.length} PHOTOS`;

        // Logo acts as "Back" button
        navLogo.onclick = () => {
            currentPath.pop();
            const prev = currentPath.length > 0 ? currentPath[currentPath.length - 1].subAlbums : allAlbums;
            renderAlbumLevel(prev);
        };
    } else {
        // Main Home State
        navSeparator.style.display = 'none';
        currentTitle.innerText = 'GALLERIES';
        currentCount.innerText = 'ALL ALBUMS';
        
        navLogo.onclick = () => window.location.reload();
    }

    // 2. RENDER THE CONTENT
    data.forEach(album => {
        const div = document.createElement('div');
        const isCategory = album.subAlbums && album.subAlbums.length > 0;

        if (isCategory) {
            div.className = 'category-card';
            div.innerHTML = `
                <div class="media-container">
                    <img src="${album.cover}" alt="${album.title}" loading="lazy">
                    <div class="overlay">
                        <h2 class="title">${album.title}</h2>
                        <span class="count">${album.subAlbums.length} GALLERIES</span>
                    </div>
                </div>
            `;
        } else {
            div.className = 'album-card';
            div.innerHTML = `
                <div class="media-container">
                    <img src="${album.cover}" alt="${album.title}" loading="lazy">
                </div>
                <div class="album-info">
                    <h3 class="title">${album.title}</h3>
                    <span class="count">${album.items.length} PHOTOS</span>
                </div>
            `;
        }

        div.onclick = () => {
            if (isCategory) {
                currentPath.push(album);
                renderAlbumLevel(album.subAlbums);
            } else {
                localStorage.setItem('currentAlbum', JSON.stringify(album));
                window.location.href = 'album.html';
            }
        };
        grid.appendChild(div);
    });
}

fetch('albums.json')
    .then(res => res.json())
    .then(data => {
        allAlbums = data;
        renderAlbumLevel(allAlbums);
    });