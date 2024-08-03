<?php

function check_user_access($user_id, $building_id, $access_level, $expire_date)
{
    // Create connection
    $conn = new mysqli("localhost", "root", "6789@jkl", "apartment_access_control", 3306);

    // Check connection
    if ($conn->connect_error) {
        die("Connection failed: " . $conn->connect_error);
    }

    $sql = "SELECT * FROM access_key WHERE user_id = ? AND building_id = ? AND access_level = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("iis", $user_id, $building_id, $access_level);
    $stmt->execute();
    $result = $stmt->get_result();
    $has_access = false;

    if ($result->num_rows > 0) {
        while ($row = $result->fetch_assoc()) {
            if (strtotime($row["expire_date"]) >= strtotime($expire_date)) {
                $has_access = in_array($row["access_level"], ['guest', 'resident', 'admin', 'security']);
            }
        }
    }

    $stmt->close();
    $conn->close();

    return $has_access;
}


