# COC Room Booking System

A modern room booking web application built with **Next.js**. The system allows users to view room availability, book rooms, and manage reservations efficiently.

## 🚀 Features

- **User Authentication**: Secure login and registration using JWT (`jose`) and password hashing (`bcryptjs`).
- **Room Management**: Real-time room availability and booking system.
- **Database**: Powered by **Prisma ORM** for structured and reliable data management.
- **Firebase Integration**: Utilizes Firebase and Firebase Admin SDK for backend services and storage.
- **Email Notifications**: Automated booking confirmations and updates via `nodemailer`.
- **Export Data**: Support for exporting booking reports and data to Excel (`exceljs`, `file-saver`).
- **Modern UI**: Built with Next.js 16 and React 19 for a fast and responsive user experience.

## 🛠️ Tech Stack

- **Framework**: [Next.js](https://nextjs.org/)
- **Frontend**: React, React Hot Toast (for notifications)
- **Backend/Database**: Prisma ORM, Firebase
- **Authentication**: JWT (`jose`), `bcryptjs`
- **Utilities**: Nodemailer, ExcelJS

## 📦 Getting Started

### Prerequisites

Make sure you have Node.js installed. You also need to set up your `.env` file with the necessary environment variables for Prisma, Firebase, and SMTP (Nodemailer).

### Installation

1. Clone the repository:
   ```bash
   git clone <your-github-repo-url>
   cd COC_Room69
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up the database:
   ```bash
   npx prisma generate
   npx prisma db push
   # Or run migrations if you have them: npx prisma migrate dev
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 📄 License

This project is licensed under the MIT License.
