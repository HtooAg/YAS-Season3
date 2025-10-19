const { Storage } = require("@google-cloud/storage");
const path = require("path");

// Initialize Google Cloud Storage
const storage = new Storage({
	keyFilename: path.join(__dirname, "..", "gcs_key.json"),
	projectId: "yas-school",
});

const bucketName = "yas-data";
const bucket = storage.bucket(bucketName);

async function initializeAdmin() {
	try {
		const adminCredentials = {
			username: "eric@fantasia.com",
			password: "yas2025",
		};

		const file = bucket.file("admin/admin.json");
		await file.save(JSON.stringify(adminCredentials, null, 2), {
			contentType: "application/json",
			metadata: {
				createdAt: new Date().toISOString(),
			},
		});

		console.log("✅ Admin credentials initialized successfully!");
		console.log("📁 Location: yas-data/admin/admin.json");
		console.log("👤 Username:", adminCredentials.username);
		console.log("🔑 Password:", adminCredentials.password);
	} catch (error) {
		console.error("❌ Error initializing admin credentials:", error);
		process.exit(1);
	}
}

initializeAdmin();
