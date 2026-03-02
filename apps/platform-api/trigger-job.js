fetch("http://localhost:5050/orchestrate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt: "Create an elegant jewelry selling platform called Crafted Treasures" })
})
    .then(res => res.json())
    .then(data => {
        console.log("Triggered job:", data.jobId);
    })
    .catch(console.error);
