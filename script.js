// Islandcraft Client Scanner - Main JavaScript
class IslandcraftScanner {
    constructor() {
        this.knownClients = {
            'wurst': { name: 'Wurst', risk: 'high', description: 'Beliebter Hacked Client mit umfangreichen Features' },
            'meteor': { name: 'Meteor', risk: 'high', description: 'Fortgeschrittener Utility Client mit Kampf-Features' },
            'vape': { name: 'Vape', risk: 'high', description: 'Bezahlter Ghost Client entwickelt zum Umgehen von Anti-Cheat' },
            'sigma': { name: 'Sigma', risk: 'high', description: 'Feature-reicher Client mit GUI und Modulen' },
            'impact': { name: 'Impact', risk: 'medium', description: 'Utility Client mit verschiedenen Modulen' },
            'aristois': { name: 'Aristois', risk: 'medium', description: 'Mod-ähnlicher Client mit vielen Features' },
            'liquidbounce': { name: 'LiquidBounce', risk: 'high', description: 'Kostenloser Kampf Client mit Bypasses' },
            'novoline': { name: 'Novoline', risk: 'high', description: 'Kampf-fokussierter Client mit benutzerdefinierter GUI' },
            'future': { name: 'Future', risk: 'medium', description: 'Client mit verschiedenen Utility-Features' },
            'konas': { name: 'Konas', risk: 'high', description: 'Fortgeschrittener Client mit ausgefeilten Features' },
            'killaura': { name: 'KillAura', risk: 'high', description: 'Kampf-Modul gefunden in vielen Clients' },
            'fly': { name: 'Fly', risk: 'medium', description: 'Bewegungs-Hack für Fliegen' },
            'speed': { name: 'Speed', risk: 'medium', description: 'Bewegungs-Hack für erhöhte Geschwindigkeit' },
            'noslow': { name: 'NoSlow', risk: 'medium', description: 'Entfernt Verlangsamungseffekte' },
            'scaffold': { name: 'Scaffold', risk: 'medium', description: 'Automatische Block-Platzierung' },
            'xray': { name: 'X-Ray', risk: 'medium', description: 'Erz-Finder und Wallhack' },
            'antikb': { name: 'AntiKB', risk: 'medium', description: 'Rückstoß-Resistenz' },
            'reach': { name: 'Reach', risk: 'medium', description: 'Erweiterte Angriffsreichweite' },
            'crystalaura': { name: 'CrystalAura', risk: 'high', description: 'Automatische Kristall-Platzierung' },
            'autoclicker': { name: 'AutoClicker', risk: 'medium', description: 'Automatisches Klicken' }
        };

        this.suspiciousKeywords = [
            'hack', 'cheat', 'inject', 'bypass', 'ghost', 'aura', 'killaura',
            'flyhack', 'speedhack', 'xray', 'radar', 'aimbot', 'esp', 'wallhack',
            'autoclicker', 'macro', 'script', 'exploit', 'crystal', 'scaffold'
        ];

        this.scanResults = [];
        this.currentScan = null;
        this.isLargeFileMode = false;
        this.chunkSize = 1024 * 1024; // 1MB chunks
        this.maxFileSize = 1024 * 1024 * 1024; // 1GB threshold
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupNavigation();
        this.setupFAQ();
    }

