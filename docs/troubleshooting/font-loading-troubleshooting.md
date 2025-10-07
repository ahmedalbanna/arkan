# Font Loading Troubleshooting Guide

## Quick Fix Checklist

### ✅ **Immediate Actions (Do First)**
1. **Stop the development server** (`Ctrl+C`)
2. **Restart with standard Next.js** (not Turbopack):
   ```bash
   npm run dev
   ```
3. **Check if fonts load** - Look for reduced error messages
4. **Verify fallback fonts** - Content should still be readable

### 🔧 **If Issues Persist**

#### Network Connectivity Issues
```bash
# Test DNS resolution
nslookup fonts.gstatic.com

# Test HTTP connectivity
curl -I https://fonts.gstatic.com/s/poppins/v24/pxiEyp8kv8JHgFVrJJfecnFHGPc.woff2

# Check if behind corporate firewall
ping google.com
```

#### Development Environment Issues
```bash
# Clear Next.js cache
rm -rf .next

# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Try different port
npm run dev -- -p 3000
```

## Error Patterns & Solutions

### Pattern 1: "Module not found: Can't resolve '@vercel/turbopack-next/internal/font/google/font'"

**Cause**: Turbopack compatibility issue with Next.js 15.3.3
**Solution**:
```bash
# Use standard Next.js instead of Turbopack
npm run dev  # Instead of npm run dev:turbo
```

### Pattern 2: "Error while requesting resource - fonts.gstatic.com"

**Cause**: Network connectivity issues
**Solutions**:
1. **Check internet connection**
2. **Try different network** (mobile hotspot)
3. **Use VPN** if behind corporate firewall
4. **Disable antivirus** temporarily

### Pattern 3: "DNS request timed out"

**Cause**: DNS resolution failure
**Solutions**:
```bash
# Try different DNS servers
# Windows: Change DNS to 8.8.8.8 and 8.8.4.4
# Or use Cloudflare DNS: 1.1.1.1 and 1.0.0.1
```

### Pattern 4: Fonts load but with delays

**Cause**: Slow network or font loading strategy
**Solution**: Fonts are configured with `display: 'swap'` for better loading

## Testing Font Loading

### Browser Developer Tools
```javascript
// Check if fonts are loaded
console.log('Poppins loaded:', document.fonts.check('16px Poppins'));
console.log('PT Sans loaded:', document.fonts.check('16px PT Sans'));

// List all loaded fonts
console.log('Loaded fonts:', Array.from(document.fonts).map(f => f.family));
```

### Visual Testing
1. **Open browser DevTools** (F12)
2. **Go to Network tab**
3. **Reload page**
4. **Filter by "Font"**
5. **Check if font requests succeed**

## Fallback Font Strategy

### Current Fallback Configuration
```typescript
// Latin fonts fallback to system fonts
fallback: ['system-ui', 'arial', 'sans-serif']

// Arabic fonts fallback to Arial
fallback: ['Arial', 'sans-serif']
```

### CSS Fallback Chain
```css
/* If Google Fonts fail, this chain is used */
font-family: 'Poppins', system-ui, arial, sans-serif;
```

## Performance Monitoring

### Font Loading Metrics
```javascript
// Monitor font loading performance
performance.getEntriesByType('resource')
  .filter(entry => entry.name.includes('font'))
  .forEach(entry => {
    console.log(`Font: ${entry.name}`);
    console.log(`Load time: ${entry.duration}ms`);
    console.log(`Size: ${entry.transferSize}bytes`);
  });
```

### User Experience Impact
- **Font loading time**: Should be < 1 second
- **Fallback activation**: Should be seamless
- **Visual stability**: No layout shifts

## Production Considerations

### CDN Reliability
- **Google Fonts CDN**: 99.9% uptime globally
- **Fallback strategy**: Essential for production
- **Self-hosting**: Consider for critical fonts

### Performance Optimization
```typescript
// Preload critical fonts
<link rel="preload" href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap" as="style" />

// Or use Next.js font optimization
const font = Poppins({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  display: 'swap', // Prevents invisible text during font load
});
```

