# BlackPulse Implementation Guide

This document provides specific code changes required to implement the "BlackPulse" design theme for the Anonymous Message Board.

## 1. Configuration Changes

### `tailwind.config.js`
Update the `theme` section to include the BlackPulse color palette.

```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './views/**/*.ejs',
    './public/js/**/*.js',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // BlackPulse Palette
        'bp-black': '#050505',      // Main background (Near Black)
        'bp-dark': '#121212',       // Component background
        'bp-dark-hover': '#1E1E1E', // Hover state
        'bp-gray': '#2A2A2A',       // Borders / Dividers
        'bp-gold': '#FFD700',       // Accent / CTA / Links
        'bp-gold-dim': '#B39700',   // Muted Accent
        'bp-red': '#EF4444',        // Danger
        'bp-text': '#E5E7EB',       // Primary Text
        'bp-text-muted': '#9CA3AF', // Secondary Text
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
      },
      boxShadow: {
        'glow': '0 0 10px rgba(255, 215, 0, 0.1)',
        'glow-strong': '0 0 15px rgba(255, 215, 0, 0.2)',
      }
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}
```

## 2. Global Styles

### `src/input.css`
Replace the existing styles with the new definition.

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  body {
    @apply bg-bp-black text-bp-text antialiased selection:bg-bp-gold selection:text-bp-black;
  }
  
  /* Custom Scrollbar */
  ::-webkit-scrollbar {
    width: 6px;
  }
  ::-webkit-scrollbar-track {
    @apply bg-bp-black;
  }
  ::-webkit-scrollbar-thumb {
    @apply bg-bp-gray rounded-full;
  }
  ::-webkit-scrollbar-thumb:hover {
    @apply bg-bp-gold-dim;
  }
}

@layer components {
  /* Buttons */
  .btn-bp-primary {
    @apply bg-bp-gold text-bp-black font-bold py-2 px-6 rounded-md hover:bg-yellow-400 hover:shadow-glow transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed;
  }
  
  .btn-bp-outline {
    @apply border border-bp-gray text-bp-text-muted font-medium py-2 px-4 rounded-md hover:border-bp-gold hover:text-bp-gold transition-all duration-200 active:scale-95 bg-transparent;
  }
  
  .btn-bp-danger {
    @apply border border-bp-gray text-red-500 font-medium py-2 px-4 rounded-md hover:border-red-500 hover:bg-red-500/10 transition-all duration-200;
  }

  .btn-bp-icon {
    @apply p-2 text-bp-text-muted hover:text-bp-gold transition-colors rounded-full hover:bg-bp-gray;
  }

  /* Inputs */
  .input-bp {
    @apply w-full bg-bp-dark border border-bp-gray rounded-md p-3 text-bp-text placeholder-gray-600 focus:outline-none focus:border-bp-gold focus:ring-1 focus:ring-bp-gold transition-all duration-200;
  }

  /* Cards */
  .card-bp {
    @apply bg-bp-dark border border-bp-gray rounded-lg p-5 shadow-sm hover:border-gray-700 transition-colors duration-200;
  }
  
  /* Badges */
  .badge-bp {
    @apply text-xs font-bold px-2 py-0.5 rounded border border-bp-gray text-bp-text-muted;
  }
}

