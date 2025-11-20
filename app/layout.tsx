import "../globals.css";
import type { Metadata } from "next";
import { ChefIcon } from "./components/Icons";

export const metadata: Metadata = {
  title: "Pantry Pal",
  description: "Transform your ingredients into meals",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen">
        <header className="border-b bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/70 mx-auto">
          <div className="container-max flex h-16 items-center justify-between w-[80%] mx-auto">
            <div className="flex items-center gap-2 text-lg font-semibold">
              <span className="flex items-center">
                <ChefIcon className="h-6 w-6 text-orange-600" />
                <span className="ml-2 font-semibold">Pantry Pal</span>
              </span>
            </div>
            <nav className="flex items-center gap-6 text-sm">
              <a className="font-semibold text-emerald-700/70" href="#">
                Home
              </a>
              <a className="text-gray-600 hover:text-gray-900 font-semibold" href="/recipes">
                Recipes
              </a>
            </nav>
          </div>
        </header>
        {children}
      </body>
    </html>
  );
}