    setupEventListeners() {
        const uploadArea = document.getElementById('uploadArea');
        const fileInput = document.getElementById('fileInput');
        const clearLogsBtn = document.getElementById('clearLogs');
        const exportBtn = document.getElementById('exportResults');
        const scanAgainBtn = document.getElementById('scanAgain');
        const selectAllBtn = document.getElementById('selectAllBtn');
        const selectMultipleBtn = document.getElementById('selectMultipleBtn');
        const clearSelectionBtn = document.getElementById('clearSelectionBtn');

        // File upload events
        uploadArea.addEventListener('click', () => fileInput.click());
        uploadArea.addEventListener('dragover', this.handleDragOver.bind(this));
        uploadArea.addEventListener('dragleave', this.handleDragLeave.bind(this));
        uploadArea.addEventListener('drop', this.handleDrop.bind(this));
        fileInput.addEventListener('change', this.handleFileSelect.bind(this));

        // Button events
        clearLogsBtn?.addEventListener('click', this.clearLogs.bind(this));
        exportBtn?.addEventListener('click', this.exportResults.bind(this));
        scanAgainBtn?.addEventListener('click', this.resetScanner.bind(this));
        selectAllBtn?.addEventListener('click', this.selectFolder.bind(this));
        selectMultipleBtn?.addEventListener('click', this.selectMultipleFiles.bind(this));
        clearSelectionBtn?.addEventListener('click', this.clearFileSelection.bind(this));
    }

