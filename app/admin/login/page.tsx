"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Lock, Mail, AlertCircle } from "lucide-react";
import toast from "react-hot-toast";

export default function AdminLoginPage() {
	const router = useRouter();
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState("");
	const [isLoading, setIsLoading] = useState(false);

	useEffect(() => {
		// Check if already logged in
		const isAuthenticated = sessionStorage.getItem("admin-authenticated");
		if (isAuthenticated === "true") {
			router.push("/admin");
		}
	}, [router]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError("");
		setIsLoading(true);

		// Validate inputs
		if (!email || !password) {
			setError("Please enter both email and password");
			setIsLoading(false);
			return;
		}

		// Validate email format
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailRegex.test(email)) {
			setError("Please enter a valid email address");
			setIsLoading(false);
			return;
		}

		try {
			// Check credentials from GCS
			const response = await fetch("/api/admin");
			if (response.ok) {
				const credentials = await response.json();
				if (
					email === credentials.username &&
					password === credentials.password
				) {
					// Success
					sessionStorage.setItem("admin-authenticated", "true");
					sessionStorage.setItem("admin-email", email);
					toast.success("Login successful! Welcome Eric.");

					setTimeout(() => {
						router.push("/admin");
					}, 500);
				} else {
					setError("Invalid email or password");
					setIsLoading(false);
				}
			} else {
				setError(
					"Admin credentials not found. Please contact support."
				);
				setIsLoading(false);
			}
		} catch (error) {
			console.error("Login error:", error);
			setError("Failed to authenticate. Please try again.");
			setIsLoading(false);
		}
	};

	return (
		<div className="min-h-screen bg-gradient-to-br from-slate-900 via-[#1a3a3a] to-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
			{/* Animated Background Elements */}
			<div className="absolute inset-0 overflow-hidden">
				<motion.div
					className="absolute top-20 left-10 w-72 h-72 bg-[#4A8B8B]/20 rounded-full blur-3xl"
					animate={{
						scale: [1, 1.2, 1],
						opacity: [0.3, 0.5, 0.3],
					}}
					transition={{
						duration: 8,
						repeat: Infinity,
						ease: "easeInOut",
					}}
				/>
				<motion.div
					className="absolute bottom-20 right-10 w-96 h-96 bg-[#5FABA8]/20 rounded-full blur-3xl"
					animate={{
						scale: [1.2, 1, 1.2],
						opacity: [0.3, 0.5, 0.3],
					}}
					transition={{
						duration: 10,
						repeat: Infinity,
						ease: "easeInOut",
					}}
				/>
				<motion.div
					className="absolute top-1/2 left-1/2 w-64 h-64 bg-[#4ECDC4]/10 rounded-full blur-3xl"
					animate={{
						x: [-100, 100, -100],
						y: [-50, 50, -50],
					}}
					transition={{
						duration: 15,
						repeat: Infinity,
						ease: "easeInOut",
					}}
				/>
			</div>

			<div className="w-full max-w-md relative z-10 space-y-6">
				{/* Welcome Text */}
				<motion.div
					initial={{ opacity: 0, y: -20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.6, ease: "easeOut" }}
					className="text-center space-y-2"
				>
					<h1 className="text-5xl md:text-5xl font-bold bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
						Welcome Back!
					</h1>
					<p className="text-lg text-slate-400 pt-3">
						Sign in to your Admin account
					</p>
				</motion.div>

				{/* Login Card */}
				<motion.div
					initial={{ opacity: 0, y: 20, scale: 0.95 }}
					animate={{ opacity: 1, y: 0, scale: 1 }}
					transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
				>
					<Card className="border border-[#4A8B8B]/30 bg-slate-900/40 backdrop-blur-2xl shadow-2xl relative overflow-hidden">
						{/* Glass effect overlay */}
						<div className="absolute inset-0 bg-gradient-to-br from-[#4A8B8B]/10 via-transparent to-[#5FABA8]/10 pointer-events-none" />

						{/* Animated border glow */}
						<motion.div
							className="absolute inset-0 rounded-lg"
							animate={{
								boxShadow: [
									"0 0 20px rgba(74, 139, 139, 0.3)",
									"0 0 40px rgba(95, 171, 168, 0.4)",
									"0 0 20px rgba(74, 139, 139, 0.3)",
								],
							}}
							transition={{
								duration: 3,
								repeat: Infinity,
								ease: "easeInOut",
							}}
						/>
						<CardHeader className="space-y-4 text-center relative">
							<motion.div
								initial={{ scale: 0, rotate: -180 }}
								animate={{ scale: 1, rotate: 0 }}
								transition={{
									type: "spring",
									stiffness: 200,
									damping: 15,
									delay: 0.2,
								}}
								className="flex justify-center relative"
							>
								{/* Glow effect behind logo */}
								<motion.div
									className="absolute inset-0 bg-gradient-to-r from-[#4A8B8B] to-[#5FABA8] rounded-full blur-2xl opacity-50"
									animate={{
										scale: [1, 1.2, 1],
										opacity: [0.3, 0.6, 0.3],
									}}
									transition={{
										duration: 2,
										repeat: Infinity,
										ease: "easeInOut",
									}}
								/>
								<Image
									src="/YAS-logo.png"
									alt="YAS Harvest"
									width={100}
									height={100}
									className="rounded-lg relative z-10 shadow-2xl"
								/>
							</motion.div>
							<motion.div
								initial={{ opacity: 0, y: 10 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ delay: 0.4, duration: 0.5 }}
							>
								<CardTitle className="text-3xl font-bold bg-gradient-to-r from-[#4A8B8B] via-[#5FABA8] to-[#4ECDC4] bg-clip-text text-transparent animate-gradient">
									YAS Harvest
								</CardTitle>
								<CardDescription className="text-base mt-2 text-slate-300 font-medium">
									Admin Console Login
								</CardDescription>
							</motion.div>
						</CardHeader>
						<CardContent className="relative">
							<form onSubmit={handleSubmit} className="space-y-5">
								{/* Email Field */}
								<motion.div
									initial={{ opacity: 0, x: -20 }}
									animate={{ opacity: 1, x: 0 }}
									transition={{ delay: 0.6, duration: 0.4 }}
									className="space-y-2"
								>
									<Label
										htmlFor="email"
										className="flex items-center gap-2 text-slate-200 font-medium"
									>
										<Mail className="w-4 h-4 text-[#5FABA8]" />
										Email Address
									</Label>
									<Input
										id="email"
										type="email"
										placeholder="Enter your email"
										value={email}
										onChange={(e) =>
											setEmail(e.target.value)
										}
										className="bg-slate-800/50 border-[#4A8B8B]/30 text-white placeholder:text-slate-500 focus:border-[#5FABA8] focus:ring-2 focus:ring-[#4A8B8B]/50 backdrop-blur-xl transition-all duration-300 hover:border-[#4A8B8B]/50"
										disabled={isLoading}
									/>
								</motion.div>

								{/* Password Field */}
								<motion.div
									initial={{ opacity: 0, x: -20 }}
									animate={{ opacity: 1, x: 0 }}
									transition={{ delay: 0.7, duration: 0.4 }}
									className="space-y-2"
								>
									<Label
										htmlFor="password"
										className="flex items-center gap-2 text-slate-200 font-medium"
									>
										<Lock className="w-4 h-4 text-[#5FABA8]" />
										Password
									</Label>
									<Input
										id="password"
										type="password"
										placeholder="Enter your password"
										value={password}
										onChange={(e) =>
											setPassword(e.target.value)
										}
										className="bg-slate-800/50 border-[#4A8B8B]/30 text-white placeholder:text-slate-500 focus:border-[#5FABA8] focus:ring-2 focus:ring-[#4A8B8B]/50 backdrop-blur-xl transition-all duration-300 hover:border-[#4A8B8B]/50"
										disabled={isLoading}
									/>
								</motion.div>

								{/* Error Message */}
								{error && (
									<motion.div
										initial={{ opacity: 0, scale: 0.9 }}
										animate={{ opacity: 1, scale: 1 }}
										transition={{ duration: 0.3 }}
									>
										<Alert
											variant="destructive"
											className="bg-red-500/10 border-red-500/50 backdrop-blur-xl"
										>
											<AlertCircle className="h-4 w-4" />
											<AlertDescription className="text-red-200">
												{error}
											</AlertDescription>
										</Alert>
									</motion.div>
								)}

								{/* Submit Button */}
								<motion.div
									initial={{ opacity: 0, y: 10 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{ delay: 0.8, duration: 0.4 }}
								>
									<Button
										type="submit"
										className="w-full bg-gradient-to-r from-[#4A8B8B] via-[#5FABA8] to-[#4ECDC4] hover:from-[#3A7575] hover:via-[#4A8B8B] hover:to-[#5FABA8] text-white font-semibold shadow-lg hover:shadow-[#4A8B8B]/50 transition-all duration-300 relative overflow-hidden group"
										size="lg"
										disabled={isLoading}
									>
										<span className="relative z-10">
											{isLoading ? (
												<span className="flex items-center justify-center gap-2">
													<motion.div
														animate={{
															rotate: 360,
														}}
														transition={{
															duration: 1,
															repeat: Infinity,
															ease: "linear",
														}}
														className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
													/>
													Logging in...
												</span>
											) : (
												"Login"
											)}
										</span>
										<motion.div
											className="absolute inset-0 bg-gradient-to-r from-[#5FABA8] to-[#4ECDC4]"
											initial={{ x: "-100%" }}
											whileHover={{ x: 0 }}
											transition={{ duration: 0.3 }}
										/>
									</Button>
								</motion.div>
							</form>

							{/* Back to Home */}
							<motion.div
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								transition={{ delay: 0.9, duration: 0.4 }}
								className="mt-6 text-center"
							>
								<button
									onClick={() => router.push("/")}
									className="text-sm text-slate-300 hover:text-[#5FABA8] transition-all duration-300 hover:scale-105 inline-flex items-center gap-1 group"
								>
									<motion.span
										className="inline-block"
										whileHover={{ x: -3 }}
										transition={{ duration: 0.2 }}
									>
										←
									</motion.span>
									<span className="group-hover:underline">
										Back to Home
									</span>
								</button>
							</motion.div>
						</CardContent>
					</Card>
				</motion.div>
			</div>
		</div>
	);
}
