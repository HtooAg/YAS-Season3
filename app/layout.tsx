import type React from "react";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { GameProvider } from "@/lib/game-context";
import { ToastProvider } from "@/components/toast-provider";
import { ResetNotification } from "@/components/reset-notification";
import "./globals.css";

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
	title: "YAS Harvest",
	description: "A strategic farming game for teams",
	generator: "John",
	icons: {
		icon: "/YAS-logo.png",
		apple: "/YAS-logo.png",
	},
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en">
			<head>
				<link rel="icon" href="/YAS-logo.png" type="image/png" />
				<link rel="apple-touch-icon" href="/YAS-logo.png" />
			</head>
			<body className={`font-sans antialiased`}>
				<GameProvider>
					{children}
					<ToastProvider />
					<ResetNotification />
				</GameProvider>
				<Analytics debug={false} />
			</body>
		</html>
	);
}
