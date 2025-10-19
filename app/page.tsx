"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";

interface Firework {
	id: number;
	x: number;
	y: number;
	color: string;
	particles: number;
}

export default function SplashScreen() {
	const router = useRouter();
	const [fireworks, setFireworks] = useState<Firework[]>([]);
	const [typedText, setTypedText] = useState("");
	const [typedSubtitle, setTypedSubtitle] = useState("");
	const [typedTitle, setTypedTitle] = useState("");
	const fullText =
		"Lead your team through challenging scenarios, make strategic decisions, and harvest success together.";
	const subtitleText = "Agricultural Decision Making Game";
	const titleText = "YAS Harvest";
	const [isTypingComplete, setIsTypingComplete] = useState(false);
	const [isSubtitleComplete, setIsSubtitleComplete] = useState(false);
	const [titlePhase, setTitlePhase] = useState<"typing" | "deleting">(
		"typing"
	);

	// Split title into YAS and Harvest parts
	const yasText = typedTitle.slice(0, 3); // "YAS"
	const harvestText = typedTitle.slice(4); // "Harvest" (after space)

	useEffect(() => {
		// Generate fireworks at random positions with different colors
		const colors = [
			"#4A8B8B",
			"#5FABA8",
			"#FFD700",
			"#FFA500",
			"#FF6B6B",
			"#4ECDC4",
		];

		const interval = setInterval(() => {
			const newFirework: Firework = {
				id: Math.random(),
				x: Math.random() * 100,
				y: Math.random() * 50 + 10,
				color: colors[Math.floor(Math.random() * colors.length)],
				particles: 12 + Math.floor(Math.random() * 8),
			};
			setFireworks((prev) => [...prev.slice(-6), newFirework]);
		}, 600);

		return () => clearInterval(interval);
	}, []);

	// Typing and deleting effect for title
	useEffect(() => {
		if (titlePhase === "typing") {
			if (typedTitle.length < titleText.length) {
				const timeout = setTimeout(() => {
					setTypedTitle(titleText.slice(0, typedTitle.length + 1));
				}, 150);
				return () => clearTimeout(timeout);
			} else {
				// Wait before starting to delete
				const timeout = setTimeout(() => {
					setTitlePhase("deleting");
				}, 2000);
				return () => clearTimeout(timeout);
			}
		} else if (titlePhase === "deleting") {
			if (typedTitle.length > 0) {
				const timeout = setTimeout(() => {
					setTypedTitle(titleText.slice(0, typedTitle.length - 1));
				}, 100);
				return () => clearTimeout(timeout);
			} else {
				// Wait before starting to type again
				const timeout = setTimeout(() => {
					setTitlePhase("typing");
				}, 500);
				return () => clearTimeout(timeout);
			}
		}
	}, [typedTitle, titlePhase, titleText]);

	// Typing effect for subtitle
	useEffect(() => {
		if (typedSubtitle.length < subtitleText.length) {
			const timeout = setTimeout(() => {
				setTypedSubtitle(
					subtitleText.slice(0, typedSubtitle.length + 1)
				);
			}, 50);
			return () => clearTimeout(timeout);
		} else {
			setIsSubtitleComplete(true);
		}
	}, [typedSubtitle, subtitleText]);

	// Typing effect for description (starts after subtitle)
	useEffect(() => {
		if (isSubtitleComplete && typedText.length < fullText.length) {
			const timeout = setTimeout(() => {
				setTypedText(fullText.slice(0, typedText.length + 1));
			}, 30);
			return () => clearTimeout(timeout);
		} else if (typedText.length === fullText.length) {
			setIsTypingComplete(true);
		}
	}, [typedText, fullText, isSubtitleComplete]);

	return (
		<div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col items-center justify-center relative overflow-hidden">
			{/* Enhanced Fireworks animation */}
			{fireworks.map((firework) => (
				<motion.div
					key={firework.id}
					className="absolute pointer-events-none"
					style={{
						left: `${firework.x}%`,
						top: `${firework.y}%`,
					}}
				>
					{/* Center burst */}
					<motion.div
						className="absolute w-3 h-3 rounded-full"
						style={{ backgroundColor: firework.color }}
						initial={{ scale: 1, opacity: 1 }}
						animate={{ scale: 0, opacity: 0 }}
						transition={{ duration: 0.4, ease: "easeOut" }}
					/>

					{/* Particles */}
					{[...Array(firework.particles)].map((_, i) => {
						const angle = (i * Math.PI * 2) / firework.particles;
						const distance = 60 + Math.random() * 40;
						const duration = 1.2 + Math.random() * 0.6;

						return (
							<motion.div
								key={i}
								className="absolute rounded-full"
								style={{
									width: Math.random() * 4 + 2,
									height: Math.random() * 4 + 2,
									backgroundColor: firework.color,
									boxShadow: `0 0 ${
										Math.random() * 10 + 5
									}px ${firework.color}`,
								}}
								initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
								animate={{
									x: Math.cos(angle) * distance,
									y:
										Math.sin(angle) * distance +
										Math.random() * 20,
									opacity: 0,
									scale: 0,
								}}
								transition={{
									duration,
									ease: "easeOut",
								}}
							/>
						);
					})}

					{/* Trail particles */}
					{[...Array(6)].map((_, i) => {
						const angle = (i * Math.PI * 2) / 6;
						const distance = 30;

						return (
							<motion.div
								key={`trail-${i}`}
								className="absolute w-1 h-1 rounded-full"
								style={{
									backgroundColor: firework.color,
									opacity: 0.6,
								}}
								initial={{ x: 0, y: 0, opacity: 0.6 }}
								animate={{
									x: Math.cos(angle) * distance,
									y: Math.sin(angle) * distance,
									opacity: 0,
								}}
								transition={{
									duration: 0.8,
									ease: "easeOut",
									delay: 0.2,
								}}
							/>
						);
					})}
				</motion.div>
			))}

			{/* Content */}
			<motion.div
				className="z-10 flex flex-col items-center gap-8 px-4"
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.8, delay: 0.2 }}
			>
				{/* Logo */}
				<motion.div
					initial={{ scale: 0.8, opacity: 0 }}
					animate={{ scale: 1, opacity: 1 }}
					transition={{ duration: 0.6, delay: 0.4 }}
				>
					<Image
						src="/YAS-logo.png"
						alt="YAS Harvest Logo"
						width={200}
						height={200}
						className=""
						priority
					/>
				</motion.div>

				{/* Title with Gradient */}
				<motion.div
					className="text-center relative"
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ duration: 0.6, delay: 0.6 }}
				>
					{/* Animated glow effect behind text */}
					<motion.div
						className="absolute inset-0 blur-3xl opacity-50"
						animate={{
							scale: [1, 1.1, 1],
							opacity: [0.3, 0.5, 0.3],
						}}
						transition={{
							duration: 3,
							repeat: Infinity,
							ease: "easeInOut",
						}}
					>
						<div className="w-full h-full bg-gradient-to-r from-[#4A8B8B] via-[#5FABA8] to-[#4ECDC4]" />
					</motion.div>

					<h1 className="relative text-5xl md:text-7xl font-bold mb-4 min-h-[5rem] flex items-center justify-center">
						{/* YAS with gradient animation */}
						<motion.span
							className="inline-block"
							animate={{
								backgroundPosition: [
									"0% 50%",
									"100% 50%",
									"0% 50%",
								],
							}}
							transition={{
								duration: 5,
								repeat: Infinity,
								ease: "linear",
							}}
							style={{
								backgroundSize: "200% 200%",
								backgroundImage:
									"linear-gradient(90deg, #4A8B8B, #5FABA8, #4ECDC4, #5FABA8, #4A8B8B)",
								WebkitBackgroundClip: "text",
								WebkitTextFillColor: "transparent",
							}}
						>
							{yasText}
						</motion.span>

						{/* Space */}
						{typedTitle.length > 3 && (
							<span className="inline-block w-4" />
						)}

						{/* Harvest with gradient to white */}
						{typedTitle.length > 4 && (
							<span
								className="inline-block bg-gradient-to-r from-[#4ECDC4] via-slate-200 to-white bg-clip-text text-transparent"
								style={{
									WebkitBackgroundClip: "text",
									WebkitTextFillColor: "transparent",
								}}
							>
								{harvestText}
							</span>
						)}

						{/* Blinking cursor */}
						<motion.span
							animate={{ opacity: [1, 0] }}
							transition={{
								duration: 0.5,
								repeat: Infinity,
							}}
							className="inline-block w-1 h-16 bg-gradient-to-b from-[#4A8B8B] to-[#5FABA8] ml-1"
						/>
					</h1>
					<p className="relative text-xl md:text-2xl text-slate-300 max-w-2xl min-h-[2rem]">
						{typedSubtitle}
						{!isSubtitleComplete && (
							<motion.span
								animate={{ opacity: [1, 0] }}
								transition={{ duration: 0.5, repeat: Infinity }}
								className="inline-block w-0.5 h-6 bg-slate-300 ml-1"
							/>
						)}
					</p>
				</motion.div>

				{/* Description with Typing Effect */}
				<motion.p
					className="text-center text-slate-400 max-w-md text-lg min-h-[4rem]"
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ duration: 0.6, delay: 0.8 }}
				>
					{typedText}
					{!isTypingComplete && (
						<motion.span
							animate={{ opacity: [1, 0] }}
							transition={{ duration: 0.5, repeat: Infinity }}
							className="inline-block w-0.5 h-5 bg-slate-400 ml-1"
						/>
					)}
				</motion.p>

				<motion.button
					onClick={() => router.push("/player")}
					className="mt-4 px-8 py-4 bg-gradient-to-r from-[#4A8B8B] to-[#5FABA8] hover:from-[#3A7575] hover:to-[#4A8B8B] text-white text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2"
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.6, delay: 1 }}
					whileHover={{ scale: 1.05 }}
					whileTap={{ scale: 0.95 }}
				>
					Get Started
					<ArrowRight className="w-5 h-5" />
				</motion.button>
			</motion.div>

			{/* Decorative elements */}
			<motion.div
				className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-slate-950 to-transparent"
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				transition={{ duration: 1, delay: 1.2 }}
			/>
		</div>
	);
}
