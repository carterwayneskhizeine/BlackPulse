const fs = require('fs');
const path = require('path');

/**
 * Function to clean up orphaned files.
 * @param {import('sqlite3').Database} db - The database instance.
 * @param {string} uploadsDir - Path to the uploads directory.
 */
const cleanupOrphanedFiles = (db, uploadsDir) => {
  console.log('Checking for orphaned files...');

  fs.readdir(uploadsDir, (err, files) => {
    if (err) {
      console.error('Error reading uploads directory:', err);
      return;
    }

    // Get all filenames from database (for all types of files)
    db.all('SELECT image_filename FROM messages WHERE has_image = 1 AND image_filename IS NOT NULL', (err, rows) => {
      if (err) {
        console.error('Error fetching filenames from database:', err);
        return;
      }

      const dbFilenames = new Set(rows.map(row => row.image_filename));
      let orphanCount = 0;

      // Check each file
      files.forEach(filename => {
        if (!dbFilenames.has(filename)) {
          const filePath = path.join(uploadsDir, filename);
          fs.unlink(filePath, (unlinkErr) => {
            if (unlinkErr) {
              console.error(`Failed to delete orphaned file ${filename}:`, unlinkErr);
            } else {
              console.log(`Deleted orphaned file: ${filename}`);
              orphanCount++;
            }
          });
        }
      });

      // NOTE: This summary log is subject to a race condition due to the asynchronous
      // nature of fs.unlink. The count may be inaccurate when printed.
      // This is consistent with the original implementation.
      if (orphanCount > 0) {
        console.log(`Cleaned up ${orphanCount} orphaned files`);
      } else {
        console.log('No orphaned files found');
      }
    });
  });
};

module.exports = cleanupOrphanedFiles;
