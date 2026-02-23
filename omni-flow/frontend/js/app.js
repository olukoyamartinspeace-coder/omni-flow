document.addEventListener('DOMContentLoaded', () => {
    console.log('OmniFlow Dashboard Initialized');

    // === PERFORMANCE OPTIMIZATION & ERROR HANDLING ===

    // Chart instance management (prevent memory leaks)
    const chartInstances = {
        mfa: null,
        confidence: null
    };

    function destroyChart(name) {
        if (chartInstances[name]) {
            chartInstances[name].destroy();
            chartInstances[name] = null;
        }
    }

    // Polling interval management
    let activePolling = [];

    function stopAllPolling() {
        activePolling.forEach(interval => clearInterval(interval));
        activePolling = [];
    }

    // Error handling utilities
    function showToast(message, type = 'error') {
        const toast = document.createElement('div');
        toast.className = `${type}-toast`;
        toast.innerHTML = `
            <strong>${type === 'error' ? '⚠ Error' : '✓ Success'}</strong>
            <p>${message}</p>
        `;
        document.body.appendChild(toast);

        setTimeout(() => {
            toast.remove();
        }, 5000);
    }

    function handleAPIError(error, context) {
        console.error(`API Error [${context}]:`, error);
        showToast(`Unable to load ${context}. Please check your connection.`, 'error');
    }

    async function fetchWithRetry(url, maxRetries = 3) {
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                const res = await fetch(url);
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                return await res.json();
            } catch (error) {
                if (attempt === maxRetries) throw error;
                const delay = Math.pow(2, attempt) * 500; // 1s, 2s, 4s
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
    }

    // Loading state helper
    function showLoading(elementId) {
        const el = document.getElementById(elementId);
        if (el) el.innerHTML = '<div class="spinner" style="margin: 40px auto;"></div>';
    }

    // Network status monitoring
    window.addEventListener('offline', () => {
        showToast('You are offline', 'error');
    });

    window.addEventListener('online', () => {
        showToast('Connection restored', 'success');
    });

    // --- Connect Wallet Flow ---
    const connectView = document.getElementById('connect-wallet-view');
    const dashboardView = document.getElementById('dashboard');
    const btnConnect = document.getElementById('btn-connect-wallet');
    const walletAddressDisplay = document.getElementById('wallet-address');

    // Initial State: Show Connect View, Hide others
    document.querySelectorAll('.page').forEach(p => p.style.display = 'none');
    connectView.style.display = 'flex';

    if (btnConnect) {
        btnConnect.addEventListener('click', () => {
            // 1. Open Binance Web3 Wallet
            window.open('https://www.binance.com/en/web3wallet', '_blank');

            // 2. Simulate Connection Delay
            btnConnect.innerText = "Connecting secure channel...";
            setTimeout(() => {
                // 3. Transition to Dashboard
                connectView.style.display = 'none';
                dashboardView.style.display = 'block';
                document.querySelector('nav a[href="#dashboard"]').classList.add('active');

                // 4. Update Header
                walletAddressDisplay.innerText = '0x71C...9B2';
                walletAddressDisplay.classList.add('connected');
                document.querySelector('.status-indicator').style.boxShadow = '0 0 15px #0f0';

                // 5. Initialize Dashboard Data
                initializeDashboard();
            }, 1500);
        });
    }

    // --- Dashboard Initialization ---
    function initializeDashboard() {
        console.log("Initializing Dashboard Components...");
        fetchQuantumStatus();
        fetchMFAStatus();
        fetchTransactions();
    }

    async function fetchQuantumStatus() {
        try {
            const res = await fetch('/api/wallet/quantum-status');
            const data = await res.json();

            document.getElementById('quantum-status-text').innerText = data.status.toUpperCase();
            document.getElementById('quantum-algo-text').innerText = `Algorithm: ${data.algorithm}`;
            document.getElementById('migration-progress').style.width = `${data.migrationProgress}%`;

            // Shield Color Logic
            const shield = document.getElementById('quantum-shield-icon');
            if (data.threatLevel === 'low') {
                shield.style.color = '#0f0';
                shield.style.textShadow = '0 0 20px rgba(0, 255, 0, 0.4)';
            }
        } catch (e) { console.error(e); }
    }

    async function fetchMFAStatus() {
        try {
            const res = await fetch('/api/auth/mfa-status');
            const data = await res.json();

            // Calculate Security Score (Weighted Average)
            const score = Math.round((data.biometric + data.behavioral + (data.dna ? 100 : 0) + data.seed) / 4);
            document.getElementById('security-score').innerText = `${score}%`;

            // Render Chart
            const ctx = document.getElementById('mfaChart').getContext('2d');
            new Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels: ['Biometric', 'Behavioral', 'DNA', 'Seed'],
                    datasets: [{
                        data: [data.biometric, data.behavioral, 100, 100],
                        backgroundColor: ['#36a2eb', '#ff6384', '#ffcd56', '#4bc0c0'],
                        borderWidth: 0
                    }]
                },
                options: {
                    cutout: '70%',
                    responsive: true,
                    plugins: { legend: { display: false } }
                }
            });
        } catch (e) { console.error(e); }
    }

    async function fetchTransactions() {
        try {
            const res = await fetch('/api/transactions');
            const txs = await res.json();

            const tbody = document.getElementById('tx-list-body');
            tbody.innerHTML = '';

            txs.forEach(tx => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${tx.type}</td>
                    <td>${tx.asset}</td>
                    <td>${tx.value}</td>
                    <td style="color: var(--accent-color);">🛡️ ${tx.security}</td>
                `;
                tbody.appendChild(tr);
            });
        } catch (e) { console.error(e); }
    }

    // --- Quantum ID Generation ---
    const btnGenId = document.getElementById('btn-gen-identity');
    if (btnGenId) {
        btnGenId.addEventListener('click', async () => {
            btnGenId.innerText = "Generating Keys (Dilithium + Kyber)...";
            btnGenId.disabled = true;

            try {
                const response = await fetch('/api/crypto/generate_keys');
                const data = await response.json();

                if (data.status === 'success') {
                    btnGenId.innerText = "Identity Secured";
                    document.getElementById('identity-result').style.display = 'block';

                    // Display truncated keys
                    const signKey = data.identity.signing_public_key;
                    const encKey = data.identity.encryption_public_key;

                    document.getElementById('display-sign-pk').innerText = signKey.substring(0, 50) + "...";
                    document.getElementById('display-enc-pk').innerText = encKey.substring(0, 50) + "...";
                }
            } catch (e) {
                console.error(e);
                btnGenId.innerText = "Generation Failed";
            }
        });
    }

    // --- Biometric Simulation ---
    const btnBio = document.getElementById('btn-capture-bio');
    if (btnBio) {
        btnBio.addEventListener('click', async () => {
            btnBio.disabled = true;
            btnBio.innerText = "Scanning...";

            // Visual Simulation
            const sensors = ['sensor-iris', 'sensor-vein', 'sensor-heart'];
            for (const id of sensors) {
                const el = document.getElementById(id);
                el.classList.add('scanning');
                await new Promise(r => setTimeout(r, 800)); // Simulate scan time
                el.classList.remove('scanning');
                el.classList.add('success');
                el.innerHTML = el.innerHTML.replace('Accessing', 'Verified').replace('Scanning', 'Verified').replace('Detecting', 'Verified');
            }

            // Backend Call
            try {
                const response = await fetch('/api/biometrics/process', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        iris_data: "IRIS_SCAN_V2_RAW_DATA_SAMPLE",
                        vein_data: "VEIN_MAP_XY_COORDS_HASH",
                        heartbeat_data: "ECG_WAVEFORM_SAMPLE_Data"
                    })
                });
                const result = await response.json();

                if (result.status === 'success') {
                    btnBio.style.display = 'none';
                    const resBox = document.getElementById('bio-result');
                    resBox.style.display = 'block';
                    document.getElementById('display-bio-hash').innerText = result.data.bio_hash;
                }
            } catch (e) {
                console.error(e);
                btnBio.innerText = "Capture Failed";
            }
        });
    }

    // --- DNA Storage Logic ---
    const btnEncode = document.getElementById('btn-encode-dna');
    if (btnEncode) {
        btnEncode.addEventListener('click', async () => {
            const secret = document.getElementById('dna-secret-input').value;
            if (!secret) return alert("Enter data to encode!");

            btnEncode.innerText = "Encoding using Reed-Solomon...";
            btnEncode.disabled = true;

            try {
                const response = await fetch('/api/dna/encode', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ secret_data: secret })
                });
                const data = await response.json();

                if (data.status === 'success') {
                    document.getElementById('dna-result').style.display = 'block';
                    document.getElementById('display-dna-seq').innerText = data.dna_sequence;
                    btnEncode.innerText = "Encoding Complete";
                }
            } catch (e) {
                console.error(e);
                btnEncode.innerText = "Encoding Failed";
            }
        });
    }

    const btnOrder = document.getElementById('btn-order-dna');
    if (btnOrder) {
        btnOrder.addEventListener('click', async () => {
            const seq = document.getElementById('display-dna-seq').innerText;
            btnOrder.innerText = "Connecting to Twist Bioscience API...";
            btnOrder.disabled = true;

            try {
                const response = await fetch('/api/dna/order', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ dna_sequence: seq })
                });
                const data = await response.json();

                if (data.status === 'success') {
                    document.getElementById('order-confirm').style.display = 'block';
                    document.getElementById('order-id-display').innerText = data.order_details.order_id;
                    btnOrder.innerText = "Order Placed";
                }
            } catch (e) {
                console.error(e);
                btnOrder.innerText = "Order Failed";
            }
        });
    }

    // --- Behavioral Analysis (Keystroke Dynamics) ---
    class KeystrokeMonitor {
        constructor() {
            this.keystrokes = [];
            this.activeKeys = {}; // map key -> timestamp_down
            this.lastKeyUpTime = 0;
            this.isTracking = false;
        }

        startTracking(inputElementId) {
            const el = document.getElementById(inputElementId);
            if (!el) return;

            el.addEventListener('keydown', (e) => {
                const now = Date.now();
                this.activeKeys[e.code] = now;

                // Flight time: Time since last key UP to this key DOWN
                if (this.lastKeyUpTime > 0) {
                    const flightTime = now - this.lastKeyUpTime;
                    // We store it provisionally, will finalize on keyup
                }
            });

            el.addEventListener('keyup', (e) => {
                const now = Date.now();
                const downTime = this.activeKeys[e.code];
                if (downTime) {
                    const dwellTime = now - downTime;

                    // Simple capture
                    this.keystrokes.push({
                        key: e.code, // Not sent to backend usually, just for local debug
                        dwell: dwellTime,
                        flight: this.lastKeyUpTime > 0 ? (downTime - this.lastKeyUpTime) : 0
                    });

                    // Send batch if enough data
                    if (this.keystrokes.length >= 5) {
                        this.sendBatch(this.keystrokes.slice()); // Copy
                        this.keystrokes = []; // Reset
                    }
                }
                this.lastKeyUpTime = now;
                delete this.activeKeys[e.code];
            });
        }

        async sendBatch(data) {
            // Determine if we are training or verifying (simplified: always train/verify together)
            await fetch('/api/behavioral/train', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ timing_data: data })
            });

            const response = await fetch('/api/behavioral/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ timing_data: data })
            });

            const result = await response.json();
            this.updateUI(result.confidence_score);
        }

        updateUI(score) {
            const riskEl = document.getElementById('global-risk');
            if (riskEl) {
                // Invert confidence to risk for display consistency
                // High confidence = Low Risk
                const risk = (1 - score).toFixed(2);
                riskEl.innerText = `${risk} (Behavioral)`;
                riskEl.style.color = score > 0.7 ? '#66fcf1' : '#ff0055';
            }
        }
    }

    // Initialize Monitor
    const bioMonitor = new KeystrokeMonitor();
    // Track typing in the DNA secret box as a "training ground"
    bioMonitor.startTracking('dna-secret-input');

    // --- Metaverse Bridge Logic ---
    const bridgeBtns = document.querySelectorAll('.btn-bridge');
    const statusBox = document.getElementById('bridge-status');
    const statusMsg = document.getElementById('bridge-msg');
    const progressBar = document.getElementById('bridge-progress');

    bridgeBtns.forEach(btn => {
        btn.addEventListener('click', async () => {
            const chain = btn.getAttribute('data-chain');

            // UI Reset
            statusBox.style.display = 'block';
            statusMsg.innerText = `Connecting to ${chain.toUpperCase()} Bridge...`;
            progressBar.style.width = '10%';

            try {
                const response = await fetch('/api/metaverse/bridge', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ destination_chain: chain })
                });
                const data = await response.json();

                if (data.status === 'success') {
                    progressBar.style.width = '60%';
                    statusMsg.innerText = `ZKP Generated. Relaying via LayerZero (Msg ID: ${data.message_id.substring(0, 10)}...)`;

                    // Simulate finality delay
                    setTimeout(() => {
                        progressBar.style.width = '100%';
                        statusMsg.innerText = `Identity Successfully Bridged to ${data.target_metaverse}!`;
                        statusBox.style.borderColor = '#0f0';
                        statusBox.style.color = '#0f0';
                    }, 2000);
                } else {
                    statusMsg.innerText = "Bridge Failed: " + data.message;
                }
            } catch (e) {
                console.error(e);
                statusMsg.innerText = "Network Error";
            }
        });
    });

    // --- Security Logic ---
    const tamperBox = document.getElementById('tamper-box');
    const tamperMsg = document.getElementById('tamper-msg');

    // Poll for integrity
    setInterval(async () => {
        try {
            const res = await fetch('/api/security/status');
            const data = await res.json();
            if (data.status === 'secure') {
                tamperBox.style.borderColor = '#0f0';
                tamperMsg.innerText = "Environment Secure: Root Check Passed, Debugger Detached.";
            } else {
                tamperBox.style.borderColor = '#f00';
                tamperMsg.innerText = "WARNING: ENVIROMENT COMPROMISED!";
            }
        } catch (e) { }
    }, 5000);

    // Dead Man's Switch
    const slider = document.getElementById('deadman-slider');
    const thresholdDisplay = document.getElementById('threshold-display');
    const btnHeartbeat = document.getElementById('btn-heartbeat');
    const btnSimLapse = document.getElementById('btn-sim-lapse');
    const dmStatus = document.getElementById('deadman-status');

    if (slider) {
        slider.addEventListener('input', (e) => {
            thresholdDisplay.innerText = `${e.target.value} Days`;
        });

        slider.addEventListener('change', async (e) => {
            await fetch('/api/security/heartbeat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ threshold_days: e.target.value })
            });
        });

        btnHeartbeat.addEventListener('click', async () => {
            await fetch('/api/security/heartbeat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ threshold_days: slider.value })
            });
            dmStatus.style.display = 'block';
            dmStatus.innerText = "Check-in Confirmed. Timer Reset.";
            dmStatus.style.color = '#0f0';
            dmStatus.style.borderColor = '#0f0';
        });

        btnSimLapse.addEventListener('click', async () => {
            const res = await fetch('/api/security/simulate_lapse', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ days: 31 }) // Hardcode > 30 default
            });
            const data = await res.json();

            if (data.status === 'triggered') {
                dmStatus.style.display = 'block';
                dmStatus.innerHTML = `<strong>${data.message}</strong>`;
                dmStatus.style.color = '#ff0055'; // Alarm color
                dmStatus.style.borderColor = '#ff0055';
            }
        });
    }

    // --- BIOMETRICS PAGE LOGIC ---
    function initBiometricsPage() {
        // Confidence Graph
        fetchConfidenceHistory();
        setInterval(fetchConfidenceHistory, 5000); // Update every 5s

        // Spoof Log
        fetchSpoofLog();

        // Heatmap
        renderBehavioralHeatmap();

        // Scan buttons
        ['iris', 'vein', 'heart'].forEach(type => {
            const btn = document.getElementById(`btn-scan-${type}`);
            if (btn) {
                btn.addEventListener('click', () => {
                    btn.innerText = `Scanning ${type}...`;
                    setTimeout(() => btn.innerText = `✓ ${type.charAt(0).toUpperCase() + type.slice(1)} Complete`, 1500);
                });
            }
        });
    }

    async function fetchConfidenceHistory() {
        try {
            const res = await fetch('/api/biometrics/confidence-history');
            const data = await res.json();

            const ctx = document.getElementById('confidenceChart');
            if (!ctx || !data.length) return;

            new Chart(ctx.getContext('2d'), {
                type: 'line',
                data: {
                    labels: data.map(d => new Date(d.timestamp).toLocaleTimeString()),
                    datasets: [
                        { label: 'Iris', data: data.map(d => d.iris), borderColor: '#36a2eb', fill: false },
                        { label: 'Vein', data: data.map(d => d.vein), borderColor: '#ff6384', fill: false },
                        { label: 'Heartbeat', data: data.map(d => d.heartbeat), borderColor: '#ffcd56', fill: false }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: { y: { min: 80, max: 100 } },
                    plugins: { legend: { display: false } }
                }
            });
        } catch (e) { console.error(e); }
    }

    async function fetchSpoofLog() {
        try {
            const res = await fetch('/api/biometrics/spoof-log');
            const logs = await res.json();
            const container = document.getElementById('spoof-log');
            if (!container) return;

            container.innerHTML = logs.map(log => `
                <div style="padding: 10px; border-bottom: 1px solid var(--glass-border);">
                    <div style="display: flex; justify-content: space-between;">
                        <span style="color: #ff0055;">⚠ ${log.type}</span>
                        <span style="color: #0f0;">✓ Blocked</span>
                    </div>
                    <div style="font-size: 0.7rem; color: var(--text-secondary); margin-top: 5px;">
                        ${log.sensor} - ${new Date(log.timestamp).toLocaleString()}
                    </div>
                </div>
            `).join('');
        } catch (e) { console.error(e); }
    }

    function renderBehavioralHeatmap() {
        const container = document.getElementById('heatmap-container');
        if (!container) return;

        // Generate 28 days of activity
        for (let i = 0; i < 28; i++) {
            const intensity = Math.random();
            const cell = document.createElement('div');
            cell.style.cssText = `
                aspect-ratio: 1;
                background: rgba(102, 252, 241, ${intensity});
                border-radius: 3px;
                border: 1px solid var(--glass-border);
            `;
            container.appendChild(cell);
        }
    }

    // --- DNA PAGE LOGIC ---
    function initDNAPage() {
        fetchDNAStatus();

        const btnTest = document.getElementById('btn-test-recovery');
        if (btnTest) {
            btnTest.addEventListener('click', async () => {
                btnTest.innerText = 'Testing...';
                const res = await fetch('/api/dna/simulate-recovery', { method: 'POST' });
                const data = await res.json();
                if (data.status === 'success') {
                    alert(`Recovery Test Passed!\nIntegrity: ${data.integrity}%\nDuration: ${data.duration_ms}ms`);
                }
                btnTest.innerText = 'Test Recovery';
            });
        }
    }

    async function fetchDNAStatus() {
        try {
            const res = await fetch('/api/dna/status');
            const data = await res.json();

            document.getElementById('fragment-count').innerText = data.fragments;
            document.getElementById('fragment-provider').innerText = data.provider;
            document.getElementById('degradation-pct').innerText = `${100 - data.degradation}% Healthy`;
            document.getElementById('health-bar').style.width = `${100 - data.degradation}%`;
        } catch (e) { console.error(e); }
    }

    // --- METAVERSE PAGE LOGIC ---
    function initMetaversePage() {
        fetchMetaverseIdentities();
        fetchMetaverseAssets();
        fetchMetaverseTransactions();
    }

    async function fetchMetaverseIdentities() {
        try {
            const res = await fetch('/api/metaverse/identities');
            const platforms = await res.json();
            const grid = document.getElementById('platform-grid');
            if (!grid) return;

            grid.innerHTML = platforms.map(p => `
                <div class="glass-panel" style="padding: 15px; text-align: center;">
                    <h3 style="margin-bottom: 10px;">${p.platform}</h3>
                    <p style="font-size: 0.8rem; color: var(--text-secondary);">${p.username}</p>
                    <span style="display: inline-block; margin-top: 10px; padding: 3px 10px; background: ${p.status === 'connected' ? 'rgba(0,255,0,0.2)' : 'rgba(255,0,0,0.2)'}; border-radius: 10px; font-size: 0.7rem;">
                        ${p.status.toUpperCase()}
                    </span>
                </div>
            `).join('');
        } catch (e) { console.error(e); }
    }

    async function fetchMetaverseAssets() {
        try {
            const res = await fetch('/api/metaverse/assets');
            const assets = await res.json();
            const gallery = document.getElementById('asset-gallery');
            if (!gallery) return;

            gallery.innerHTML = assets.map(a => `
                <div class="glass-panel" style="padding: 15px; text-align: center;">
                    <div style="font-size: 3rem; margin-bottom: 10px;">${a.type === 'Wearable' ? '👔' : a.type === 'Land' ? '🏝️' : '🐉'}</div>
                    <h4 style="font-size: 0.9rem;">${a.name}</h4>
                    <p style="font-size: 0.7rem; color: var(--text-secondary);">${a.platform}</p>
                    <span style="color: ${a.rarity === 'Legendary' ? '#ff00ff' : '#ffcd56'}; font-size: 0.7rem;">${a.rarity}</span>
                </div>
            `).join('');
        } catch (e) { console.error(e); }
    }

    async function fetchMetaverseTransactions() {
        try {
            const res = await fetch('/api/metaverse/transactions');
            const txs = await res.json();
            const feed = document.getElementById('metaverse-tx-feed');
            if (!feed) return;

            feed.innerHTML = txs.map(tx => `
                <div style="padding: 15px; border-bottom: 1px solid var(--glass-border);">
                    <div style="display: flex; justify-content: space-between;">
                        <span>${tx.action}</span>
                        <span style="color: var(--accent-color);">${tx.value}</span>
                    </div>
                    <div style="font-size: 0.7rem; color: var(--text-secondary); margin-top: 5px;">
                        ${tx.platform} - ${new Date(tx.timestamp).toLocaleString()}
                    </div>
                </div>
            `).join('');
        } catch (e) { console.error(e); }
    }

    // --- SECURITY PAGE LOGIC ---
    function initSecurityPage() {
        fetchThreats();
        fetchAuditLog();
        fetchProtocols();
    }

    async function fetchThreats() {
        try {
            const res = await fetch('/api/security/threats');
            const data = await res.json();

            const statusEl = document.getElementById('threat-status');
            if (statusEl) {
                statusEl.innerText = `${data.personalThreatLevel.toUpperCase()} THREAT`;
                statusEl.style.color = data.personalThreatLevel === 'low' ? '#0f0' : '#ff0055';
            }

            const container = document.getElementById('recent-threats');
            if (container && data.recentThreats) {
                container.innerHTML = data.recentThreats.map(t => `
                    <div style="padding: 10px; border-left: 3px solid ${t.blocked ? '#0f0' : '#ff0055'}; margin-bottom: 10px; background: rgba(0,0,0,0.2);">
                        <strong>${t.type}</strong>
                        <p style="font-size: 0.7rem; color: var(--text-secondary); margin-top: 5px;">
                            ${new Date(t.timestamp).toLocaleString()} - ${t.blocked ? 'Blocked' : 'Detected'}
                        </p>
                    </div>
                `).join('');
            }
        } catch (e) { console.error(e); }
    }

    async function fetchAuditLog() {
        try {
            const res = await fetch('/api/security/audit-log');
            const logs = await res.json();
            const tbody = document.getElementById('audit-log-tbody');
            if (!tbody) return;

            tbody.innerHTML = logs.map(log => `
                <tr style="border-bottom: 1px solid var(--glass-border);">
                    <td style="padding: 10px;">${log.event}</td>
                    <td style="padding: 10px; color: ${log.result === 'Success' ? '#0f0' : '#ff0055'};">${log.result}</td>
                    <td style="padding: 10px;">${log.ip}</td>
                    <td style="padding: 10px; font-size: 0.7rem;">${new Date(log.timestamp).toLocaleString()}</td>
                </tr>
            `).join('');
        } catch (e) { console.error(e); }
    }

    async function fetchProtocols() {
        try {
            const res = await fetch('/api/security/protocols');
            const data = await res.json();

            const container = document.getElementById('protocol-cards');
            if (!container) return;

            container.innerHTML = `
                <div style="padding: 10px; border: 1px solid ${data.emergencyFreeze.enabled ? '#0f0' : '#555'}; border-radius: 5px; margin-bottom: 10px;">
                    <strong>Emergency Freeze: ${data.emergencyFreeze.enabled ? 'ACTIVE' : 'INACTIVE'}</strong>
                </div>
                <div style="padding: 10px; border: 1px solid ${data.deadManSwitch.enabled ? '#0f0' : '#555'}; border-radius: 5px; margin-bottom: 10px;">
                    <strong>Dead Man's Switch: ${data.deadManSwitch.enabled ? 'ACTIVE' : 'INACTIVE'}</strong>
                    <p style="font-size: 0.7rem; margin-top: 5px;">Threshold: ${data.deadManSwitch.threshold}</p>
                </div>
            `;

            // Migration bar
            document.getElementById('assets-protected').innerText = `${data.quantumMigration.assetsProtected}%`;
            document.getElementById('migration-bar').style.width = `${data.quantumMigration.assetsProtected}%`;
        } catch (e) { console.error(e); }
    }

    // --- AI EXECUTION PAGE LOGIC ---
    function initAIExecutionPage() {
        fetchAIStatus();
        fetchAIPerformance();
        fetchAIDecisions();
        setInterval(fetchAIDecisions, 10000); // Update feed every 10s

        // Config sliders
        const riskSl = document.getElementById('risk-slider');
        const posSl = document.getElementById('position-slider');
        if (riskSl) riskSl.addEventListener('input', e => document.getElementById('risk-value').innerText = e.target.value);
        if (posSl) posSl.addEventListener('input', e => document.getElementById('position-value').innerText = e.target.value);

        // Save config
        const btnSave = document.getElementById('btn-save-ai-config');
        if (btnSave) {
            btnSave.addEventListener('click', async () => {
                const config = {
                    strategy: document.getElementById('strategy-selector').value,
                    riskTolerance: riskSl.value,
                    positionSize: posSl.value
                };
                await fetch('/api/ai/configure', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(config)
                });
                alert('AI Configuration Saved!');
            });
        }
    }

    async function fetchAIStatus() {
        try {
            const res = await fetch('/api/ai/status');
            const data = await res.json();
            const container = document.getElementById('ai-status-display');
            if (!container) return;

            container.innerHTML = `
                <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                    <span>Status:</span><span style="color: ${data.active ? '#0f0' : '#ff0055'};">${data.active ? 'ACTIVE' : 'INACTIVE'}</span>
                </div>
                <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                    <span>Strategy:</span><span>${data.strategy}</span>
                </div>
                <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                    <span>Uptime:</span><span>${data.uptime}</span>
                </div>
                <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                    <span>Queued Actions:</span><span style="color: var(--accent-color);">${data.queuedActions}</span>
                </div>
            `;
        } catch (e) { console.error(e); }
    }

    async function fetchAIPerformance() {
        try {
            const res = await fetch('/api/ai/performance');
            const data = await res.json();

            document.getElementById('total-executions').innerText = data.totalExecutions;
            document.getElementById('success-rate').innerText = `${data.successRate}%`;
            document.getElementById('gas-savings').innerText = `${data.avgGasSavings}%`;
            document.getElementById('roi').innerText = `+${data.roi}%`;
            document.getElementById('net-profit').innerText = data.netProfit;
        } catch (e) { console.error(e); }
    }

    async function fetchAIDecisions() {
        try {
            const res = await fetch('/api/ai/decisions');
            const decisions = await res.json();
            const feed = document.getElementById('execution-feed');
            if (!feed) return;

            feed.innerHTML = decisions.map(d => `
                <div style="padding: 10px; border-bottom: 1px solid var(--glass-border); font-size: 0.85rem;">
                    <div>[${new Date(d.timestamp).toLocaleTimeString()}] ${d.action}</div>
                    <div style="color: ${d.result.includes('+') ? '#0f0' : 'var(--accent-color)'}; margin-top: 3px;">
                        → ${d.result}
                    </div>
                </div>
            `).join('');
        } catch (e) { console.error(e); }
    }

    // Navigation Logic
    const navLinks = document.querySelectorAll('nav a');
    const pages = document.querySelectorAll('.page');

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href').substring(1);

            // === CLEANUP BEFORE PAGE CHANGE ===
            stopAllPolling();  // Stop all setIntervals
            destroyChart('mfa');  // Destroy MFA chart if exists
            destroyChart('confidence');  // Destroy confidence chart if exists

            // Update Active Link
            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');

            // Update Active Page
            pages.forEach(p => {
                p.style.display = 'none';
                if (p.id === targetId) {
                    p.style.display = 'block';
                    // Initialize page-specific logic
                    if (targetId === 'biometrics') initBiometricsPage();
                    if (targetId === 'dna') initDNAPage();
                    if (targetId === 'metaverse') initMetaversePage();
                    if (targetId === 'security') initSecurityPage();
                    if (targetId === 'execution') initAIExecutionPage();
                }
            });
        });
    });
});
