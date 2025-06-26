# Restaurant Website with Honey Jars E-commerce

## Overview

This is a full-stack web application built for a restaurant that also sells honey jars online. The application features a modern React frontend with PayPal payment integration and an Express.js backend with PostgreSQL database support. The project is structured as a monorepo with shared TypeScript schemas and uses modern development tools for a streamlined development experience.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript
- **Build Tool**: Vite for fast development and optimized production builds
- **UI Library**: Radix UI components with shadcn/ui styling system
- **Styling**: Tailwind CSS with CSS variables for theming
- **State Management**: React hooks with TanStack Query for server state
- **Payment Processing**: PayPal integration for e-commerce transactions

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **Development Server**: TSX for TypeScript execution in development
- **Production Build**: ESBuild for fast bundling

### Database Architecture
- **Database**: PostgreSQL (configured for Neon serverless)
- **ORM**: Drizzle ORM with type-safe queries
- **Schema Management**: Drizzle Kit for migrations
- **Validation**: Zod schemas integrated with Drizzle for runtime validation

## Key Components

### Shared Schema (`shared/schema.ts`)
- Centralized database schema definitions
- Type-safe user model with authentication fields
- Zod validation schemas for data integrity

### Storage Layer (`server/storage.ts`)
- Interface-based storage abstraction
- In-memory storage implementation for development
- Designed for easy migration to PostgreSQL production database
- CRUD operations for user management

### Cart and E-commerce
- Shopping cart functionality with add/remove/update operations
- PayPal integration for secure payment processing
- Real-time cart state management
- Product catalog for honey jars

### Development Environment
- Hot module replacement with Vite
- Integrated error overlay for development
- Cartographer plugin for Replit environment
- Automatic server restart on file changes

## Data Flow

1. **Client Requests**: Frontend makes API calls to Express backend
2. **Route Handling**: Express routes process requests and interact with storage layer
3. **Data Validation**: Zod schemas validate incoming data
4. **Storage Operations**: Storage interface handles database operations
5. **Response Formatting**: Structured JSON responses sent back to client
6. **State Updates**: Frontend updates UI state based on server responses

## External Dependencies

### Payment Processing
- PayPal SDK for secure payment transactions
- Client-side PayPal buttons integration
- Environment variable configuration for API keys

### Database Services
- Neon PostgreSQL for production database hosting
- Connection pooling and serverless architecture
- Environment-based configuration

### UI Components
- Radix UI primitives for accessible components
- Lucide React for consistent iconography
- shadcn/ui component system for rapid development

## Deployment Strategy

### Development
- Replit-hosted development environment
- Hot reloading for both frontend and backend
- PostgreSQL module for database services
- Port 5000 for local development server

### Production
- Autoscale deployment target for optimal performance
- Vite build process for optimized frontend assets
- ESBuild bundling for efficient server code
- Static file serving for production assets

### Build Process
1. Frontend build with Vite (outputs to `dist/public`)
2. Backend bundling with ESBuild (outputs to `dist`)
3. Static asset optimization and compression
4. Environment variable injection for configuration

## Changelog

```
Changelog:
- June 26, 2025. Initial setup
```

## User Preferences

```
Preferred communication style: Simple, everyday language.
```