const fs = require('fs');
const path = require('path');

const albumsDir = path.join(__dirname, 'albums');
const outputFile = path.join(__dirname, 'albums.json');

// Supported media types
const isMedia = (file) => /\.(jpg|jpeg|png|gif|mp4|webm)$/i.test(file);
const isImage = (file) => /\.(jpg|jpeg|png|gif)$/i.test(file);

/**
 * HELPER: If a folder has no cover, it looks into its sub-albums 
 * recursively until it finds the first available image.
 */
function findDeepCover(album) {
    // 1. If this specific folder already found a cover, use it
    if (album.cover) return album.cover;

    // 2. If not, look into the sub-albums (if they exist)
    if (album.subAlbums && album.subAlbums.length > 0) {
        for (const sub of album.subAlbums) {
            const deepCover = findDeepCover(sub);
            if (deepCover) return deepCover;
        }
    }
    return null;
}

function processDirectory(dirPath, relativePath = 'albums') {
  const items = fs.readdirSync(dirPath, { withFileTypes: true });
  
  // 1. Get all media files in THIS specific folder
  const mediaFiles = items
    .filter(dirent => dirent.isFile() && isMedia(dirent.name))
    .map(dirent => path.join(relativePath, dirent.name).replace(/\\/g, '/'));

  // 2. Find a cover for THIS folder (Directly)
  let folderCover = null;
  const potentialCovers = items.filter(f => f.isFile() && f.name.toLowerCase().startsWith('cover.'));
  
  if (potentialCovers.length > 0) {
    folderCover = path.join(relativePath, potentialCovers[0].name).replace(/\\/g, '/');
  } else if (mediaFiles.length > 0) {
    const firstImage = mediaFiles.find(f => isImage(f));
    folderCover = firstImage || mediaFiles[0];
  }

  // 3. Process sub-folders (Recursive)
  const subAlbums = items
    .filter(dirent => dirent.isDirectory())
    .map(dirent => processDirectory(path.join(dirPath, dirent.name), path.join(relativePath, dirent.name)))
    .filter(Boolean);

  // Skip if folder is empty and has no sub-albums
  if (mediaFiles.length === 0 && subAlbums.length === 0) return null;

  const albumObject = {
    id: relativePath,
    title: path.basename(dirPath).replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
    cover: folderCover,
    items: mediaFiles,
    subAlbums: subAlbums 
  };

  // 4. THE UPDATE: If this folder still has no cover, grab it from the children
  if (!albumObject.cover) {
      albumObject.cover = findDeepCover(albumObject);
  }

  return albumObject;
}

// Start processing
const albumsData = fs.readdirSync(albumsDir, { withFileTypes: true })
  .filter(d => d.isDirectory())
  .map(d => processDirectory(path.join(albumsDir, d.name), `albums/${d.name}`))
  .filter(Boolean);

fs.writeFileSync(outputFile, JSON.stringify(albumsData, null, 2));
console.log('Successfully generated nested albums.json with Deep Covers');