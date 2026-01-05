# Use Bun as the base image
FROM oven/bun:latest

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json bun.lock ./

# Install dependencies
RUN bun install --frozen-lockfile

# Copy source code
COPY . .

# Set environment variables (can be overridden at runtime)
ENV POLL_INTERVAL_MS=1000

# Run the feed-real-time script
CMD ["bun", "run", "feed-real-time"]

