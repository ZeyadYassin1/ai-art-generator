import { useEffect, useState } from "react";
import {
  TextField,
  CircularProgress,
  Container,
  Typography,
  Modal,
  Box,
} from "@mui/material";
import axios from "axios";
import { motion } from "framer-motion";

const API_KEY = "sk-2N0AIEdYFMuioJheJgHkwz31ZgZ7jQ5t23rDIIsHkA0Sj3iu";
const randomPrompts = [
  "A peaceful beach during sunset",
  "A cozy coffee shop on a rainy day",
  "A bustling city street at night",
  "A quiet forest with sunlight filtering through the trees",
  "A vintage car parked by a countryside road",
  "A serene mountain lake reflecting the sky",
  "A group of friends enjoying a picnic in a park",
  "A cat sleeping on a windowsill",
  "A steaming cup of coffee on a wooden table",
  "A small garden filled with colorful flowers",
  "A rustic farmhouse surrounded by fields",
  "A busy street market with vibrant colors",
  "A dog playing fetch in an open field",
  "A lighthouse standing on a rocky shore",
  "A calm river flowing through a forest",
  "A well-organized study desk with books and a laptop",
  "A beautiful sunrise over a snowy landscape",
  "A family gathered around a dinner table",
  "A musician playing guitar at a local café",
  "A library with tall bookshelves filled with books",
];

function App() {
  const [prompt, setPrompt] = useState("");
  const [promptHistory, setPromptHistory] = useState([]);
  const [image, setImage] = useState(null);
  const [gallery, setGallery] = useState([]);
  const [modalImage, setModalImage] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("promptHistory")) || [];
    setPromptHistory(saved);
  }, []);

  const savePrompt = (text) => {
    const updated = [
      { prompt: text, time: new Date().toISOString() },
      ...promptHistory.filter((p) => p.prompt !== text),
    ].slice(0, 20);
    setPromptHistory(updated);
    localStorage.setItem("promptHistory", JSON.stringify(updated));
  };

  const generateImage = async () => {
    if (!prompt.trim()) return;

    setLoading(true);
    setImage(null);

    try {
      const response = await axios.post(
        "https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image",
        {
          text_prompts: [{ text: prompt }],
          cfg_scale: 5,
          clip_guidance_preset: "FAST_BLUE",
          height: 768,
          width: 1344,
          samples: 1,
          steps: 15,
          sampler: "K_EULER",
        },
        {
          headers: {
            Authorization: `Bearer ${API_KEY}`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        }
      );

      const base64 = response.data.artifacts[0].base64;
      if (base64) {
        const imageDataURL = `data:image/png;base64,${base64}`;
        setImage(imageDataURL);
        setGallery((prev) => [imageDataURL, ...prev].slice(0, 20));
        savePrompt(prompt);
      } else {
        throw new Error("Image generation failed: No image data received.");
      }
    } catch (err) {
      console.error("Generation error:", err.response?.data || err.message);
      alert(
        "Failed to generate image: " +
          (err.response?.data?.message || err.message)
      );
    } finally {
      setLoading(false);
    }
  };

  const surprisePrompt = () => {
    const random =
      randomPrompts[Math.floor(Math.random() * randomPrompts.length)];
    setPrompt(random);
  };

  const clearHistory = () => {
    setPromptHistory([]);
    localStorage.removeItem("promptHistory");
  };

  return (
    <motion.div
      className="min-h-screen bg-gradient-to-br from-[#1c1c2b] via-[#845ec2] to-[#ffc75f] flex flex-col items-center justify-start p-8 text-center space-y-10"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div
        className="mb-8"
        animate={{ scale: [1, 1.1, 1] }}
        transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
      >
        <Typography variant="h3" className="text-white font-bold">
          🧠 AI Art Generator
        </Typography>
      </motion.div>

      <Container maxWidth="sm" className="space-y-6">
        <TextField
          fullWidth
          label="Your Creative Prompt"
          placeholder="Type something imaginative, like 'A peaceful beach during sunset'..."
          variant="filled"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          className="bg-white rounded-lg shadow-md p-2 transition-all duration-300 ease-in-out hover:shadow-lg"
          InputProps={{
            style: {
              backgroundColor: "#fff",
              padding: "12px",
              fontSize: "1rem",
            },
            classes: {
              input: "text-gray-800 placeholder-gray-500",
            },
          }}
          InputLabelProps={{
            style: { color: "#555", fontWeight: "bold" },
          }}
        />

        <div className="flex flex-wrap justify-center gap-6 mt-4">
          <motion.button
            whileHover={{ scale: 1.1 }}
            className="bg-[#00c9a7] text-black px-6 py-3 rounded-lg shadow-md"
            onClick={generateImage}
          >
            {loading ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              "🎨 Generate"
            )}
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.1 }}
            className="bg-white text-black px-6 py-3 rounded-lg shadow-md"
            onClick={surprisePrompt}
          >
            ✨ Surprise Me
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.1 }}
            className="bg-red-500 text-white px-6 py-3 rounded-lg shadow-md"
            onClick={clearHistory}
          >
            🗑 Clear History
          </motion.button>
        </div>

        {image && (
          <motion.img
            src={image}
            alt="Generated AI Art"
            className="mt-6 rounded-xl shadow-xl w-[512px] h-[512px] object-cover mx-auto"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            onClick={() => setModalImage(image)}
          />
        )}
      </Container>

      <div className="flex gap-12 mt-8 w-full justify-center">
        <div className="bg-gray-800 text-white p-6 rounded-lg h-80 w-80 overflow-y-auto">
          <h3 className="text-xl font-bold mb-4">🕓 Prompt History</h3>
          <ul className="space-y-2">
            {promptHistory.map((entry, idx) => (
              <li
                key={idx}
                className="cursor-pointer hover:underline"
                onClick={() => setPrompt(entry.prompt)}
              >
                {entry.prompt}
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-gray-800 text-white p-6 rounded-lg h-80 w-80 overflow-y-auto">
          <h3 className="text-xl font-bold mb-4">🖼️ Gallery</h3>
          <div className="grid gap-4">
            {gallery.map((img, idx) => (
              <motion.img
                key={idx}
                src={img}
                alt={`Generated #${idx + 1}`}
                className="rounded-md shadow-md cursor-pointer"
                whileHover={{ scale: 1.05 }}
                onClick={() => setModalImage(img)}
              />
            ))}
          </div>
        </div>
      </div>

      <Modal open={!!modalImage} onClose={() => setModalImage(null)}>
        <Box onClick={() => setModalImage(null)} sx={{ p: 4, borderRadius: 2 }}>
          <motion.img
            src={modalImage}
            alt="Full preview"
            className="max-w-full rounded-xl"
          />
        </Box>
      </Modal>
    </motion.div>
  );
}

export default App;