    setupNavigation() {
        const navLinks = document.querySelectorAll('.nav-link');
        const hamburger = document.querySelector('.hamburger');
        const navMenu = document.querySelector('.nav-menu');

        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = link.getAttribute('href').substring(1);
                const targetSection = document.getElementById(targetId);
                
                if (targetSection) {
                    targetSection.scrollIntoView({ behavior: 'smooth' });
                }
            });
        });

        hamburger?.addEventListener('click', () => {
            navMenu.classList.toggle('active');
        });
    }

    setupFAQ() {
        const faqItems = document.querySelectorAll('.faq-item');
        
        faqItems.forEach(item => {
            const question = item.querySelector('.faq-question');
            
            question.addEventListener('click', () => {
                const isActive = item.classList.contains('active');
                
                // Close all FAQ items
                faqItems.forEach(faqItem => {
                    faqItem.classList.remove('active');
                });
                
                // Open clicked item if it wasn't active
                if (!isActive) {
                    item.classList.add('active');
                }
            });
        });
    }

    handleDragOver(e) {
        e.preventDefault();
        e.currentTarget.classList.add('dragover');
    }

    handleDragLeave(e) {
        e.preventDefault();
        e.currentTarget.classList.remove('dragover');
    }

    handleDrop(e) {
        e.preventDefault();
        e.currentTarget.classList.remove('dragover');
        
        const files = Array.from(e.dataTransfer.files);
        this.processFiles(files);
    }

    handleFileSelect(e) {
        const files = Array.from(e.target.files);
        this.processFiles(files);
    }

    async processFiles(files) {
        this.resetScanner();
        this.showScanProgress();
        
        // Check if we have large files
        const totalSize = Array.from(files).reduce((sum, file) => sum + file.size, 0);
        this.isLargeFileMode = totalSize > this.maxFileSize;
        
        if (this.isLargeFileMode) {
            this.addLog(`Großdatei-Modus aktiviert (${(totalSize / (1024 * 1024 * 1024)).toFixed(2)}GB)`, 'info');
            this.chunkSize = 5 * 1024 * 1024; // 5MB chunks for large files
        }
        
        const totalFiles = files.length;
        let processedFiles = 0;

        // Process files in parallel for better performance
        const batchSize = this.isLargeFileMode ? 5 : 3;
        for (let i = 0; i < files.length; i += batchSize) {
            const batch = Array.from(files).slice(i, i + batchSize);
            const promises = batch.map(file => this.scanFile(file));
            
            await Promise.allSettled(promises);
            
            processedFiles += batch.length;
            this.updateProgress((processedFiles / totalFiles) * 100, `Batch ${Math.ceil(processedFiles / batchSize)}`);
            
            // Allow UI to update between batches
            if (this.isLargeFileMode) {
                await new Promise(resolve => setTimeout(resolve, 10));
            }
        }

        this.completeScan();
    }

    async scanFile(file) {
        this.addLog(`Scanne: ${file.name} (${this.formatFileSize(file.size)})`, 'info');
        
        try {
            if (file.name.endsWith('.jar') || file.name.endsWith('.zip')) {
                if (this.isLargeFileMode) {
                    await this.scanArchiveOptimized(file);
                } else {
                    await this.scanArchive(file);
                }
            } else {
                if (this.isLargeFileMode) {
                    await this.scanRegularFileOptimized(file);
                } else {
                    await this.scanRegularFile(file);
                }
            }
        } catch (error) {
            this.addLog(`Fehler beim Scannen von ${file.name}: ${error.message}`, 'danger');
        }
    }

    async scanArchiveOptimized(file) {
        const zip = new JSZip();
        const zipContent = await zip.loadAsync(file);
        
        const entries = Object.entries(zipContent.files);
        const suspiciousFiles = entries.filter(([filename, zipEntry]) => 
            !zipEntry.dir && this.isSuspiciousFilename(filename.toLowerCase())
        );
        
        // Only scan suspicious files in large file mode
        for (const [filename, zipEntry] of suspiciousFiles.slice(0, 50)) { // Limit to 50 most suspicious
            try {
                const content = await zipEntry.async('string');
                this.analyzeFileContent(filename, content, file.name);
            } catch (error) {
                // Skip files that can't be read
                continue;
            }
        }
        
        // Quick filename scan for remaining files
        for (const [filename, zipEntry] of entries) {
            if (!zipEntry.dir && !suspiciousFiles.some(([f]) => f === filename)) {
                this.analyzeFileContent(filename, '', file.name);
            }
        }
    }

    async scanRegularFileOptimized(file) {
        // For large files, only read the first and last chunks
        const firstChunk = await this.readFileChunk(file, 0, Math.min(this.chunkSize, file.size));
        const lastChunk = file.size > this.chunkSize ? 
            await this.readFileChunk(file, file.size - this.chunkSize, this.chunkSize) : '';
        
        const content = firstChunk + '\n' + lastChunk;
        this.analyzeFileContent(file.name, content);
    }

    async readFileChunk(file, start, length) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            const blob = file.slice(start, start + length);
            
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = (e) => reject(e.target.error);
            reader.readAsText(blob);
        });
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    async scanArchive(file) {
        const zip = new JSZip();
        const zipContent = await zip.loadAsync(file);
        
        for (const [filename, zipEntry] of Object.entries(zipContent.files)) {
            if (!zipEntry.dir) {
                const content = await zipEntry.async('string');
                this.analyzeFileContent(filename, content, file.name);
            }
        }
    }

    async scanRegularFile(file) {
        const content = await file.text();
        this.analyzeFileContent(file.name, content);
    }

    analyzeFileContent(filename, content, parentArchive = null) {
        const lowerFilename = filename.toLowerCase();
        const lowerContent = content.toLowerCase();
        
        // Check for known clients
        for (const [key, client] of Object.entries(this.knownClients)) {
            if (lowerFilename.includes(key) || lowerContent.includes(key)) {
                this.addDetection({
                    type: 'known_client',
                    client: client,
                    filename: filename,
                    parentArchive: parentArchive,
                    risk: client.risk,
                    matches: [key]
                });
                return;
            }
        }

        // Check for suspicious keywords
        const foundKeywords = [];
        for (const keyword of this.suspiciousKeywords) {
            if (lowerContent.includes(keyword)) {
                foundKeywords.push(keyword);
            }
        }

        if (foundKeywords.length > 0) {
            this.addDetection({
                type: 'suspicious_content',
                filename: filename,
                parentArchive: parentArchive,
                risk: foundKeywords.length > 3 ? 'high' : foundKeywords.length > 1 ? 'medium' : 'low',
                keywords: foundKeywords
            });
        }

        // Check for suspicious file patterns
        if (this.isSuspiciousFilename(lowerFilename)) {
            this.addDetection({
                type: 'suspicious_filename',
                filename: filename,
                parentArchive: parentArchive,
                risk: 'medium',
                reason: 'Suspicious filename pattern'
            });
        }
    }

    isSuspiciousFilename(filename) {
        const suspiciousPatterns = [
            /hack/i, /cheat/i, /inject/i, /bypass/i, /crack/i,
            /mod.*hack/i, /hack.*mod/i, /client.*hack/i
        ];
        
        return suspiciousPatterns.some(pattern => pattern.test(filename));
    }

    addDetection(detection) {
        this.scanResults.push(detection);
        
        const riskColor = {
            low: 'warning',
            medium: 'warning',
            high: 'danger'
        }[detection.risk];

        let message = `ERKENNUNG: ${detection.filename}`;
        
        if (detection.type === 'known_client') {
            message += ` - Bekannter Client: ${detection.client.name}`;
            this.addLog(message, riskColor);
        } else if (detection.type === 'suspicious_content') {
            message += ` - Verdächtige Keywords: ${detection.keywords.join(', ')}`;
            this.addLog(message, riskColor);
        } else if (detection.type === 'suspicious_filename') {
            message += ` - ${detection.reason}`;
            this.addLog(message, riskColor);
        }
    }

    showScanProgress() {
        document.getElementById('uploadArea').style.display = 'none';
        document.getElementById('scanProgress').style.display = 'block';
        document.getElementById('scanLogs').style.display = 'block';
        document.getElementById('scanResults').style.display = 'none';
        
        // Show/hide performance mode indicator
        const performanceMode = document.getElementById('performanceMode');
        if (this.isLargeFileMode) {
            performanceMode.style.display = 'flex';
        } else {
            performanceMode.style.display = 'none';
        }
    }

    updateProgress(percentage, currentFile) {
        document.getElementById('progressFill').style.width = `${percentage}%`;
        document.getElementById('progressPercentage').textContent = `${Math.round(percentage)}%`;
        document.getElementById('currentFile').textContent = currentFile;
        
        // Count only medium and high risk detections
        const significantDetections = this.scanResults.filter(result => result.risk !== 'low').length;
        document.getElementById('filesCount').textContent = `${significantDetections} significant detections found`;
    }

    completeScan() {
        document.getElementById('scanProgress').style.display = 'none';
        document.getElementById('scanResults').style.display = 'block';
        this.displayResults();
        this.addLog('Scan erfolgreich abgeschlossen', 'success');
    }

    displayResults() {
        const resultsContent = document.getElementById('resultsContent');
        const resultSummary = document.getElementById('resultSummary');
        
        // Clear previous results
        resultsContent.innerHTML = '';
        resultSummary.innerHTML = '';

        // Filter out low-risk results
        const filteredResults = this.scanResults.filter(result => result.risk !== 'low');
        
        // Count results by risk level (excluding low risk)
        const riskCounts = {
            medium: 0,
            high: 0
        };

        filteredResults.forEach(result => {
            riskCounts[result.risk]++;
        });

        // Display summary
        if (filteredResults.length === 0) {
            resultSummary.innerHTML = `
                <div class="summary-item clean">
                    <i class="fas fa-check-circle"></i>
                    <span>Keine Bedrohungen erkannt</span>
                </div>
            `;
        } else {
            resultSummary.innerHTML = `
                <div class="summary-item suspicious">
                    <i class="fas fa-exclamation-triangle"></i>
                    <span>Mittleres Risiko: ${riskCounts.medium}</span>
                </div>
                <div class="summary-item detected">
                    <i class="fas fa-times-circle"></i>
                    <span>Hohes Risiko: ${riskCounts.high}</span>
                </div>
            `;
        }

        // Display individual results
        if (filteredResults.length === 0) {
            resultsContent.innerHTML = `
                <div class="result-item clean">
                    <div class="result-header">
                        <div class="result-title">
                            <i class="fas fa-check-circle"></i> Keine wesentlichen Bedrohungen erkannt
                        </div>
                        <span class="risk-badge low">Sicher</span>
                    </div>
                    <div class="result-details">
                        Deine Dateien scheinen sicher zu sein. Keine mittleren oder hohen Risiken wurden erkannt. Niedrige Risiken wurden zur Übersichtlichkeit ausgeblendet.
                    </div>
                </div>
            `;
        } else {
            filteredResults.forEach((result, index) => {
                const resultElement = this.createResultElement(result, index);
                resultsContent.appendChild(resultElement);
            });
        }
    }

    createResultElement(result, index) {
        const div = document.createElement('div');
        div.className = `result-item ${result.risk === 'high' ? 'danger' : result.risk === 'medium' ? 'warning' : 'clean'}`;
        
        let title = '';
        let details = '';

        if (result.type === 'known_client') {
            title = `<i class="fas fa-exclamation-triangle"></i> ${result.client.name} Erkannt`;
            details = `
                <strong>Datei:</strong> ${result.filename}<br>
                ${result.parentArchive ? `<strong>Archiv:</strong> ${result.parentArchive}<br>` : ''}
                <strong>Risikostufe:</strong> ${result.risk.toUpperCase()}<br>
                <strong>Beschreibung:</strong> ${result.client.description}<br>
                <strong>Übereinstimmungen:</strong> ${result.matches.join(', ')}
            `;
        } else if (result.type === 'suspicious_content') {
            title = `<i class="fas fa-search"></i> Verdächtiger Inhalt gefunden`;
            details = `
                <strong>Datei:</strong> ${result.filename}<br>
                ${result.parentArchive ? `<strong>Archiv:</strong> ${result.parentArchive}<br>` : ''}
                <strong>Risikostufe:</strong> ${result.risk.toUpperCase()}<br>
                <strong>Verdächtige Keywords:</strong> ${result.keywords.join(', ')}
            `;
        } else if (result.type === 'suspicious_filename') {
            title = `<i class="fas fa-file"></i> Verdächtiger Dateiname`;
            details = `
                <strong>Datei:</strong> ${result.filename}<br>
                ${result.parentArchive ? `<strong>Archiv:</strong> ${result.parentArchive}<br>` : ''}
                <strong>Risikostufe:</strong> ${result.risk.toUpperCase()}<br>
                <strong>Grund:</strong> ${result.reason}
            `;
        }

        div.innerHTML = `
            <div class="result-header">
                <div class="result-title">${title}</div>
                <span class="risk-badge ${result.risk}">${result.risk.toUpperCase()}</span>
            </div>
            <div class="result-details">${details}</div>
        `;

        return div;
    }

    addLog(message, type = 'info') {
        const logsContent = document.getElementById('logsContent');
        const logEntry = document.createElement('div');
        logEntry.className = `log-entry ${type}`;
        
        const timestamp = new Date().toLocaleTimeString();
        logEntry.textContent = `[${timestamp}] ${message}`;
        
        logsContent.appendChild(logEntry);
        logsContent.scrollTop = logsContent.scrollHeight;
    }

    clearLogs() {
        document.getElementById('logsContent').innerHTML = '';
    }

    exportResults() {
        const report = this.generateReport();
        const blob = new Blob([report], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `clientguard-scan-${new Date().toISOString().slice(0, 10)}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    generateReport() {
        let report = `Islandcraft Client Scanner - Scan-Bericht\n`;
        report += `Erstellt: ${new Date().toLocaleString()}\n`;
        
        // Filter out low-risk results for the report
        const significantResults = this.scanResults.filter(result => result.risk !== 'low');
        report += `Wichtige Erkennungen: ${significantResults.length}\n`;
        report += `Niedrige Risiken ausgeblendet: ${this.scanResults.length - significantResults.length}\n\n`;

        if (significantResults.length === 0) {
            report += `Status: SICHER - Keine wesentlichen Bedrohungen erkannt\n`;
            report += `Hinweis: Niedrige Risiken wurden zur Übersichtlichkeit ausgeblendet\n`;
        } else {
            report += `Status: ${significantResults.length > 0 ? 'WESENTLICHE BEDROHUNGEN ERKANNT' : 'SICHER'}\n\n`;
            
            significantResults.forEach((result, index) => {
                report += `Erkennung #${index + 1}:\n`;
                report += `  Datei: ${result.filename}\n`;
                if (result.parentArchive) {
                    report += `  Archiv: ${result.parentArchive}\n`;
                }
                report += `  Risikostufe: ${result.risk.toUpperCase()}\n`;
                report += `  Typ: ${result.type}\n`;
                
                if (result.type === 'known_client') {
                    report += `  Client: ${result.client.name}\n`;
                    report += `  Beschreibung: ${result.client.description}\n`;
                } else if (result.type === 'suspicious_content') {
                    report += `  Keywords: ${result.keywords.join(', ')}\n`;
                } else if (result.type === 'suspicious_filename') {
                    report += `  Grund: ${result.reason}\n`;
                }
                
                report += `\n`;
            });
        }

        report += `\n--- Ende des Berichts ---`;
        return report;
    }

    resetScanner() {
        this.scanResults = [];
        document.getElementById('uploadArea').style.display = 'block';
        document.getElementById('scanProgress').style.display = 'none';
        document.getElementById('scanLogs').style.display = 'none';
        document.getElementById('scanResults').style.display = 'none';
        document.getElementById('fileInput').value = '';
        this.clearLogs();
    }

    selectFolder() {
        // Create a file input that allows directory selection
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.multiple = true;
        fileInput.webkitdirectory = true;
        fileInput.directory = true;
        fileInput.accept = '.jar,.zip,application/zip,application/x-java-archive';
        
        fileInput.addEventListener('change', (e) => {
            const files = Array.from(e.target.files);
            if (files.length > 0) {
                this.addLog(`${files.length} Dateien aus Ordner ausgewählt`, 'info');
                this.processFiles(files);
            }
        });
        
        fileInput.click();
    }

    selectMultipleFiles() {
        // Create a file input for multiple file selection
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.multiple = true;
        fileInput.accept = '.jar,.zip,application/zip,application/x-java-archive';
        
        fileInput.addEventListener('change', (e) => {
            const files = Array.from(e.target.files);
            if (files.length > 0) {
                this.addLog(`${files.length} Dateien ausgewählt`, 'info');
                this.processFiles(files);
            }
        });
        
        fileInput.click();
    }

    clearFileSelection() {
        const fileInput = document.getElementById('fileInput');
        fileInput.value = '';
        this.addLog('Dateiauswahl gelöscht', 'info');
        
        // Show a visual feedback
        const uploadArea = document.getElementById('uploadArea');
        uploadArea.style.borderColor = 'var(--border-color)';
        setTimeout(() => {
            uploadArea.style.borderColor = '';
        }, 1000);
    }

    async processFiles(files) {
        this.resetScanner();
        this.showScanProgress();
        
        const totalFiles = files.length;
        let processedFiles = 0;

        for (const file of files) {
            await this.scanFile(file);
            processedFiles++;
            this.updateProgress((processedFiles / totalFiles) * 100, file.name);
        }

        this.completeScan();
    }
}

// Initialize the scanner when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new IslandcraftScanner();
});

// Add some visual enhancements
document.addEventListener('DOMContentLoaded', () => {
    // Add typing effect to hero title
    const heroTitle = document.querySelector('.glitch');
    if (heroTitle) {
        heroTitle.style.animation = 'none';
        setTimeout(() => {
            heroTitle.style.animation = '';
        }, 100);
    }

    // Add parallax effect to hero visual
    const heroVisual = document.querySelector('.hero-visual');
    if (heroVisual) {
        window.addEventListener('scroll', () => {
            const scrolled = window.pageYOffset;
            const rate = scrolled * -0.5;
            heroVisual.style.transform = `translateY(${rate}px)`;
        });
    }

    // Add smooth reveal animations for feature cards
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    document.querySelectorAll('.feature-card').forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(card);
    });
});