/* Animations */
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.animate-fade-in {
  animation: fadeIn 0.3s ease-out forwards;
}
```

## 3. Layout Structure (`views/index.ejs`)

The layout will change to a 2-column grid on desktop.

**Key Changes:**
1.  **Header**: Sticky top bar with logo, search (placeholder), and user controls.
2.  **Container**: `max-w-7xl` centered.
3.  **Grid**: `grid grid-cols-1 lg:grid-cols-12 gap-8`.
    *   **Sidebar (lg:col-span-3)**: Contains Filter/Sort controls (desktop), Tags, Announcements.
    *   **Main Feed (lg:col-span-9)**: Contains Message Input and Message List.

**New Structure Skeleton:**

```html
<body class="bg-bp-black text-bp-text min-h-screen flex flex-col">
    <!-- Sticky Header -->
    <header class="sticky top-0 z-50 bg-bp-black/90 backdrop-blur-md border-b border-bp-gray h-16">
        <div class="max-w-7xl mx-auto px-4 h-full flex items-center justify-between">
            <div class="flex items-center gap-4">
                <h1 class="text-xl font-bold tracking-tight text-white"><span class="text-bp-gold">Black</span>Pulse</h1>
                <!-- Desktop Search placeholder -->
                <div class="hidden md:block relative group">
                    <input type="text" placeholder="Search..." class="bg-bp-dark border border-bp-gray rounded-full py-1 px-4 text-sm w-48 focus:w-64 transition-all focus:border-bp-gold outline-none">
                </div>
            </div>
            <!-- User Controls -->
            <div id="user-area">...</div>
        </div>
    </header>

    <!-- Main Content Grid -->
    <div class="flex-1 max-w-7xl w-full mx-auto p-4 lg:p-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        <!-- Left Sidebar (Desktop Only for Filters/Tags) -->
        <aside class="hidden lg:block lg:col-span-3 space-y-6">
            <!-- Filter Widget -->
            <div class="card-bp space-y-4">
                <h3 class="text-sm font-bold text-gray-500 uppercase tracking-wider">Filters</h3>
                <div class="flex flex-col gap-2">
                    <button class="text-left px-3 py-2 rounded text-bp-gold bg-bp-gold/10 font-medium">Latest Messages</button>
                    <button class="text-left px-3 py-2 rounded text-bp-text-muted hover:bg-bp-gray transition-colors">My Private Feed</button>
                    <button class="text-left px-3 py-2 rounded text-bp-text-muted hover:bg-bp-gray transition-colors">Trending</button>
                </div>
            </div>
            
            <!-- Tags/Announcements Widget -->
            <div class="card-bp">
                <h3 class="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">System</h3>
                <p class="text-sm text-gray-400">Welcome to BlackPulse v2.0. Dark mode only. Anonymous interaction.</p>
            </div>
        </aside>

        <!-- Main Feed Area -->
        <main class="lg:col-span-9 space-y-6">
            <!-- Message Composer -->
            <div class="card-bp border-t-2 border-t-bp-gold">
                <!-- (Existing Form Logic with new classes) -->
                <form id="message-form">...</form>
            </div>
            
            <!-- Mobile Filters (Visible only on mobile) -->
            <div class="lg:hidden flex gap-2 overflow-x-auto pb-2">
                <button class="btn-bp-outline text-xs whitespace-nowrap active:bg-bp-gold active:text-black">Latest</button>
                <button class="btn-bp-outline text-xs whitespace-nowrap">Private</button>
                <button class="btn-bp-outline text-xs whitespace-nowrap">Trending</button>
            </div>

            <!-- Message List -->
            <div id="message-list" class="space-y-4">
                <!-- Dynamic Content -->
            </div>

            <!-- Pagination -->
            <div id="pagination-container" class="py-8"></div>
        </main>
    </div>
</body>
```

## 4. Component Rendering Updates

### `public/js/main-rendering-function.js`
Update `renderMessage` to generate DOM elements matching the new design.

*   **Wrapper**: Change class to `card-bp animate-fade-in group`.
*   **Header**: Flex row with Avatar (placeholder or initial), Username/Anonymous, Timestamp.
*   **Content**: `prose prose-invert max-w-none text-gray-300 mt-2`.
*   **Footer**: Divider line, then Action buttons using `.btn-bp-icon` or small text buttons.
*   **Private Badge**: Use `.badge-bp border-bp-gold text-bp-gold`.

### `public/js/comment-element.js`
Update `createCommentElement` to match the card style but slightly more compact.

*   **Wrapper**: `border-l-2 border-bp-gray pl-4 ml-2 mt-4` (Tree structure visualization) or keep the flat card style inside the main card. Given the request for "flat design", indented cleaner look is better.
*   **Actions**: Simple text buttons `text-xs text-gray-500 hover:text-bp-gold`.

### `public/js/pagination.js`
Update classes for buttons:
*   Active: `bg-bp-gold text-bp-black border-bp-gold`
*   Inactive: `btn-bp-outline`

## 5. UI Elements (`public/js/ui-elements.js`)
Ensure all ID references in `main.js` and other scripts match the new HTML structure in `index.ejs`.
*   Note: The ID names in `index.ejs` (like `message-form`, `message-list`) are preserved in the proposed structure, so minimal changes to logic are needed, mostly CSS classes.

---
**Ready to Implement?**
This guide outlines the transformation to "BlackPulse". The next step is to apply these code changes file by file.
