<?php
// Configurações gerais do sistema
define('APP_NAME', 'Sistema de Gestão Comercial - Gráfica');
define('APP_VERSION', '1.0.0');
define('BASE_URL', 'https://seudominio.com.br/crm/');

// Configurações de segurança
define('SESSION_LIFETIME', 3600); // 1 hora
define('MAX_LOGIN_ATTEMPTS', 5);
define('LOGIN_TIMEOUT', 900); // 15 minutos

// Timezone
date_default_timezone_set('America/Sao_Paulo');

// Iniciar sessão segura
ini_set('session.cookie_httponly', 1);
ini_set('session.cookie_secure', 1);
ini_set('session.use_only_cookies', 1);
session_start();

// Regenerar ID de sessão periodicamente
if (!isset($_SESSION['created'])) {
    $_SESSION['created'] = time();
} else if (time() - $_SESSION['created'] > 1800) {
    session_regenerate_id(true);
    $_SESSION['created'] = time();
}
