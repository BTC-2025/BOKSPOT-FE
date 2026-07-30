import type { Metadata } from 'next';
import { ThemeManager } from '../components/ThemeManager';
import ClientLayout from '../components/ClientLayout';
import './globals.css';

export const metadata: Metadata = {
  title: 'Beta — Book Everything',
  description: 'Beta by Beta Softnet — the one platform to book every service in the world.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet"/>
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet"/>
        <script dangerouslySetInnerHTML={{ __html: `
          (function() {
            try {
              var uiStorage = localStorage.getItem('ui-storage');
              var theme = 'system';
              if (uiStorage) {
                var parsed = JSON.parse(uiStorage);
                if (parsed && parsed.state && parsed.state.theme) {
                  theme = parsed.state.theme;
                }
              }
              var root = document.documentElement;
              if (theme === 'light' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: light)').matches)) {
                root.classList.add('light');
                root.classList.remove('dark');
                root.setAttribute('data-theme', 'light');
              } else {
                root.classList.remove('light');
                root.classList.add('dark');
                root.setAttribute('data-theme', 'dark');
              }
            } catch (e) {}
          })();
        ` }} />
      </head>
      <body className="selection:bg-primary/30">
        <ThemeManager />
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}

