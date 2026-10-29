import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import nodemailer from "nodemailer";

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// --- 1. HEALTH CHECK ROUTE ---
// Render uses this to check if your web service is live and running
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

// --- 2. NODEMAILER TRANSPORTER SETUP ---
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// --- 3. FEEDBACK API ROUTE ---
app.post("/api/feedback", async (req, res) => {
  const { feedback, userContact } = req.body;

  if (!feedback || feedback.trim() === "") {
    return res
      .status(400)
      .json({ success: false, message: "Feedback string cannot be empty." });
  }

  try {
    await transporter.sendMail({
      from: `"3D Portfolio World" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER, // Sends straight to your personal inbox
      subject: "🎮 New Portfolio Feedback Received!",
      html: `
                <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #0d0d0d; color: #ffffff; border-radius: 8px;">
                    <h2 style="color: #ffd700; margin-top: 0;">New Arena Feedback</h2>
                    <p><strong>Feedback Content:</strong></p>
                    <blockquote style="background: #1e1e1e; padding: 15px; border-left: 4px solid #ffd700; border-radius: 4px;">
                        "${feedback}"
                    </blockquote>
                    ${userContact ? `<p><strong>User Contact:</strong> ${userContact}</p>` : "<p><em>Sent anonymously</em></p>"}
                    <p style="font-size: 0.8em; color: #888;">Powered by Node.js & Render</p>
                </div>
            `,
    });

    return res
      .status(200)
      .json({ success: true, message: "Feedback sent successfully!" });
  } catch (error) {
    console.error("Email send error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Failed to send feedback." });
  }
});

// Bind to Render's dynamic port or default to 5000 locally
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
