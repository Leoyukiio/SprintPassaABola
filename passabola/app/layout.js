import "./globals.css";
import Navbar from "../components/Navbar";

export const metadata = {
  title: "Passa Bola",
  description: "Plataforma de campeonatos",
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body>
        <Navbar />
        <main>{children}</main>
      </body>
    </html>
  );
}
