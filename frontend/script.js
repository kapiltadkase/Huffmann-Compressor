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
    .then(res => res.blob())
    .then(blob => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = file.name + ".huff";
        a.click();

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