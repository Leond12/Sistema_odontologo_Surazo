<?php
// api/pacientes.php
require_once 'config/db.php';

$method = $_SERVER['REQUEST_METHOD'];
$action = isset($_GET['action']) ? $_GET['action'] : '';

header('Content-Type: application/json');

switch ($method) {
    case 'GET':
        if (isset($_GET['id'])) {
            $stmt = $pdo->prepare('SELECT * FROM pacientes WHERE id = ?');
            $stmt->execute([$_GET['id']]);
            echo json_encode($stmt->fetch());
        } else {
            $stmt = $pdo->query('SELECT * FROM pacientes ORDER BY id DESC');
            echo json_encode($stmt->fetchAll());
        }
        break;

    case 'POST':
        $data = json_decode(file_get_contents('php://input'), true);
        $stmt = $pdo->prepare('INSERT INTO pacientes (nombre, apellido, dni_nie, telefono, email, direccion) VALUES (?, ?, ?, ?, ?, ?)');
        try {
            $stmt->execute([$data['nombre'], $data['apellido'], $data['dni_nie'], $data['telefono'], $data['email'], $data['direccion']]);
            echo json_encode(['id' => $pdo->lastInsertId(), 'message' => 'Paciente creado exitosamente.']);
        } catch (\PDOException $e) {
            http_response_code(400);
            echo json_encode(['error' => $e->getMessage()]);
        }
        break;

    case 'PUT':
        $data = json_decode(file_get_contents('php://input'), true);
        if(!isset($_GET['id'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Missing ID in URL']);
            break;
        }
        $id = $_GET['id'];
        $stmt = $pdo->prepare('UPDATE pacientes SET nombre = ?, apellido = ?, dni_nie = ?, telefono = ?, email = ?, direccion = ? WHERE id = ?');
        try {
            $stmt->execute([$data['nombre'], $data['apellido'], $data['dni_nie'], $data['telefono'], $data['email'], $data['direccion'], $id]);
            echo json_encode(['message' => 'Paciente actualizado exitosamente.']);
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
        $stmt = $pdo->prepare('DELETE FROM pacientes WHERE id = ?');
        try {
            $stmt->execute([$id]);
            echo json_encode(['message' => 'Paciente eliminado exitosamente.']);
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
