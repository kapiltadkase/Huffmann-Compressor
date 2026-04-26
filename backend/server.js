const express = require("express");
const multer = require("multer");
const { exec } = require("child_process");
const cors = require("cors");

const app = express();
app.use(cors());

const upload = multer({ dest: "uploads/" });

// Compress
app.post("/compress", upload.single("file"), (req, res) => {
    const inputPath = req.file.path;
    const outputPath = inputPath + ".huff";

    exec(`../huffman.exe compress ${inputPath} ${outputPath}`, (err) => {
        if (err) return res.status(500).send("Compression failed");

        res.download(outputPath);
    });
});

// Decompress
app.post("/decompress", upload.single("file"), (req, res) => {
    const inputPath = req.file.path;
    const outputPath = inputPath + ".txt";

    exec(`../huffman.exe decompress ${inputPath} ${outputPath}`, (err) => {
        if (err) return res.status(500).send("Decompression failed");

        res.download(outputPath);
    });
});

app.listen(3000, () => console.log("Server running on port 3000"));