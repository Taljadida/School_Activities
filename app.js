fetch('albums.json')
  .then(res => res.json())
  .then(albums => {
    const grid = document.getElementById('albumGrid');
    albums.forEach(album => {
      const div = document.createElement('div');
      div.className = 'album-card';
      
      // Calculate count label
      const count = album.items.length;
      const label = count === 1 ? '1 ITEM' : `${count} PHOTOS`;

      div.innerHTML = `
        <div class="media-container">
          <img src="${album.cover}" alt="${album.title}" loading="lazy">
        </div>
        <div class="title">${album.title}</div>
        <div class="count">${label}</div>
      `;
      
      div.onclick = () => {
        localStorage.setItem('currentAlbum', JSON.stringify(album));
        window.location.href = 'album.html';
      };
      grid.appendChild(div);
    });
  });