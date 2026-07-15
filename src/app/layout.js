import { Toaster } from 'react-hot-toast';
import "./globals.css";
import { ThemeProvider } from "../providers/ThemeProvider";
import { LanguageProvider } from "../providers/LanguageProvider";
import Navbar from "../components/Navbar";

export const metadata = {
  title: "COC Meeting Room",
  description: "จองห้องประชุม วิทยาลัยการคอมพิวเตอร์ มหาวิทยาลัยสงขลานครินทร์ วิทยาเขตภูเก็ต (College of Computing, PSU Phuket)",
  keywords: "จองห้องประชุม, COC, PSU, Phuket, Meeting Room",
  icons: {
    icon: "/College-of-Computing.png",
    shortcut: "/College-of-Computing.png",
    apple: "/College-of-Computing.png",
  },
  openGraph: {
    title: "COC Meeting Room - ระบบจองห้องประชุม",
    description: "ระบบจองห้องประชุม วิทยาลัยการคอมพิวเตอร์ มหาวิทยาลัยสงขลานครินทร์",
    url: "https://coc-room.psu.ac.th", // Placeholder URL
    siteName: "COC Meeting Room",
    images: [
      {
        url: "/College-of-Computing.png", 
        width: 1200,
        height: 630,
        alt: "COC Meeting Room Preview",
      },
    ],
    locale: "th_TH",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "COC Meeting Room",
    description: "ระบบจองห้องประชุม วิทยาลัยการคอมพิวเตอร์",
    images: ["/College-of-Computing.png"],
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <LanguageProvider>
          <ThemeProvider>
            <Navbar />
            <main>{children}</main>
            <Toaster 
              position="bottom-right" 
              toastOptions={{
                duration: 4000,
                style: {
                  background: 'var(--bg-secondary)',
                  color: 'var(--text-main)',
                  border: '1px solid var(--border)',
                  boxShadow: 'var(--card-shadow)',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.95rem',
                  fontWeight: '500'
                },
                success: {
                  iconTheme: {
                    primary: 'var(--success)',
                    secondary: 'white',
                  },
                },
                error: {
                  iconTheme: {
                    primary: 'var(--danger)',
                    secondary: 'white',
                  },
                },
              }} 
            />
          </ThemeProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
