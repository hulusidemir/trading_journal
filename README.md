# 📈 Crypto Trading Journal

A powerful, real-time trading journal application built with **Next.js 16**, **Prisma**, and **Bybit API**. This tool helps traders track their active positions, monitor open orders, and analyze historical performance with integrated note-taking capabilities.

## 🚀 Features

### 📊 Real-Time Dashboard
- **Live Position Tracking**: Automatically syncs open positions from Bybit (Linear/USDT).
- **Financial Summaries**: Real-time calculation of Total Long, Total Short, and Grand Total exposure.
- **Currency Conversion**: Toggle between USD ($) and TRY (₺) with live exchange rates.
- **Real-Time Metrics**: View Entry Price, Mark Price, Liq. Price, Margin (IM/MM), and Unrealized P&L/ROI.
- **Order Management**: Monitor active Limit, Market, and Conditional orders.
- **Manual Sync**: "Refresh" button to instantly fetch the latest data from the exchange.

### 📝 Journaling & History
- **Smart Note Inheritance**: Notes added to an Order are automatically carried over to the Position when filled, and preserved in History when closed.
- **Closed Positions History**: Automatically detects closed trades and saves them to the database.
- **History Start Date**: Closed position history is recorded starting from **January 1, 2026, 12:00 UTC**. Data prior to this date is ignored. (You can change that on services.ts)
- **Performance Analysis**: Tracks Exit Price, Realized P&L, and Close Date.
- **Pagination**: Easy navigation through large datasets with built-in pagination.

### 🌍 Localization & UI
- **Multi-language Support**: Switch instantly between English (🇬🇧) and Turkish (🇹🇷).
- **Date Formatting**: Clear, concise date display (DD/MM) for all entries.
- **Responsive Design**: Optimized for various screen sizes.

### 🛠 Technical Highlights
- **Optimized Sync**: Data synchronization is handled via Server Actions for better performance.
- **Data Persistence**: SQLite database ensures your journal data (notes, history) is never lost, even if the exchange clears old data.
- **Modern UI**: Clean, dark-mode interface built with Tailwind CSS.

## 🛠️ Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Database**: [SQLite](https://www.sqlite.org/) (Default) / [PostgreSQL](https://www.postgresql.org/) (Production) with [Prisma ORM](https://www.prisma.io/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Integration**: [bybit-api](https://github.com/tiagosiebler/bybit-api)

## 🏁 Getting Started

### Prerequisites
- Node.js 18+
- A Bybit Account (API Key & Secret required)

### Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/hulusidemir/trading_journal.git
    cd trading_journal
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Environment Setup**
    Create a `.env` file in the root directory:
    ```env
    DATABASE_URL="file:./dev.db"
    BYBIT_API_KEY="your_api_key_here"
    BYBIT_API_SECRET="your_api_secret_here"
    ```

4.  **Database Setup (Default: SQLite)**
    Initialize the SQLite database:
    ```bash
    npx prisma migrate dev --name init
    ```

5.  **Run the Application**
    ```bash
    npm run dev
    ```
    Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🚀 Deployment & Database Switching

This project supports both **SQLite** (for local development) and **PostgreSQL** (for production/Vercel).

### Switching Databases
You can easily switch between databases using the included scripts:

- **Switch to PostgreSQL**:
  ```bash
  npm run db:postgres
  ```
- **Switch to SQLite**:
  ```bash
  npm run db:sqlite
  ```

### Deploying to Vercel (Free)

1.  **Push to GitHub**: Make sure your project is on GitHub.
2.  **Import to Vercel**: Go to Vercel and import your repository.
3.  **Add Database**:
    - In Vercel, go to the **Storage** tab.
    - Create a new **Postgres** database (Neon is recommended).
    - Connect it to your project. Vercel will automatically add the `DATABASE_URL` environment variable.
4.  **Deploy**:
    - The project is configured to **automatically switch to PostgreSQL** during the Vercel build process.
    - You don't need to manually change any files. Just push and deploy!

> **Note**: When deploying, the build script runs `node scripts/switch-db.js postgres` automatically.

## 🔄 How It Works

1.  **Syncing**: Click the "Refresh" button in the header to fetch the latest data from Bybit.
2.  **Tracking**: 
    - New positions are added to the "Open Positions" table.
    - If a position is no longer found on Bybit, the app checks if it was closed.
    - If closed, it fetches the P&L data and moves it to the "Closed Positions History" table.
3.  **Journaling**: 
    - Add notes to your **Open Orders** (Entry Note).
    - When the order fills, the note automatically moves to the **Open Position** (Read-only).
    - When you close the trade, the note is archived with the **Closed Position**.
    - You can edit the note in **Closed Positions** to add closing remarks or lessons learned.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## �� License

This project is open source and available under the [MIT License](LICENSE).
