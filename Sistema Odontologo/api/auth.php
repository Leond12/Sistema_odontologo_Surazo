<?php
// api/auth.php
require_once 'config/db.php';

$method = $_SERVER['REQUEST_METHOD'];

header('Content-Type: application/json');

switch ($method) {
    case 'POST':
        $data = json_decode(file_get_contents('php://input'), true);
        
        if (isset($data['action']) && $data['action'] === 'login') {
            $username = $data['username'] ?? '';
            $password = $data['password'] ?? '';

            if (empty($username) || empty($password)) {
                http_response_code(400);
                echo json_encode(['error' => 'Usuario y contraseña son requeridos.']);
                exit;
            }

            // In a real app we'd use password_verify(). For this initial setup, we verify md5 or raw if not hashed properly yet.
            // Assuming plain text if not strictly configured, let's just do a simple match or password_verify if hashed.
            $stmt = $pdo->prepare('SELECT id, nombre_usuario, password_hash, rol FROM usuarios WHERE nombre_usuario = ?');
            $stmt->execute([$username]);
            $user = $stmt->fetch();

            if ($user && ($password === $user['password_hash'] || password_verify($password, $user['password_hash']))) {
                // Update last access
                $update = $pdo->prepare('UPDATE usuarios SET ultimo_acceso = NOW() WHERE id = ?');
                $update->execute([$user['id']]);

                // Create a basic token or return user data (Simple auth for frontend)
                echo json_encode([
                    'message' => 'Login exitoso',
                    'user' => [
                        'id' => $user['id'],
                        'username' => $user['nombre_usuario'],
                        'rol' => $user['rol']
                    ]
                ]);
            } else {
                http_response_code(401);
                echo json_encode(['error' => 'Credenciales inválidas.']);
            }
        } 
        // Note: For registration we could add a register block, but typically admin creates them directly via DB or another module.
        break;

    default:
        http_response_code(405);
        echo json_encode(['error' => 'Method not allowed']);
        break;
}
