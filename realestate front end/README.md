# Real Estate Marketplace

A comprehensive real estate marketplace web application built with modern React technologies, enabling users to browse, search, and manage properties with advanced features for buyers, sellers, and agents.

## 🏡 About the Application

This real estate marketplace is a full-featured platform that connects buyers, sellers, and real estate agents. The application provides an intuitive interface for property discovery, detailed property information, agent management tools, and user profile customization.

### Key Features

- **🔍 Property Search & Discovery** - Advanced search with filters, map view, and sorting options
- **📱 Responsive Design** - Mobile-first design that works seamlessly across all devices
- **🏠 Property Details** - Comprehensive property information with image galleries, virtual tours, and mortgage calculators
- **👨‍💼 Agent Dashboard** - Professional tools for managing listings, leads, and performance analytics
- **💾 User Profiles** - Customizable profiles with saved searches, favorite properties, and activity tracking
- **📊 Analytics & Reporting** - Performance metrics and data visualization for agents
- **🗺️ Interactive Maps** - Property location mapping with neighborhood information
- **💰 Mortgage Calculator** - Built-in financial tools for property affordability analysis
- **📞 Contact Management** - Integrated communication tools between buyers, sellers, and agents

## 🚀 Technologies Used

### Frontend Framework
- **React 18.2.0** - Modern React with functional components and hooks
- **Vite 5.0.0** - Lightning-fast build tool and development server
- **JavaScript** - Primary development language

### UI & Styling
- **Tailwind CSS 3.4.6** - Utility-first CSS framework with advanced plugins:
  - Forms plugin for consistent form styling
  - Typography plugin for enhanced text styling
  - Aspect ratio plugin for responsive media
  - Container queries for component-specific responsive design
  - Elevation plugin for material design shadows
  - Fluid type plugin for responsive typography
  - Animation utilities for smooth transitions

### State Management & Routing
- **Redux Toolkit 2.6.1** - Efficient state management with simplified Redux setup
- **React Router DOM 6.0.2** - Declarative routing for single-page application navigation
- **React Router Hash Link 2.4.3** - Smooth scrolling and anchor linking

### Data Visualization & Charts
- **Recharts 2.15.2** - Composable charting library for React
- **D3.js 7.9.0** - Powerful data visualization library for custom charts and graphs

### Form Management & Validation
- **React Hook Form 7.55.0** - Performant form library with minimal re-renders
- **Validation** - Built-in form validation and error handling

### Icons & Assets
- **Lucide React 0.484.0** - Beautiful, consistent icon library
- **Framer Motion 10.16.4** - Smooth animations and micro-interactions

### HTTP Client & API
- **Axios 1.8.4** - Promise-based HTTP client for API communications

### Utilities
- **Date-fns 4.1.0** - Modern date utility library for formatting and manipulation
- **React Helmet 6.1.0** - Document head management for SEO optimization
- **Dotenv 16.0.1** - Environment variable management

## 📋 Prerequisites

Before running the application, ensure you have the following installed:

- **Node.js** (v16.0.0 or higher)
- **npm** (v8.0.0 or higher) or **yarn** (v1.22.0 or higher)

## 🛠️ Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd realestate_marketplace
   ```

2. **Install dependencies:**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Set up environment variables:**
   ```bash
   cp .env.example .env
   # Edit .env file with your configuration
   ```

4. **Start the development server:**
   ```bash
   npm start
   # or
   yarn start
   ```

   The application will be available at `http://localhost:3000`

## 🏗️ Project Structure

```
realestate_marketplace/
├── public/                     # Static assets
│   ├── favicon.ico            # App favicon
│   ├── manifest.json          # PWA manifest
│   └── robots.txt             # SEO robots file
├── src/
│   ├── components/            # Reusable UI components
│   │   ├── ui/               # Common UI elements
│   │   │   ├── Header.jsx    # Application header
│   │   │   ├── Button.jsx    # Custom button component
│   │   │   ├── Input.jsx     # Form input component
│   │   │   └── SearchInterface.jsx # Search functionality
│   │   ├── AppIcon.jsx       # Icon wrapper component
│   │   ├── AppImage.jsx      # Image wrapper component
│   │   ├── ErrorBoundary.jsx # Error handling component
│   │   └── ScrollToTop.jsx   # Scroll utility component
│   ├── pages/                # Page components
│   │   ├── homepage/         # Landing page
│   │   ├── property-listings/ # Property search results
│   │   ├── property-details/ # Individual property details
│   │   ├── agent-dashboard/  # Agent management interface
│   │   └── user-profile-settings/ # User account management
│   ├── styles/               # Global styles
│   │   ├── index.css         # Custom CSS
│   │   └── tailwind.css      # Tailwind imports
│   ├── App.jsx               # Main application component
│   ├── Routes.jsx            # Application routing
│   └── index.jsx             # Application entry point
├── .env                      # Environment variables
├── index.html                # HTML template
├── package.json              # Project dependencies
├── tailwind.config.js        # Tailwind configuration
├── vite.config.js            # Vite configuration
└── README.md                 # Project documentation
```

## 📚 Application Pages

### 🏠 Homepage
- Hero section with property search
- Featured properties showcase
- Quick statistics and market insights
- Agent spotlight section

### 🔍 Property Listings
- Advanced search and filtering
- List and map view options
- Property sorting capabilities
- Infinite scroll for large datasets

### 🏡 Property Details
- Comprehensive property information
- High-resolution image galleries
- Virtual tour integration
- Mortgage calculator
- Agent contact forms
- Similar property recommendations

### 👨‍💼 Agent Dashboard
- Performance metrics and analytics
- Active listings management
- Lead management system
- Upcoming showings calendar
- Quick listing creation tools

### 👤 User Profile & Settings
- Profile information management
- Saved searches and favorite properties
- Activity history tracking
- Privacy controls
- Payment method management

## 🎨 Design System

The application uses a comprehensive design system built with Tailwind CSS:

- **Colors**: Custom color palette with semantic naming
- **Typography**: Fluid typography system with responsive scaling
- **Spacing**: Consistent spacing scale throughout the application
- **Elevation**: Material design inspired shadow system
- **Animations**: Smooth micro-interactions and transitions

## 📱 Responsive Design

The application is fully responsive and optimized for:
- **Mobile devices** (320px and up)
- **Tablets** (768px and up)
- **Desktop computers** (1024px and up)
- **Large screens** (1440px and up)

## 🔧 Available Scripts

- `npm start` - Start development server
- `npm run build` - Build for production
- `npm run serve` - Preview production build
- `npm run lint` - Run linting checks
- `npm test` - Run test suite

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

This creates an optimized build in the `dist` folder, ready for deployment.

### Environment Variables
Create a `.env` file in the root directory:
```
VITE_API_URL=your_api_url
VITE_MAP_API_KEY=your_map_api_key
VITE_ANALYTICS_ID=your_analytics_id
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- **React Team** - For the amazing React framework
- **Tailwind CSS** - For the utility-first CSS framework
- **Vite** - For the lightning-fast build tool
- **Lucide** - For the beautiful icon library
- **Unsplash & Pexels** - For the stunning property images

## 📞 Support

For support, email support@realestatemarketplace.com or create an issue in the repository.

---

Built with ❤️ using modern web technologies for the real estate industry.