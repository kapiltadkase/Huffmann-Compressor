const API = "";

let downloadUrl = "";
let downloadName = "";

async function parseResponse(res) {
    const contentType = res.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
        return res.json();
    }
    const text = await res.text();
    return { error: text || `Server error ${res.status}` };
}

function compress() {
    const file = document.getElementById("fileInput").files[0];
    if (!file) { alert("Select a file first"); return; }

    const formData = new FormData();
    formData.append("file", file);

    document.getElementById("status").innerText = "Compressing...";
    document.getElementById("stats").style.display = "none";
    document.getElementById("actions").style.display = "none";

    fetch(API + "/compress", { method: "POST", body: formData })
        .then(async res => {
            const data = await parseResponse(res);
            if (!res.ok) throw new Error(data.error || data.details || "Unknown server error");
            return data;
        })
        .then(data => {
            downloadUrl = API + "/download/" + data.downloadFile;
            downloadName = data.downloadName;

            document.getElementById("originalSize").innerText =
                "Original Size: " + Number(data.originalSize).toLocaleString() + " bytes";
            document.getElementById("compressedSize").innerText =
                "Compressed Size: " + Number(data.compressedSize).toLocaleString() + " bytes";
            document.getElementById("spaceSaved").innerText =
                "Space Saved: " + data.ratio + "%";

            document.getElementById("stats").style.display = "block";
            document.getElementById("actions").style.display = "flex";
            document.getElementById("status").innerText = "Compression completed!";
        })
        .catch(err => {
            console.error("Compress error:", err);
            document.getElementById("status").innerText = "Error: " + err.message;
        });
}

function decompress() {
    const file = document.getElementById("fileInput").files[0];
    if (!file) { alert("Select a file first"); return; }

    const formData = new FormData();
    formData.append("file", file);

    document.getElementById("status").innerText = "Decompressing...";

    fetch(API + "/decompress", { method: "POST", body: formData })
        .then(async res => {
            if (!res.ok) {
                const data = await parseResponse(res);
                throw new Error(data.error || data.details || "Unknown server error");
            }
            return res.blob();
        })
        .then(blob => {
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;

            let originalName = file.name;
            if (originalName.endsWith(".huff")) originalName = originalName.slice(0, -5);
            a.download = originalName;

            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);

            document.getElementById("status").innerText = "Decompression completed!";
        })
        .catch(err => {
            console.error("Decompress error:", err);
            document.getElementById("status").innerText = "Error: " + err.message;
        });
}

function downloadFile() {
    if (!downloadUrl) return;
    const a = document.createElement("a");
    a.href = downloadUrl;
    a.download = downloadName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

function resetPage() { location.reload(); }

document.getElementById("compressBtn").addEventListener("click", compress);
document.getElementById("decompressBtn").addEventListener("click", decompress);
document.getElementById("downloadBtn").addEventListener("click", downloadFile);
document.getElementById("resetBtn").addEventListener("click", resetPage);