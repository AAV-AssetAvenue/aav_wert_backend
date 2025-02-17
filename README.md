# Asset Avenue Service

A NestJS-based backend service that handles user authentication, order management, and Solana blockchain interactions for the Asset Avenue platform.

## Features

- User authentication with JWT tokens
- Wallet-based authentication system
- Order management with Wert integration
- Solana blockchain integration
- Swagger API documentation
- Health check endpoints
- MongoDB integration
- Winston logging

## Prerequisites

- Node.js (v16 or higher)
- MongoDB
- Solana CLI tools
- Redis (for caching)

## Environment Variables

Create a `.env` file in the root directory with the following variables:

### Server

```
PORT=3039
ENVIRONMENT=development
```

### Database

```
DATABASE_URL=mongodb://localhost:27017/asset-avenue
DATABASE_NAME=asset-avenue
```

### JWT

```
JWT_SECRET=your-jwt-secret
REFRESH_TOKEN_SECRET=your-refresh-token-secret
JWT_EXPIRES_IN=7d
REFRESH_TOKEN_EXPIRES_IN=14d
```

### Solana

```
SOLANA_RPC_URL=https://api.devnet.solana.com
SOLANA_PROGRAM_ID=your-program-id
WALLET_PRIVATE_KEY=your-wallet-private-key
```

## Installation

```bash
# Install dependencies
npm install
```

## Running the app

```bash
# Development
npm run start:dev

# Debug mode
npm run start:debug

# Production mode
npm run start:prod
```

## Building the app

```bash
# Build
npm run build

# Start built version
npm run start
```

## API Documentation

Once the application is running, you can access the Swagger API documentation at:

- Local: http://localhost:3039/docs
- Staging: https://staging.yourapi.com/docs
- Production: https://production.yourapi.com/docs

## Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

## Key Points

1. **Authentication System**:

   - Uses wallet-based authentication
   - Implements JWT with refresh token mechanism
   - Role-based access control (User/Admin)

2. **Order Management**:

   - Integrates with Wert for payment processing
   - Handles order status updates via webhooks
   - Manages token transfers on Solana blockchain

3. **Solana Integration**:

   - Handles token transfers
   - Manages presale contract interactions
   - Supports wallet operations

4. **Security**:

   - Implements Helmet for HTTP security
   - Uses environment-based configuration
   - Implements request validation using Zod

5. **Monitoring**:
   - Health check endpoints
   - Winston logging system
   - Request/Response logging middleware

## Project Structure

The project follows a modular architecture with the following main components:

- `src/auth`: Authentication module
- `src/order`: Order management module
- `src/health`: Health check module
- `src/helpers`: Utility functions
- `src/mongoose`: Database schemas
- `src/config`: Configuration management

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

## License

This project is licensed under the UNLICENSED license.
