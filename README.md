# 📈 Crypto Trading Journal

A powerful, real-time trading journal application built with **Next.js 16**, **Prisma**, and **Bybit API**. This tool helps traders track their active positions, monitor open orders, and analyze historical performance with integrated note-taking capabilities.

## 🚀 Features

### 📊 Real-Time Dashboard
- **Live Position Tracking**: Automatically syncs open positions from Bybit (Linear/USDT).
- **Real-Time Metrics**: View Entry Price, Mark Price, Liq. Price, Margin (IM/MM), and Unrealized P&L/ROI.
- **Order Management**: Monitor active Limit, Market, and Conditional orders.

### 📝 Journaling & History
- **Closed Positions History**: Automatically detects closed trades and saves them to the database.
- **Performance Analysis**: Tracks Exit Price, Realized P&L, and Close Date.
- **Note Taking**: Add custom notes to both open and closed positions to review your strategy later.
- **Order History**: Keep a record of all filled and cancelled orders.

### 🛠 Technical Highlights
- **Auto-Sync**: Intelligent background synchronization with Bybit API.
- **Data Persistence**: SQLite database ensures your journal data (notes, history) is never lost, even if the exchange clears old data.
- **Modern UI**: Clean, dark-mode interface built with Tailwind CSS.

## 🛠️ Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Database**: [SQLite](https://www.sqlite.org/) with [Prisma ORM](https://www.prisma.io/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Integration**: [bybit-api](https://github.com/tiagosiebler/bybit-api)

## 🏁 Getting Started

### Prerequisites
- Node.js 18+
- A Bybit Account (API Key & Secret required)

### Installation

1.  **Clone the repository**
    ```bash
    git clone <repository-url>
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

4.  **Database Setup**
    Initialize the SQLite database:
    ```bash
    npx prisma migrate dev --name init
    ```

5.  **Run the Application**
    ```bash
    npm run dev
    ```
    Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🔄 How It Works

1.  **Syncing**: When you load the page, the app fetches the latest data from Bybit.
2.  **Tracking**: 
    - New positions are added to the "Open Positions" table.
    - If a position is no longer found on Bybit, the app checks if it was closed.
    - If closed, it fetches the P&L data and moves it to the "Closed Positions History" table.
3.  **Journaling**: Click the "Edit" (Pencil) icon on any row to add your thoughts, strategy notes, or lessons learned.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## �� License

This project is open source and available under the [MIT License](LICENSE).
