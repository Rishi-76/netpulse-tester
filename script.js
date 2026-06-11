// DOM Selector Configuration Links
const runPingBtn = document.getElementById('run-ping-btn');
const runSpeedBtn = document.getElementById('run-speed-btn');
const pingCloudflareLabel = document.getElementById('ping-cloudflare');
const pingGoogleLabel = document.getElementById('ping-google');
const speedReadout = document.getElementById('speed-readout');
const logStream = document.getElementById('log-stream');
const statusIndicator = document.getElementById('connection-status');

// Helper Logger Engine
function appendSystemLog(message) {
    const timeStamp = new Date().toLocaleTimeString();
    const logNode = document.createElement('p');
    logNode.className = "log-entry";
    logNode.innerText = `[${timeStamp}] ${message}`;
    logStream.appendChild(logNode);
    logStream.scrollTop = logStream.scrollHeight;
}

// --- PIPELINE 1: ASYNC ROUND-TRIP LATENCY POLLER ---
async function checkEndpointPing(url, uiLabel, name) {
    uiLabel.innerText = "Polling...";
    uiLabel.style.color = "var(--neon-blue)";
    
    // Use a lightweight image tag or cache-busted path to avoid local cache spoofing
    const cacheBuster = `?t=${Date.now()}`;
    const targetEndpoint = url + cacheBuster;
    
    const startTime = performance.now();
    
    try {
        // Request headers only via a lightweight mode option to optimize round trips
        await fetch(targetEndpoint, { mode: 'no-cors', cache: 'no-store' });
        const endTime = performance.now();
        
        const deltaLatency = Math.round(endTime - startTime);
        uiLabel.innerText = `${deltaLatency} ms`;
        
        // Color code values dynamically based on performance scales
        if (deltaLatency < 60) uiLabel.style.color = "var(--neon-green)";
        else if (deltaLatency < 150) uiLabel.style.color = "orange";
        else uiLabel.style.color = "red";
        
        appendSystemLog(`Ping to ${name} established successfully: ${deltaLatency}ms`);
    } catch (err) {
        uiLabel.innerText = "DROP";
        uiLabel.style.color = "red";
        appendSystemLog(`[WARN] Connection dropout routing to target ${name}`);
    }
}

runPingBtn.addEventListener('click', async () => {
    runPingBtn.disabled = true;
    statusIndicator.innerText = "POLLING CHANNELS...";
    statusIndicator.className = "status-indicator working";
    
    // Trigger parallel async endpoint checks to simulate network scanner matrices
    await Promise.all([
        checkEndpointPing("https://1.1.1.1/cdn-cgi/trace", pingCloudflareLabel, "Cloudflare Core"),
        checkEndpointPing("https://images.google.com/images/branding/googlelogo/1x/googlelogo_color_272x92dp.png", pingGoogleLabel, "Google Server")
    ]);
    
    statusIndicator.innerText = "SYSTEM READY";
    statusIndicator.className = "status-indicator online";
    runPingBtn.disabled = false;
});

// --- PIPELINE 2: DOWNLINK RATE SPEED ESTIMATOR ---
runSpeedBtn.addEventListener('click', async () => {
    runSpeedBtn.disabled = true;
    speedReadout.innerText = "---";
    statusIndicator.innerText = "DOWNLOADING TEST BLOB...";
    statusIndicator.className = "status-indicator working";
    
    // Target a reliable public file reference asset from standard CDNs (Approx 1MB sample data chunk)
    const testTargetImage = "https://upload.wikimedia.org/wikipedia/commons/4/47/PNG_transparency_demonstration_1.png?cb=" + Date.now();
    appendSystemLog("Requesting file payload chunk to evaluate data transit capacity...");

    const startTime = performance.now();

    try {
        const response = await fetch(testTargetImage, { cache: 'no-store' });
        if (!response.ok) throw new Error("Target pipeline rejection.");
        
        // Convert the file tracking frame array down to a local data blob to guarantee complete asset download loops
        const dataBlob = await response.blob();
        const endTime = performance.now();
        
        const durationSeconds = (endTime - startTime) / 1000;
        const fileSizeBytes = dataBlob.size;
        const fileSizeBits = fileSizeBytes * 8;
        
        // Formula calculation: Megabits Per Second (Mbps)
        const speedMbps = (fileSizeBits / durationSeconds) / (1024 * 1024);
        
        speedReadout.innerText = speedMbps.toFixed(2);
        appendSystemLog(`Download analysis closed. Processed ${fileSizeBytes} bytes in ${durationSeconds.toFixed(2)}s. Speed: ${speedMbps.toFixed(2)} Mbps.`);

    } catch (err) {
        console.error(err);
        speedReadout.innerText = "ERR";
        appendSystemLog("[ERROR] Critical failure running speed evaluation pipeline.");
    }

    statusIndicator.innerText = "SYSTEM READY";
    statusIndicator.className = "status-indicator online";
    runSpeedBtn.disabled = false;
});