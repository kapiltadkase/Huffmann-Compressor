const API = "http://localhost:3000";

function compress() {
    const file = document.getElementById("fileInput").files[0];
    if (!file) return alert("Select a file");

    const formData = new FormData();
    formData.append("file", file);

    document.getElementById("status").innerText = "Compressing...";

    fetch(API + "/compress", {
        method: "POST",
        body: formData
    })
    .then(async res => {

        const originalSize = res.headers.get("X-Original-Size");
        const compressedSize = res.headers.get("X-Compressed-Size");
        const ratio = res.headers.get("X-Saved-Spaced");

        const blob = await res.blob();

        return {
            blob,
            originalSize,
            compressedSize,
            ratio
        };
    })
    .then(data => {
        const blob = data.blob;

        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = file.name + ".huff";
        a.click();

        document.getElementById("stats").style.display = "block";
        document.getElementById("originalSize").innerText = "Original Size: " + data.originalSize + " bytes";
        document.getElementById("compressedSize").innerText = "Compressed Size: " + data.compressedSize + " bytes";
        document.getElementById("spaceSaved").innerText = "Space Saved: " + data.ratio + "%";

        document.getElementById("status").innerText = "Compression completed!";
    })
    .catch(() => {
        document.getElementById("status").innerText = "Compression failed!";
    });
}

function decompress() {
    const file = document.getElementById("fileInput").files[0];
    if (!file) return alert("Select a file");

    const formData = new FormData();
    formData.append("file", file);

    document.getElementById("status").innerText = "Decompressing...";

    fetch(API + "/decompress", {
        method: "POST",
        body: formData
    })
    .then(res => res.blob())
    .then(blob => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        
        let originalName = file.name;

        if(originalName.endsWith(".huff")){
            originalName = originalName.slice(0,-5);
        }

        a.download = originalName;

        a.click();

        document.getElementById("status").innerText = "Decompression completed!";
    })
    .catch(() => {
        document.getElementById("status").innerText = "Decompression failed!";
    });
}