<?php
class Auth {
    
    public static function verificarLogin() {
        if (!isset($_SESSION['usuario_id'])) {
            header('Location: ' . BASE_URL . 'login.php');
            exit();
        }
        
        // Verificar timeout de sessão
        if (isset($_SESSION['ultimo_acesso'])) {
            if (time() - $_SESSION['ultimo_acesso'] > SESSION_LIFETIME) {
                self::logout();
            }
        }
        $_SESSION['ultimo_acesso'] = time();
    }
    
    public static function verificarPerfil($perfil_requerido) {
        self::verificarLogin();
        if ($_SESSION['usuario_perfil'] !== $perfil_requerido && $_SESSION['usuario_perfil'] !== 'administrador') {
            header('Location: ' . BASE_URL . 'dashboard.php');
            exit();
        }
    }
    
    public static function login($email, $senha) {
        $db = new Database();
        $conn = $db->getConnection();
        
        // Verificar se usuário está bloqueado
        $stmt = $conn->prepare("SELECT * FROM usuarios WHERE email = ? AND ativo = 1");
        $stmt->execute([$email]);
        $usuario = $stmt->fetch();
        
        if (!$usuario) {
            return ['sucesso' => false, 'mensagem' => 'Usuário ou senha inválidos'];
        }
        
        // Verificar bloqueio
        if ($usuario['bloqueado_ate'] && strtotime($usuario['bloqueado_ate']) > time()) {
            return ['sucesso' => false, 'mensagem' => 'Usuário temporariamente bloqueado'];
        }
        
        // Verificar senha
        if (password_verify($senha, $usuario['senha'])) {
            // Login bem-sucedido
            $stmt = $conn->prepare("UPDATE usuarios SET tentativas_login = 0, bloqueado_ate = NULL WHERE id = ?");
            $stmt->execute([$usuario['id']]);
            
            session_regenerate_id(true);
            $_SESSION['usuario_id'] = $usuario['id'];
            $_SESSION['usuario_nome'] = $usuario['nome'];
            $_SESSION['usuario_email'] = $usuario['email'];
            $_SESSION['usuario_perfil'] = $usuario['perfil'];
            $_SESSION['ultimo_acesso'] = time();
            $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
            
            return ['sucesso' => true];
        } else {
            // Incrementar tentativas
            $tentativas = $usuario['tentativas_login'] + 1;
            $bloqueado_ate = null;
            
            if ($tentativas >= MAX_LOGIN_ATTEMPTS) {
                $bloqueado_ate = date('Y-m-d H:i:s', time() + LOGIN_TIMEOUT);
            }
            
            $stmt = $conn->prepare("UPDATE usuarios SET tentativas_login = ?, bloqueado_ate = ? WHERE id = ?");
            $stmt->execute([$tentativas, $bloqueado_ate, $usuario['id']]);
            
            return ['sucesso' => false, 'mensagem' => 'Usuário ou senha inválidos'];
        }
    }
    
    public static function logout() {
        session_unset();
        session_destroy();
        header('Location: ' . BASE_URL . 'login.php');
        exit();
    }
    
    public static function gerarCSRFToken() {
        if (!isset($_SESSION['csrf_token'])) {
            $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
        }
        return $_SESSION['csrf_token'];
    }
    
    public static function verificarCSRFToken($token) {
        return isset($_SESSION['csrf_token']) && hash_equals($_SESSION['csrf_token'], $token);
    }
}
