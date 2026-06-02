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
        a.download = "compressed.huff";
        a.click();

        document.getElementById("status").innerText = "Done!";
    })
    .catch(() => {
        document.getElementById("status").innerText = "Error!";
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
        a.download = "decompressed.txt";
        a.click();

        document.getElementById("status").innerText = "Done!";
    })
    .catch(() => {
        document.getElementById("status").innerText = "Error!";
    });
}