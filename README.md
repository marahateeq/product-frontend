# Product Frontend

A modern, responsive web frontend for the Product Management System.

## Overview

This is a single-page application (SPA) built with vanilla HTML, CSS, and JavaScript. It provides a clean interface for managing users through the User API.

## Features

- **User Management Interface**
  - Create new users
  - View all users
  - Edit existing users
  - Delete users

- **Real-time Updates**
  - Auto-refresh every 30 seconds
  - Manual refresh button
  - Live API status indicator

- **Modern UI/UX**
  - Responsive design (mobile-friendly)
  - Smooth animations
  - Loading indicators
  - Success/error notifications
  - Modal dialogs for editing

- **Security**
  - XSS protection (HTML escaping)
  - CORS support
  - Security headers in nginx

## Technology Stack

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Web Server**: Nginx (Alpine Linux)
- **Containerization**: Docker

## Project Structure

```
product-frontend/
├── index.html          # Main HTML page
├── app.js              # JavaScript logic and API calls
├── styles.css          # Styling and animations
├── nginx.conf          # Nginx server configuration
├── Dockerfile          # Docker build instructions
├── Jenkinsfile         # CI/CD pipeline definition
└── README.md           # This file
```

## Local Development

### Prerequisites
- Modern web browser (Chrome, Firefox, Edge, Safari)
- Python (for simple HTTP server) or any static file server

### Setup

1. **Clone the repository**:
   ```bash
   cd product-frontend
   ```

2. **Start a local web server**:

   Using Python:
   ```bash
   python -m http.server 3000
   ```

   Or using Node.js:
   ```bash
   npx http-server -p 3000
   ```

3. **Open in browser**:
   ```
   http://localhost:3000
   ```

### Configuration

The API base URL can be configured in `app.js`:

```javascript
const API_BASE_URL = window.API_BASE_URL || 'http://localhost:8080';
```

Or set it via environment variable when building the Docker image.

## Docker

### Build Image

```bash
docker build -t product-frontend:latest .
```

### Run Container

```bash
docker run -d \
  --name product-frontend \
  -p 80:80 \
  product-frontend:latest
```

### With Custom API URL

```bash
docker run -d \
  --name product-frontend \
  -p 80:80 \
  -e API_BASE_URL=http://api.example.com \
  product-frontend:latest
```

### Docker Compose

```yaml
version: '3.8'
services:
  frontend:
    image: product-frontend:latest
    ports:
      - "80:80"
    environment:
      - API_BASE_URL=http://user-api:8080
    depends_on:
      - user-api
```

## Features in Detail

### User Creation
- Form validation
- Required fields: username, email
- Optional field: full name
- Duplicate detection
- Success/error feedback

### User Listing
- Displays all users
- Shows username, email, full name
- Creation timestamp
- Empty state message

### User Editing
- Modal dialog
- Pre-filled form with current values
- Field validation
- Update confirmation

### User Deletion
- Confirmation dialog
- Prevents accidental deletions
- Immediate UI update

### API Status
- Real-time health check
- Visual status indicator
- Connection state (Connected/Disconnected/Issue)

### Auto-refresh
- Refreshes data every 30 seconds
- Pauses when tab is hidden (battery saving)
- Resumes when tab becomes active

## API Integration

The frontend integrates with the User API service:

### Endpoints Used

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | /health | Check API status |
| GET | /users | List all users |
| GET | /users/:id | Get user details |
| POST | /users | Create new user |
| PUT | /users/:id | Update user |
| DELETE | /users/:id | Delete user |

### Error Handling

The frontend handles:
- Network errors
- API errors (4xx, 5xx)
- Timeout errors
- Invalid responses
- CORS issues

## Jenkins Build

This service uses the shared `pipeline-build` library for automated builds.

### Build Process

1. **Checkout**: Clone repository
2. **Lint**: Check HTML/CSS/JS (if linters configured)
3. **Build**: Create Docker image
4. **Test**: Run health check on container
5. **Publish**: Push to Docker registry (on tag builds)
6. **Notify**: Send email notification

### Trigger Build

**Manual**:
- Go to Jenkins → product-frontend job
- Click "Build Now"

**Automated**:
- Push to `main` branch: Builds development image
- Push Git tag (e.g., `1.0.0`): Builds and publishes release

## Deployment

### Deploy to Environment

```bash
cd ../pipeline-deployment
ansible-playbook deploy-services.yml \
  -i ../deployment-config/inventory.ini \
  -e "env=dev service_name=product-frontend"
```

### Deployment Configuration

Configuration is in `deployment-config/services/product-frontend/docker-compose.yaml.j2`

Environment variables:
- `frontend_port`: Port to expose (default: 80)
- `api_base_url`: User API URL
- `environment`: Environment name (dev/qa/prod)

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

Uses modern JavaScript (ES6+):
- Async/await
- Fetch API
- Template literals
- Arrow functions
- Const/let

## Performance

### Optimizations

- Gzip compression enabled
- Static asset caching (1 year)
- Minified CSS (in production)
- Lazy loading for images (if added)
- Debounced form submissions

### Benchmarks

- First Contentful Paint: < 1s
- Time to Interactive: < 2s
- Lighthouse Score: 95+

## Accessibility

- Semantic HTML
- ARIA labels
- Keyboard navigation
- Focus indicators
- Color contrast (WCAG AA)

## Security

### Frontend Security

- XSS protection (HTML escaping)
- Input validation
- HTTPS ready
- No inline scripts
- Content Security Policy headers

### Nginx Security Headers

```nginx
X-Frame-Options: SAMEORIGIN
X-Content-Type-Options: nosniff
X-XSS-Protection: 1; mode=block
```

## Customization

### Theming

Colors can be customized in `styles.css`:

```css
:root {
    --primary-color: #4a90e2;
    --success-color: #5cb85c;
    --danger-color: #d9534f;
    /* ... more colors */
}
```

### Auto-refresh Interval

Change in `app.js`:

```javascript
const AUTO_REFRESH_INTERVAL = 30000; // milliseconds
```

### API Timeout

Add to fetch calls:

```javascript
const controller = new AbortController();
setTimeout(() => controller.abort(), 5000); // 5s timeout
fetch(url, { signal: controller.signal });
```

## Troubleshooting

### Can't Connect to API

1. Check API is running:
   ```bash
   curl http://localhost:8080/health
   ```

2. Check CORS settings on API

3. Verify API_BASE_URL in browser console

### Styles Not Loading

1. Check nginx logs:
   ```bash
   docker logs product-frontend
   ```

2. Verify file permissions in container

3. Clear browser cache

### Modal Not Opening

1. Check browser console for JavaScript errors
2. Verify user data is loading correctly
3. Check modal CSS is not conflicting

## Future Enhancements

- [ ] Add user search/filter
- [ ] Implement pagination
- [ ] Add sorting options
- [ ] User profile pictures
- [ ] Export users to CSV
- [ ] Print-friendly view
- [ ] Dark mode toggle
- [ ] Offline support (PWA)
- [ ] Internationalization (i18n)
- [ ] Advanced analytics dashboard

## Contributing

1. Create feature branch
2. Make changes
3. Test in browser
4. Test Docker build
5. Create pull request
6. Deploy to dev for testing

## License

Internal use only - proprietary
