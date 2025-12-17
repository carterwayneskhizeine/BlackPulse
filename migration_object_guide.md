# Migration: YouTube Extension Separation

## Overview
The `youtubeExtension` object has been extracted from `public/js/main.js` into a dedicated file `public/js/youtube-extension.js` to improve code organization and maintainability.

## Changes Made

### 1. New File Created
- **File**: `public/js/youtube-extension.js`
- **Purpose**: Contains the standalone YouTube URL to iframe conversion extension for Showdown markdown processor
- **Content**: The `youtubeExtension` object definition with regex pattern and replacement logic

### 2. Files Modified

#### `public/js/main.js`
- **Lines affected**: 62-70
- **Change**: Removed the `youtubeExtension` object definition
- **Replacement**: Added comment `// YouTubeExtension is now defined in youtube-extension.js`
- **No functional changes**: The extension is still referenced the same way in the converter configuration

#### `views/index.ejs`
- **Lines affected**: 258
- **Change**: Added script import before main.js loads
- **New line added**: `<script src="/js/youtube-extension.js?v=<%= new Date().getTime() %>"></script>`
- **Position**: Immediately before the main.js script tag (line 259)

## Migration Checklist

- [x] Extracted `youtubeExtension` to separate file
- [x] Updated `public/js/main.js` to remove definition
- [x] Added script import to `views/index.ejs`
- [x] Verified script load order (youtube-extension.js loads before main.js)
- [x] No functional changes to the extension behavior

## Notes

- The youtube extension is loaded globally before main.js, so it's available when main.js initializes the converter
- Cache busting is maintained through query parameters in both script tags
- The extension maintains the same functionality and API as before
