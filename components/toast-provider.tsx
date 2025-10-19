"use client";

import { Toaster } from "react-hot-toast";

export function ToastProvider() {
	return (
		<Toaster
			position="top-right"
			toastOptions={{
				duration: 3000,
				style: {
					background: "#fff",
					color: "#1e293b",
					border: "1px solid #e2e8f0",
					padding: "16px",
					borderRadius: "12px",
					boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
				},
				success: {
					iconTheme: {
						primary: "#4A8B8B",
						secondary: "#fff",
					},
					style: {
						border: "1px solid #4A8B8B",
					},
				},
				error: {
					iconTheme: {
						primary: "#ef4444",
						secondary: "#fff",
					},
				},
			}}
		/>
	);
}
