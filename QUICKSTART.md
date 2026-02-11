# Quick Start Guide

Get your Phantom Marketplace up and running in 3 minutes!

## Prerequisites

- **Node.js 18+** ([Download here](https://nodejs.org/))
- **npm**, **yarn**, or **pnpm**
- Modern web browser with WebGL support

## Installation

### Option 1: Automated Setup (Recommended)

```bash
# Make setup script executable (Unix/Mac)
chmod +x setup.sh

# Run setup
./setup.sh
```

### Option 2: Manual Setup

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

## Access Your Marketplace

Open your browser and navigate to:
```
http://localhost:3000
```

You should see:
- ✨ Animated 3D particle background
- 🎨 Modern marketplace interface
- 📱 Fully responsive design

## Next Steps

### Customize Your Marketplace

1. **Change Colors**
   - Edit `app/globals.css` (lines 4-10)
   - Modify CSS variables for instant theme changes

2. **Adjust 3D Effects**
   - Open `components/BackgroundScene.tsx`
   - Change `particleCount` (line 15) for more/fewer particles
   - Modify colors (line 47, 62)

3. **Update Content**
   - Edit `components/FeaturedCollections.tsx` for collections
   - Modify `components/TrendingArtists.tsx` for artists
   - Customize `components/Hero.tsx` for hero section

### Performance Tuning

**For Lower-End Devices:**
```typescript
// In BackgroundScene.tsx, reduce particles:
const particleCount = 3000; // Was 8000
```

**For Better Performance:**
```typescript
// Disable auto-rotation:
autoRotate={false}
```

## Common Commands

```bash
# Development
npm run dev          # Start dev server with hot reload

# Production
npm run build        # Build optimized production bundle
npm start            # Start production server

# Maintenance
npm run lint         # Check code quality
```

## Troubleshooting

### Issue: 3D Background Not Showing

**Solution:**
1. Check browser console for errors
2. Verify WebGL is enabled: Visit `chrome://gpu` or `about:support`
3. Update graphics drivers
4. Try a different browser

### Issue: Slow Performance

**Solution:**
1. Reduce particle count in `BackgroundScene.tsx`
2. Disable auto-rotation
3. Close other browser tabs
4. Check system resources

### Issue: Build Errors

**Solution:**
```bash
# Clear cache and reinstall
rm -rf node_modules .next
npm install
npm run dev
```

## Keyboard Shortcuts (Dev Mode)

- `Ctrl/Cmd + R` - Reload page
- `Ctrl/Cmd + Shift + R` - Hard reload
- `F12` - Open developer tools

## File Structure

```
phantom-marketplace/
├── app/
│   ├── globals.css       # 🎨 Styles & colors
│   ├── layout.tsx        # Root layout
│   └── page.tsx          # Main page
├── components/
│   ├── BackgroundScene.tsx  # ✨ 3D effects
│   ├── Navbar.tsx
│   ├── Hero.tsx
│   ├── FeaturedCollections.tsx
│   ├── TrendingArtists.tsx
│   └── Footer.tsx
└── package.json          # Dependencies
```

## What's Next?

1. **Customize Design**: Make it yours with colors and content
2. **Add Features**: Connect to Web3, add real data
3. **Deploy**: Ship to Vercel, Netlify, or your hosting
4. **Read Docs**: Check `IMPLEMENTATION_NOTES.md` for deep dive

## Need Help?

- 📖 Read `README.md` for detailed documentation
- 🔧 Check `IMPLEMENTATION_NOTES.md` for technical details
- 🐛 Issues? Check the Troubleshooting section above

---

**Happy Building! 🚀**

Your marketplace is ready to customize and deploy!
