"use client";

import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { RotateCcw, Copy, Check, LogOut, Menu, X } from "lucide-react";
import { useState, useEffect } from "react";
import { useGame } from "@/lib/game-context";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { AlertTriangle } from "lucide-react";
import toast from "react-hot-toast";

export function Navbar() {
	const pathname = usePathname();
	const router = useRouter();
	const { resetGame } = useGame();
	const [showResetDialog, setShowResetDialog] = useState(false);
	const [copied, setCopied] = useState(false);
	const [isDrawerOpen, setIsDrawerOpen] = useState(false);

	const isAdmin = pathname === "/admin";
	const isPlayer = pathname === "/player";

	// Close drawer on route change
	useEffect(() => {
		setIsDrawerOpen(false);
	}, [pathname]);

	// Prevent body scroll when drawer is open
	useEffect(() => {
		if (isDrawerOpen) {
			document.body.style.overflow = "hidden";
		} else {
			document.body.style.overflow = "unset";
		}
		return () => {
			document.body.style.overflow = "unset";
		};
	}, [isDrawerOpen]);

	const handleCopyLink = () => {
		const playerUrl = `${window.location.origin}/player`;
		navigator.clipboard.writeText(playerUrl);
		setCopied(true);
		toast.success("Player link copied to clipboard!");
		setTimeout(() => setCopied(false), 2000);
		setIsDrawerOpen(false);
	};

	const handleReset = () => {
		resetGame();
		setShowResetDialog(false);
		setIsDrawerOpen(false);
	};

	const handleLogout = () => {
		sessionStorage.removeItem("admin-authenticated");
		sessionStorage.removeItem("admin-email");
		toast.success("Logged out successfully");
		router.push("/admin/login");
		setIsDrawerOpen(false);
	};

	return (
		<>
			<nav className="bg-white border-b border-slate-200 shadow-sm relative z-40">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="flex items-center justify-between h-16">
						{/* Logo and Title */}
						<div className="flex items-center gap-3">
							<Image
								src="/YAS-logo.png"
								alt="YAS Harvest"
								width={50}
								height={50}
								className="rounded-lg"
							/>
							<div>
								<h1 className="text-xl font-bold bg-gradient-to-r from-[#4A8B8B] to-[#5FABA8] bg-clip-text text-transparent">
									YAS Harvest
								</h1>
								<p className="text-xs text-slate-600">
									{isAdmin
										? "Admin Console"
										: "Player Console"}
								</p>
							</div>
						</div>

						{/* Desktop Actions */}
						<div className="hidden md:flex items-center gap-2">
							{/* Page Badge */}
							{isPlayer && (
								<div className="px-4 py-1.5 rounded-full bg-gradient-to-r from-[#4A8B8B] to-[#5FABA8] text-white text-sm font-medium">
									Player
								</div>
							)}
							{isAdmin && (
								<div className="px-4 py-1.5 rounded-full bg-gradient-to-r from-[#4A8B8B] to-[#5FABA8] text-white text-sm font-medium">
									Admin
								</div>
							)}

							{/* Admin Actions */}
							{isAdmin && (
								<>
									<Button
										variant="outline"
										size="sm"
										onClick={handleCopyLink}
										className="border-[#4A8B8B] text-[#4A8B8B] hover:bg-[#4A8B8B]/10"
									>
										{copied ? (
											<Check className="w-4 h-4 mr-1" />
										) : (
											<Copy className="w-4 h-4 mr-1" />
										)}
										{copied ? "Copied!" : "Copy Link"}
									</Button>

									<Button
										variant="outline"
										size="sm"
										onClick={() => setShowResetDialog(true)}
										className="border-red-500 text-red-600 hover:bg-red-50"
									>
										<RotateCcw className="w-4 h-4 mr-1" />
										Reset
									</Button>

									<Button
										variant="outline"
										size="sm"
										onClick={handleLogout}
										className="border-slate-300 text-slate-600 hover:bg-slate-50"
									>
										<LogOut className="w-4 h-4 mr-1" />
										Logout
									</Button>
								</>
							)}
						</div>

						{/* Mobile Hamburger */}
						<button
							onClick={() => setIsDrawerOpen(!isDrawerOpen)}
							className="md:hidden p-2 rounded-lg hover:bg-slate-100 transition-colors"
							aria-label="Toggle menu"
						>
							<Menu className="w-6 h-6 text-slate-700" />
						</button>
					</div>
				</div>
			</nav>

			{/* Mobile Drawer Overlay */}
			{isDrawerOpen && (
				<div
					className="fixed inset-0 bg-black/50 z-40 md:hidden"
					onClick={() => setIsDrawerOpen(false)}
				/>
			)}

			{/* Mobile Drawer - Only render on mobile when open */}
			{isDrawerOpen && (
				<div className="fixed top-0 right-0 h-full w-80 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out md:hidden translate-x-0">
					<div className="flex flex-col h-full">
						{/* Drawer Header */}
						<div className="flex items-center justify-between p-4 border-b border-slate-200">
							<div className="flex items-center gap-2">
								<Image
									src="/YAS-logo.png"
									alt="YAS Harvest"
									width={40}
									height={40}
									className="rounded-lg"
								/>
								<div>
									<h2 className="font-bold text-slate-900">
										YAS Harvest
									</h2>
									<p className="text-xs text-slate-600">
										{isAdmin ? "Admin" : "Player"}
									</p>
								</div>
							</div>
							<button
								onClick={() => setIsDrawerOpen(false)}
								className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
								aria-label="Close menu"
							>
								<X className="w-5 h-5 text-slate-700" />
							</button>
						</div>

						{/* Drawer Content */}
						<div className="flex-1 overflow-y-auto p-4 space-y-3">
							{/* Page Badge */}
							{isPlayer && (
								<div className="px-4 py-2 rounded-lg bg-gradient-to-r from-[#4A8B8B] to-[#5FABA8] text-white text-center font-medium">
									Player Console
								</div>
							)}
							{isAdmin && (
								<div className="px-4 py-2 rounded-lg bg-gradient-to-r from-[#4A8B8B] to-[#5FABA8] text-white text-center font-medium">
									Admin Console
								</div>
							)}

							{/* Admin Actions */}
							{isAdmin && (
								<>
									<Button
										variant="outline"
										className="w-full justify-start border-[#4A8B8B] text-[#4A8B8B] hover:bg-[#4A8B8B]/10"
										onClick={handleCopyLink}
									>
										{copied ? (
											<Check className="w-4 h-4 mr-2" />
										) : (
											<Copy className="w-4 h-4 mr-2" />
										)}
										{copied
											? "Link Copied!"
											: "Copy Player Link"}
									</Button>

									<Button
										variant="outline"
										className="w-full justify-start border-red-500 text-red-600 hover:bg-red-50"
										onClick={() => {
											setIsDrawerOpen(false);
											setShowResetDialog(true);
										}}
									>
										<RotateCcw className="w-4 h-4 mr-2" />
										Reset Game
									</Button>

									<Button
										variant="outline"
										className="w-full justify-start border-slate-300 text-slate-600 hover:bg-slate-50"
										onClick={handleLogout}
									>
										<LogOut className="w-4 h-4 mr-2" />
										Logout
									</Button>
								</>
							)}
						</div>
					</div>
				</div>
			)}

			{/* Reset Confirmation Dialog */}
			<AlertDialog
				open={showResetDialog}
				onOpenChange={setShowResetDialog}
			>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle className="flex items-center gap-2 text-xl">
							<AlertTriangle className="w-6 h-6 text-amber-500" />
							Reset Game?
						</AlertDialogTitle>
						<AlertDialogDescription className="text-base pt-2">
							This action will reset the entire game and clear all
							progress. All teams will need to rejoin and the game
							will return to the lobby.
							<br />
							<br />
							<span className="font-semibold text-slate-900">
								This cannot be undone.
							</span>
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Cancel</AlertDialogCancel>
						<AlertDialogAction
							onClick={handleReset}
							className="bg-red-600 hover:bg-red-700 text-white"
						>
							Yes, Reset Game
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</>
	);
}
