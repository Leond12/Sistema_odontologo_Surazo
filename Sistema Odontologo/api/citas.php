<?php
// api/citas.php
require_once 'config/db.php';

$method = $_SERVER['REQUEST_METHOD'];

header('Content-Type: application/json');

switch ($method) {
    case 'GET':
        if (isset($_GET['id'])) {
            $stmt = $pdo->prepare('
                SELECT c.*, p.nombre, p.apellido 
                FROM citas c 
                JOIN pacientes p ON c.paciente_id = p.id 
                WHERE c.id = ?
            ');
            $stmt->execute([$_GET['id']]);
            echo json_encode($stmt->fetch());
        } else {
            $stmt = $pdo->query('
                SELECT c.*, p.nombre, p.apellido 
                FROM citas c 
                JOIN pacientes p ON c.paciente_id = p.id 
                ORDER BY c.fecha_hora ASC
            ');
            echo json_encode($stmt->fetchAll());
        }
        break;

    case 'POST':
        $data = json_decode(file_get_contents('php://input'), true);
        $stmt = $pdo->prepare('INSERT INTO citas (paciente_id, fecha_hora, motivo, estado) VALUES (?, ?, ?, ?)');
        try {
            $stmt->execute([
                $data['paciente_id'], 
                $data['fecha_hora'], 
                $data['motivo'] ?? null, 
                $data['estado'] ?? 'pendiente'
            ]);
            echo json_encode(['id' => $pdo->lastInsertId(), 'message' => 'Cita creada exitosamente.']);
        } catch (\PDOException $e) {
            http_response_code(400);
            echo json_encode(['error' => $e->getMessage()]);
        }
        break;

    case 'PUT':
        $data = json_decode(file_get_contents('php://input'), true);
        if(!isset($_GET['id'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Missing ID']);
            break;
        }
        $id = $_GET['id'];
        $stmt = $pdo->prepare('UPDATE citas SET paciente_id = ?, fecha_hora = ?, motivo = ?, estado = ? WHERE id = ?');
        try {
            $stmt->execute([
                $data['paciente_id'], 
                $data['fecha_hora'], 
                $data['motivo'] ?? null, 
                $data['estado'] ?? 'pendiente', 
                $id
            ]);
            echo json_encode(['message' => 'Cita actualizada exitosamente.']);
        } catch (\PDOException $e) {
            http_response_code(400);
            echo json_encode(['error' => $e->getMessage()]);
        }
        break;

    case 'DELETE':
        if(!isset($_GET['id'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Missing ID in URL']);
            break;
        }
        $id = $_GET['id'];
        $stmt = $pdo->prepare('DELETE FROM citas WHERE id = ?');
        try {
            $stmt->execute([$id]);
            echo json_encode(['message' => 'Cita eliminada exitosamente.']);
        } catch (\PDOException $e) {
            http_response_code(400);
            echo json_encode(['error' => $e->getMessage()]);
        }
        break;

    default:
        http_response_code(405);
        echo json_encode(['error' => 'Method not allowed']);
        break;
}
