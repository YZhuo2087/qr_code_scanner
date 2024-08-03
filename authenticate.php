<?php

include 'access_validation.php';

if (isset($_POST['credential'])) {
    $qr_data = json_decode($_POST['credential'], true);

    if (json_last_error() === JSON_ERROR_NONE) {
        $user_id = intval($qr_data['user_id']);
        $building_id = intval($qr_data['building_id']);
        $access_level = $qr_data['access_level'];
        $expire_date = $qr_data['expire_date'];

        $access_granted = check_user_access($user_id, $building_id, $access_level, $expire_date);

        header('Content-Type: application/json');
        echo json_encode(['success' => $access_granted]);
    } else {
        header('Content-Type: application/json');
        echo json_encode(['success' => false, 'error' => 'Invalid QR code data']);
    }
}

