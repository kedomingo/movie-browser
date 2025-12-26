# Docker Setup

This project includes Docker configuration to run the application in containers with nginx as a reverse proxy.

## Prerequisites

- Docker
- Docker Compose

## Setup

1. Make sure you have a `.env.local` file with your TMDB API key:
   ```
   TMDB_API_KEY=your_api_key_here
   ID_SECRET=...
   ```

2. Build and start the containers:
   ```bash
   docker-compose up -d --build
   ```

3. The application will be available at `http://localhost`

## Commands

- **Start containers**: `docker-compose up -d`
- **Stop containers**: `docker-compose down`
- **View logs**: `docker-compose logs -f`
- **Rebuild**: `docker-compose up -d --build`
- **View Next.js logs**: `docker-compose logs -f nextjs`
- **View nginx logs**: `docker-compose logs -f nginx`

## Architecture

- **nextjs**: Runs the Next.js application on port 3000 (internal)
- **nginx**: Reverse proxy that serves the app on port 80 (external)

## Environment Variables

The `.env.local` file is automatically loaded by the Next.js container. Make sure it contains:
- `TMDB_API_KEY`: Your TMDB API key

## Production Considerations

For production deployment:
1. Use environment-specific `.env` files
2. Configure proper SSL/TLS certificates for nginx
3. Set up proper domain names in nginx configuration
4. Consider using Docker secrets for sensitive data
5. Set up proper logging and monitoring

