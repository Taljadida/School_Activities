const fs = require('fs');
const path = require('path');

const albumsDir = path.join(__dirname, 'albums');
const outputFile = path.join(__dirname, 'albums.json');

function isMedia(file) {
  const ext = file.toLowerCase().split('.').pop();
  return ['jpg', 'jpeg', 'png', 'gif', 'mp4', 'webm'].includes(ext);
}

const albums = fs.readdirSync(albumsDir, { withFileTypes: true })
  .filter(dirent => dirent.isDirectory())
  .map(dirent => {
    const albumPath = path.join(albumsDir, dirent.name);
    const files = fs.readdirSync(albumPath)
      .filter(isMedia);

    if (files.length === 0) return null; // skip empty folders

    const cover = files.includes('cover.jpg') ? 'albums/' + dirent.name + '/cover.jpg' : 'albums/' + dirent.name + '/' + files[0];

    return {
      id: dirent.name,
      title: dirent.name.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      cover: cover,
      items: files.map(f => 'albums/' + dirent.name + '/' + f)
    };
  })
  .filter(Boolean);

fs.writeFileSync(outputFile, JSON.stringify(albums, null, 2));
console.log('albums.json generated with', albums.length, 'albums');
