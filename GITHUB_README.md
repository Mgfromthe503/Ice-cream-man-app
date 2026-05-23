# The Ice Cream Man 🍦

**A modern, on-demand ice cream delivery platform connecting customers with ice cream vendors in real-time.**

[![GitHub](https://img.shields.io/badge/GitHub-Mgfromthe503-blue?logo=github)](https://github.com/Mgfromthe503/the-ice-cream-man)
[![License](https://img.shields.io/badge/License-MIT-green)](LICENSE)
[![Version](https://img.shields.io/badge/Version-1.0.0-blue)](package.json)
[![React Native](https://img.shields.io/badge/React%20Native-0.81-blue?logo=react)](https://reactnative.dev)
[![Expo](https://img.shields.io/badge/Expo-54-black?logo=expo)](https://expo.dev)

---

## Overview

**The Ice Cream Man** is a full-stack mobile application that revolutionizes how customers access ice cream and how vendors operate their businesses. Instead of randomly driving through neighborhoods, ice cream vendors receive real-time requests from customers and can accept orders with one tap. Customers enjoy one-tap ordering, real-time driver tracking, and a delightful user experience with candy-themed graphics.

The platform operates as a two-sided marketplace with distinct customer and vendor interfaces, real-time location tracking, push notifications, and a self-sustaining backend architecture designed for scalability.

---

## Key Features

### For Customers

The customer interface provides an intuitive, kid-friendly experience centered around simplicity and real-time transparency. Users can tap a large ice cream button to request service, track their ice cream truck in real-time on an interactive map with candy-land styling, view order history with vendor ratings, and share the app with friends through built-in referral functionality.

### For Ice Cream Vendors

The vendor dashboard displays incoming customer requests with location details, enabling vendors to accept orders and navigate to customers. Vendors can track their earnings, manage their profile and ratings, and optimize their route between multiple requests. The platform provides automatic routing suggestions to maximize efficiency.

### Platform Features

The application includes real-time location tracking with GPS integration for accurate driver positioning, push notifications for order updates and new requests, a ratings and review system for community trust, and a self-sustaining backend that requires minimal manual intervention. The app features a beautiful candy-pink and cream color theme with kid-friendly graphics and smooth animations throughout.

---

## Technology Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | React Native 0.81, Expo 54, TypeScript 5.9 | Cross-platform mobile app (iOS/Android) |
| **Styling** | NativeWind 4 (Tailwind CSS), React Native Reanimated 4 | Responsive design and smooth animations |
| **Navigation** | Expo Router 6 | File-based routing and deep linking |
| **Backend** | Node.js, Express, tRPC 11.7 | API server and real-time communication |
| **Database** | MySQL, Drizzle ORM | Persistent data storage and queries |
| **Authentication** | OAuth 2.0, JWT tokens | Secure user authentication |
| **Location Services** | Expo Location, Browser Geolocation API | Real-time GPS tracking |
| **Notifications** | Expo Notifications | Push notifications for orders and updates |
| **State Management** | React Context + useReducer | Lightweight, no external dependencies |
| **Testing** | Vitest | Unit and integration tests |
| **Deployment** | EAS Build, Google Play Store | Production builds and distribution |

---

## Project Structure

```
the-ice-cream-man/
├── app/                          # Expo Router app directory
│   ├── _layout.tsx              # Root layout with providers
│   ├── role-select.tsx          # Role selection screen
│   ├── (customer)/              # Customer app stack
│   │   ├── _layout.tsx          # Customer tab navigation
│   │   ├── index.tsx            # Home screen with big ice cream button
│   │   ├── map.tsx              # Real-time tracking map
│   │   ├── history.tsx          # Order history
│   │   └── profile.tsx          # Customer profile
│   └── (driver)/                # Driver app stack
│       ├── _layout.tsx          # Driver tab navigation
│       ├── index.tsx            # Dashboard with requests
│       ├── map.tsx              # Navigation map
│       ├── earnings.tsx         # Earnings tracking
│       └── profile.tsx          # Driver profile
├── components/                   # Reusable React components
│   ├── screen-container.tsx     # SafeArea wrapper
│   ├── animated-truck.tsx       # Animated ice cream truck
│   ├── candy-map.tsx            # Candy-land map component
│   ├── ratings-prompt.tsx       # Ratings feedback modal
│   └── share-button.tsx         # App sharing functionality
├── lib/                          # Utility functions and contexts
│   ├── auth-context.tsx         # Authentication state
│   ├── location-context.tsx     # Location tracking
│   ├── request-context.tsx      # Ice cream request state
│   ├── theme-provider.tsx       # Theme switching
│   └── trpc.ts                  # tRPC client configuration
├── server/                       # Backend server code
│   ├── _core/                   # Core server utilities
│   │   ├── index.ts             # Server entry point
│   │   ├── trpc.ts              # tRPC setup
│   │   ├── context.ts           # Request context
│   │   ├── auth.ts              # Authentication logic
│   │   └── notification.ts      # Push notification service
│   ├── db.ts                    # Database queries
│   ├── routers.ts               # tRPC router definitions
│   └── routers-requests.ts      # Request-specific routes
├── drizzle/                      # Database schema and migrations
│   ├── schema.ts                # Table definitions
│   ├── relations.ts             # Table relationships
│   └── migrations/              # Database migration files
├── assets/                       # Static assets
│   └── images/                  # App icons and graphics
├── tests/                        # Test files
│   └── auth.logout.test.ts      # Authentication tests
├── app.config.ts                # Expo app configuration
├── eas.json                     # EAS Build configuration
├── tailwind.config.js           # Tailwind CSS configuration
├── theme.config.js              # App theme tokens
└── package.json                 # Dependencies and scripts
```

---

## Getting Started

### Prerequisites

Before you begin, ensure you have the following installed on your system:

- Node.js 18+ and npm/pnpm
- Expo CLI (`npm install -g expo-cli`)
- Git for version control
- Android Studio or Xcode (for native development)

### Installation

Clone the repository and install dependencies:

```bash
git clone https://github.com/Mgfromthe503/the-ice-cream-man.git
cd the-ice-cream-man
pnpm install
```

### Environment Setup

Create a `.env` file in the project root with the following variables:

```env
# Database
DATABASE_URL=mysql://user:password@localhost:3306/ice_cream_man

# API
API_URL=http://localhost:3000
EXPO_PUBLIC_API_URL=http://localhost:3000

# OAuth (if using external auth)
OAUTH_CLIENT_ID=your_client_id
OAUTH_CLIENT_SECRET=your_client_secret
```

### Running the App

Start the development server:

```bash
pnpm dev
```

This command starts both the Metro bundler and the backend server. The app will be available at:

- **Metro:** http://localhost:8081
- **API:** http://localhost:3000

### Testing on Device

Scan the QR code with Expo Go app on your phone to preview the app in real-time:

```bash
pnpm qr
```

---

## Development Workflow

### Adding New Features

1. Create a new branch for your feature: `git checkout -b feature/your-feature-name`
2. Make your changes and test thoroughly
3. Commit with descriptive messages: `git commit -m "feat: add new feature"`
4. Push to your fork and create a pull request

### Running Tests

Execute the test suite with Vitest:

```bash
pnpm test
```

For watch mode during development:

```bash
pnpm test:watch
```

### Building for Production

Generate a production build:

```bash
pnpm build
```

This creates optimized bundles for both web and native platforms.

---

## Deployment

### Google Play Store

The app is configured for automated publishing to Google Play Store via EAS Build:

```bash
# Build and submit to Google Play Store
eas build --platform android --auto-submit

# Or build without submitting
eas build --platform android
```

See `GOOGLE_PLAY_PUBLISHING_GUIDE.md` for detailed setup instructions.

### Backend Deployment

The backend is designed to run on Node.js platforms like Vercel, Heroku, or Google Cloud Run:

```bash
# Build production bundle
pnpm build

# Start production server
NODE_ENV=production pnpm start
```

---

## Architecture

### Frontend Architecture

The frontend follows a component-based architecture with clear separation of concerns. The app uses Expo Router for file-based routing, enabling automatic route generation from the file structure. State management relies on React Context for global state (authentication, location, requests) and local `useState` for component-level state.

The UI is built with NativeWind, which provides Tailwind CSS utilities for React Native, enabling rapid development and consistent styling across platforms. The theme system supports light and dark modes automatically, with all colors defined in `theme.config.js`.

### Backend Architecture

The backend implements a tRPC-based API for type-safe client-server communication. All routes are organized in separate router files and merged into a single root router. The database layer uses Drizzle ORM for type-safe queries and automatic migrations.

Authentication uses OAuth 2.0 with JWT tokens stored in secure cookies. The system tracks user roles (customer vs. driver) and enforces role-based access control on protected routes.

### Real-Time Features

Location tracking uses a polling mechanism where drivers send their location every 5 seconds. The frontend fetches updated driver locations at the same interval, creating a smooth real-time experience without requiring WebSocket infrastructure.

Push notifications are handled through Expo Notifications, which integrates with native notification systems on iOS and Android.

---

## Database Schema

### Users Table

Stores authentication and profile information for both customers and drivers, including OAuth identifiers, email, name, and role designation.

### Requests Table

Records all ice cream requests with customer location, status (pending, accepted, completed, cancelled), and associated driver information once accepted.

### Drivers Table

Maintains driver-specific information including vehicle details, current location, earnings, and ratings from customers.

### Ratings Table

Stores customer ratings and feedback for drivers, enabling reputation building and quality assurance.

### Location History Table

Tracks driver location history for analytics and route optimization purposes.

---

## API Endpoints

### Authentication

The authentication endpoints handle user registration, login, and logout flows:

- `POST /auth/register` - Register new user (customer or driver)
- `POST /auth/login` - Login with email and password
- `POST /auth/logout` - Logout current user
- `GET /auth/me` - Get current user profile

### Requests (Customer)

Customer-facing endpoints for managing ice cream requests:

- `POST /requests/create` - Create new ice cream request
- `GET /requests/active` - Get current active request
- `GET /requests/history` - Get request history
- `POST /requests/cancel` - Cancel pending request
- `POST /requests/rate` - Rate completed request

### Requests (Driver)

Driver-facing endpoints for managing incoming requests:

- `GET /requests/incoming` - Get nearby incoming requests
- `POST /requests/accept` - Accept a request
- `POST /requests/decline` - Decline a request
- `POST /requests/complete` - Mark request as complete
- `GET /requests/active` - Get current active delivery

### Location

Location tracking endpoints:

- `POST /location/update` - Update driver location
- `GET /location/driver/:driverId` - Get driver current location
- `GET /location/history/:driverId` - Get driver location history

### Profile

User profile management:

- `GET /profile` - Get user profile
- `PUT /profile` - Update user profile
- `GET /profile/earnings` - Get driver earnings (driver only)
- `GET /profile/ratings` - Get user ratings

---

## Performance Optimization

### Frontend Optimization

The app uses code splitting through Expo Router to load only necessary code for each screen. Images are optimized with Expo Image component, which handles caching and lazy loading automatically. The Tailwind CSS configuration uses tree-shaking to include only used styles in production builds.

### Backend Optimization

Database queries use indexes on frequently searched columns (user_id, location, status). The API implements pagination for list endpoints to prevent loading large datasets. Response caching is implemented for static data like driver profiles.

### Location Tracking

Instead of continuous WebSocket connections, the app uses efficient polling with 5-second intervals. Location updates are batched to reduce database writes. The map only re-renders when location changes exceed a 10-meter threshold.

---

## Security

### Authentication

All user authentication uses OAuth 2.0 with JWT tokens. Tokens are stored in secure, HTTP-only cookies and automatically refreshed. Passwords are hashed using bcrypt before storage.

### Data Protection

The database connection uses SSL encryption. All API endpoints validate input data and sanitize against injection attacks. Sensitive endpoints require authentication and role-based authorization.

### Privacy

The app only requests location permission when needed and explains why. Users can disable location sharing at any time. Location data is encrypted in transit and at rest.

---

## Testing

The project includes comprehensive tests for critical functionality:

### Authentication Tests

Tests verify user registration, login, logout, and token refresh flows work correctly.

### API Tests

Tests ensure all endpoints return correct data, handle errors properly, and enforce authorization.

### Component Tests

Tests verify UI components render correctly and respond to user interactions.

Run all tests with `pnpm test` or watch mode with `pnpm test:watch`.

---

## Contributing

Contributions are welcome! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Make your changes and add tests
4. Commit with clear messages: `git commit -m "feat: add feature"`
5. Push to your fork and create a pull request

Please ensure all tests pass and code follows the project's style guidelines.

---

## Roadmap

### Version 1.1 (Q3 2026)
- Push notifications for order updates
- In-app messaging between customers and drivers
- Advanced filtering for drivers (ice cream type, ratings)
- Seasonal promotions and discounts

### Version 1.2 (Q4 2026)
- Payment integration (Stripe, Apple Pay, Google Pay)
- Driver earnings dashboard with analytics
- Customer subscription for recurring orders
- Admin dashboard for platform management

### Version 2.0 (2027)
- iOS app store launch
- Web dashboard for vendors
- Advanced routing optimization
- Loyalty rewards program
- Integration with ice cream shops

---

## License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## Support

For questions, bug reports, or feature requests, please open an issue on GitHub or contact the developer:

- **Developer:** Mindy Gaines
- **Email:** mindy.gaines1@gmail.com
- **GitHub:** [@Mgfromthe503](https://github.com/Mgfromthe503)

---

## Acknowledgments

This project was built with Expo, React Native, and TypeScript. Special thanks to the open-source community for the amazing tools and libraries that made this possible.

**Built with ❤️ by Mindy Gaines**

---

## Quick Links

- [Google Play Store](https://play.google.com/store/apps/details?id=space.manus.the.ice.cream.man)
- [Expo Documentation](https://docs.expo.dev)
- [React Native Documentation](https://reactnative.dev)
- [tRPC Documentation](https://trpc.io)
- [Publishing Guide](GOOGLE_PLAY_PUBLISHING_GUIDE.md)
- [Marketing Strategy](MARKETING_STRATEGY.md)
