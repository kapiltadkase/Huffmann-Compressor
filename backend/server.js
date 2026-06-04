const express = require("express");
const multer = require("multer");
const { execFile } = require("child_process");
const path = require("path");
const fs = require("fs");
const cors = require("cors");

const app = express();
const PORT = 3000;

app.use(cors());

//  Ensure uploads folder exists
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

//  Multer storage config
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

// Path to C++ executable
const exePath = path.join(__dirname, "..", "huffman.exe");


app.post("/compress", upload.single("file"), (req, res) => {
    const inputPath = req.file.path;
    const outputPath = inputPath + ".huff";

    execFile(exePath, ["compress", inputPath, outputPath], (err, stdout, stderr) => {
        if (err) {
            console.error("Compress Error:", err);
            console.error("stderr:", stderr);
            return res.status(500).send("Compression failed");
        }

        const originalSize = fs.statSync(inputPath).size;
        const compressedSize = fs.statSync(outputPath).size;

        const ratio = (((originalSize - compressedSize)/originalSize)*100).toFixed(2);

        console.log(`Original Size: ${originalSize} bytes`);
        console.log(`Compressed Size: ${compressedSize} bytes`);
        console.log(`Space Saved: ${ratio}%`);

        res.setHeader("X-Original-Size", originalSize);
        res.setHeader("X-Compressed-Size",compressedSize);
        res.setHeader("X-Saved_Space", ratio);

        const originalName = req.file.originalname;

        res.download(outputPath, originalName + ".huff", (downloadErr) => {
            if(downloadErr){
                console.error(downloadErr);
            }

            try{
                fs.unlinkSync(inputPath);
                fs.unlinkSync(outputPath);
            }
            catch(e){
                console.error(e);
            }
        });
    });
});



app.post("/decompress", upload.single("file"), (req, res) => {
    const inputPath = req.file.path;
    const outputPath = inputPath + ".out";

    execFile(exePath, ["decompress", inputPath, outputPath], (err, stdout, stderr) => {
        if (err) {
            console.error("Decompress Error:", err);
            console.error("stderr:", stderr);
            return res.status(500).send("Decompression failed");
        }

        let originalName = req.file.originalname;

        if(originalName.endsWith(".huff")){
            originalName = originalName.slice(0,-5);
        }

        res.download(outputPath, originalName, (downloadErr) =>{
            if(downloadErr){
                console.error(downloadErr);
            }

            try{
                fs.unlinkSync(inputPath);
                fs.unlinkSync(outputPath);
            }
            catch(e){
                console.error(e);
            }
        });
    });
});


app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});