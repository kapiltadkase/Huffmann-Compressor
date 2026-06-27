const express = require("express");
const multer = require("multer");
const { execFile } = require("child_process");
const path = require("path");
const fs = require("fs");
const cors = require("cors");

const app = express();
const PORT = 3000;

app.use(cors());

// Serves frontend/index.html, frontend/script.js, frontend/style.css
app.use(express.static(path.join(__dirname, "..", "frontend")));

const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueName = Date.now() + "-" + file.originalname;
        cb(null, uniqueName);
    }
});

const upload = multer({ storage });

// huffman.exe is in the project root (one level above backend/)
const exePath = path.join(__dirname, "..", "huffman.exe");

console.log("Looking for huffman.exe at:", exePath);
console.log("Exe found:", fs.existsSync(exePath));


app.post("/compress", upload.single("file"), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
    }

    const inputPath = req.file.path;
    const outputPath = inputPath + ".huff";

    if (!fs.existsSync(exePath)) {
        try { fs.unlinkSync(inputPath); } catch (_) {}
        return res.status(500).json({
            error: "huffman.exe not found at: " + exePath
        });
    }

    execFile(exePath, ["compress", inputPath, outputPath], (err, stdout, stderr) => {
        if (err) {
            console.error("Compress Error:", err.message);
            console.error("stderr:", stderr);
            try { fs.unlinkSync(inputPath); } catch (_) {}
            return res.status(500).json({
                error: "Compression failed",
                details: stderr || err.message
            });
        }

        if (!fs.existsSync(outputPath)) {
            try { fs.unlinkSync(inputPath); } catch (_) {}
            return res.status(500).json({
                error: "Compression ran but produced no output file"
            });
        }

        const originalSize = fs.statSync(inputPath).size;
        const compressedSize = fs.statSync(outputPath).size;
        const ratio = (((originalSize - compressedSize) / originalSize) * 100).toFixed(2);

        console.log(`Original:   ${originalSize} bytes`);
        console.log(`Compressed: ${compressedSize} bytes`);
        console.log(`Saved:      ${ratio}%`);

        res.json({
            success: true,
            originalSize,
            compressedSize,
            ratio,
            downloadFile: path.basename(outputPath),
            downloadName: req.file.originalname + ".huff"
        });
    });
});


app.get("/download/:filename", (req, res) => {
    const filePath = path.join(uploadDir, req.params.filename);
    if (!fs.existsSync(filePath)) {
        return res.status(404).json({ error: "File not found" });
    }
    res.download(filePath, (err) => {
        if (err) { console.error("Download error:", err); return; }
        try { fs.unlinkSync(filePath); } catch (e) { console.error(e); }
    });
});


app.post("/decompress", upload.single("file"), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
    }

    const inputPath = req.file.path;
    const outputPath = inputPath + ".out";

    if (!fs.existsSync(exePath)) {
        try { fs.unlinkSync(inputPath); } catch (_) {}
        return res.status(500).json({
            error: "huffman.exe not found at: " + exePath
        });
    }

    execFile(exePath, ["decompress", inputPath, outputPath], (err, stdout, stderr) => {
        if (err) {
            console.error("Decompress Error:", err.message);
            console.error("stderr:", stderr);
            try { fs.unlinkSync(inputPath); } catch (_) {}
            return res.status(500).json({
                error: "Decompression failed",
                details: stderr || err.message
            });
        }

        if (!fs.existsSync(outputPath)) {
            try { fs.unlinkSync(inputPath); } catch (_) {}
            return res.status(500).json({
                error: "Decompression produced no output file"
            });
        }

        let originalName = req.file.originalname;
        if (originalName.endsWith(".huff")) {
            originalName = originalName.slice(0, -5);
        }

        res.download(outputPath, originalName, (downloadErr) => {
            if (downloadErr) console.error("Download error:", downloadErr);
            try {
                fs.unlinkSync(inputPath);
                fs.unlinkSync(outputPath);
            } catch (e) { console.error(e); }
        });
    });
});


app.listen(PORT, () => {
    console.log(`\nServer running — open http://localhost:${PORT}\n`);
});