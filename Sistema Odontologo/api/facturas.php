<?php
// api/facturas.php
require_once 'config/db.php';

$method = $_SERVER['REQUEST_METHOD'];

header('Content-Type: application/json');

switch ($method) {
    case 'GET':
        if (isset($_GET['id'])) {
            // Get single invoice with its details
            $stmt = $pdo->prepare('
                SELECT f.*, p.nombre, p.apellido 
                FROM facturas f 
                JOIN pacientes p ON f.paciente_id = p.id 
                WHERE f.id = ?
            ');
            $stmt->execute([$_GET['id']]);
            $factura = $stmt->fetch();

            if ($factura) {
                // Get details
                $stmtDet = $pdo->prepare('SELECT * FROM factura_detalles WHERE factura_id = ?');
                $stmtDet->execute([$factura['id']]);
                $factura['detalles'] = $stmtDet->fetchAll();
                
                echo json_encode($factura);
            } else {
                http_response_code(404);
                echo json_encode(['error' => 'Factura no encontrada.']);
            }
        } else {
            // Get all invoices
            $stmt = $pdo->query('
                SELECT f.*, p.nombre, p.apellido 
                FROM facturas f 
                JOIN pacientes p ON f.paciente_id = p.id 
                ORDER BY f.fecha_emision DESC
            ');
            echo json_encode($stmt->fetchAll());
        }
        break;

    case 'POST':
        $data = json_decode(file_get_contents('php://input'), true);
        
        try {
            $pdo->beginTransaction();

            $numero_factura = 'FAC-' . time(); // Simple random unique invoice number

            // Insert Invoice Header
            $stmt = $pdo->prepare('INSERT INTO facturas (paciente_id, numero_factura, subtotal, impuestos, total, estado_pago, metodo_pago) VALUES (?, ?, ?, ?, ?, ?, ?)');
            $stmt->execute([
                $data['paciente_id'],
                $numero_factura,
                $data['subtotal'] ?? 0,
                $data['impuestos'] ?? 0,
                $data['total'] ?? 0,
                $data['estado_pago'] ?? 'pendiente',
                $data['metodo_pago'] ?? null
            ]);
            $factura_id = $pdo->lastInsertId();

            // Insert Details
            if (isset($data['detalles']) && is_array($data['detalles'])) {
                $stmtDet = $pdo->prepare('INSERT INTO factura_detalles (factura_id, descripcion, cantidad, precio_unitario) VALUES (?, ?, ?, ?)');
                foreach ($data['detalles'] as $detalle) {
                    $stmtDet->execute([
                        $factura_id,
                        $detalle['descripcion'],
                        $detalle['cantidad'] ?? 1,
                        $detalle['precio_unitario'] ?? 0
                    ]);
                }
            }

            $pdo->commit();
            echo json_encode(['id' => $factura_id, 'numero_factura' => $numero_factura, 'message' => 'Factura generada exitosamente.']);
        } catch (\PDOException $e) {
            $pdo->rollBack();
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
        
        // Simple update for state / payment method
        $stmt = $pdo->prepare('UPDATE facturas SET estado_pago = ?, metodo_pago = ? WHERE id = ?');
        try {
            $stmt->execute([
                $data['estado_pago'] ?? 'pagado',
                $data['metodo_pago'] ?? 'efectivo',
                $id
            ]);
            echo json_encode(['message' => 'Estado de factura actualizado.']);
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
        $stmt = $pdo->prepare('DELETE FROM facturas WHERE id = ?');
        try {
            $stmt->execute([$id]);
            echo json_encode(['message' => 'Factura anulada/eliminada exitosamente.']);
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