## Advanced Troubleshooting

### Self-Hosted Fonts (If Google Fonts Completely Unavailable)

1. **Download font files**:
   ```bash
   mkdir -p public/fonts
   # Download .woff2 files from Google Fonts
   ```

2. **Update CSS**:
   ```css
   @font-face {
     font-family: 'Poppins';
     src: url('/fonts/Poppins-Regular.woff2') format('woff2');
     font-weight: 400;
     font-display: swap;
   }
   ```

3. **Update Next.js config**:
   ```typescript
   // next.config.ts
   const nextConfig = {
     // Disable Google Fonts optimization
     experimental: {
       optimizeFonts: false,
     },
   };
   ```

### Service Worker for Font Caching
```javascript
// public/sw.js
self.addEventListener('fetch', (event) => {
  if (event.request.url.includes('fonts.gstatic.com')) {
    event.respondWith(
      caches.match(event.request).then((response) => {
        return response || fetch(event.request).catch(() => {
          // Return empty response to prevent errors
          return new Response('', { status: 200 });
        });
      })
    );
  }
});
```

## Environment-Specific Issues

### Development Environment
- **Turbopack**: Disable for font loading
- **Hot reload**: May interfere with font loading
- **Cache**: Clear `.next` folder if issues persist

### Production Environment
- **CDN**: Ensure Google Fonts CDN is accessible
- **CORS**: Check for CORS issues
- **Caching**: Implement proper font caching

### Corporate Networks
- **Firewall**: May block Google Fonts
- **Proxy**: Configure proxy settings
- **DNS**: Use corporate DNS servers

## Monitoring and Alerts

### Error Tracking
```javascript
// Track font loading errors
window.addEventListener('error', (event) => {
  if (event.target.tagName === 'LINK' && event.target.href.includes('fonts')) {
    console.error('Font loading error:', event);
    // Send to error tracking service
  }
});
```

### Performance Monitoring
```javascript
// Monitor font loading performance
const observer = new PerformanceObserver((list) => {
  list.getEntries().forEach((entry) => {
    if (entry.name.includes('font')) {
      console.log('Font performance:', entry);
    }
  });
});
observer.observe({ entryTypes: ['resource'] });
```

## Recovery Procedures

### Complete Font System Reset
```bash
# 1. Stop development server
# 2. Clear all caches
rm -rf .next node_modules package-lock.json

# 3. Reinstall dependencies
npm install

# 4. Restart with standard Next.js
npm run dev
```

### Emergency Fallback Mode
```typescript
// Temporarily disable Google Fonts
const fontBody = {
  variable: '--font-body',
  // Use system fonts only
  style: { fontFamily: 'system-ui, arial, sans-serif' }
};
```

## Success Indicators

### ✅ **Font Loading Working**
- No error messages in console
- Fonts load within 1-2 seconds
- Typography matches design
- No layout shifts

### ⚠️ **Partial Success (Fallbacks Working)**
- Some font errors in console
- Fallback fonts displaying correctly
- Content remains readable
- Performance acceptable

### ❌ **Complete Failure**
- Multiple font errors
- Unreadable text
- Layout broken
- Performance severely impacted

## Getting Help

### Debug Information to Collect
1. **Console errors** (screenshot)
2. **Network tab** (font requests)
3. **Environment details**:
   - OS and version
   - Node.js version
   - Next.js version
   - Network type (corporate/home)

### Support Channels
- **GitHub Issues**: For code-related problems
- **Next.js Discord**: For Next.js specific issues
- **Stack Overflow**: For general font loading problems

## Prevention

### Best Practices
1. **Always use fallback fonts**
2. **Implement font loading monitoring**
3. **Test in different network conditions**
4. **Use `display: 'swap'` for better UX**
5. **Consider self-hosting critical fonts**

### Regular Maintenance
- **Monthly**: Check font loading performance
- **Quarterly**: Update font files
- **Annually**: Review font strategy

---

**Remember**: Font loading issues are common in development environments. The key is having robust fallback strategies and monitoring systems in place.
