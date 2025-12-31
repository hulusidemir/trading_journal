# Trading Journal

This is a Trading Journal application built with Next.js, Prisma, and SQLite.

## Getting Started

1.  Install dependencies:
    ```bash
    npm install
    ```

2.  **Configuration**:
    Rename `.env` file and add your Bybit API credentials:
    ```env
    DATABASE_URL="file:./dev.db"
    BYBIT_API_KEY="your_api_key"
    BYBIT_API_SECRET="your_api_secret"
    ```

3.  Initialize the database:
    ```bash
    npx prisma migrate dev --name init
    ```

4.  Seed the database (optional, for mock data):
    ```bash
    npx ts-node prisma/seed.ts
    ```

5.  Run the development server:
    ```bash
    npm run dev
    ```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Features

-   **Positions**: View open positions with details like Entry Price, Mark Price, P&L, etc.
-   **Orders**: View open orders (Limit, Trigger, Reduce Only).
-   **Journaling**: Add notes to any position or order directly from the table.

## Tech Stack

-   Next.js (App Router)
-   TypeScript
-   Tailwind CSS
-   Prisma (SQLite)
