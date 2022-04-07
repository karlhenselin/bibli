<?php
header("Access-Control-Allow-Origin: *");

require_once "functions.php";
$link = fnOpenDB();
if ($_SERVER['REQUEST_METHOD'] == "POST") {
    if (isset($_POST["puzzleId"])) {
        $puzzleId = $_POST["puzzleId"];
        if (is_numeric($puzzleId)) {
            if (isset($_POST["text"])) {
                store($puzzleId, $_POST["text"], $link);
                mysqli_close($link);
            } else {
            }
        } else {

        }
    }
} else {
    if (isset($_GET["puzzleId"])) {
        $puzzleId = $_GET["puzzleId"];
        if (is_numeric($puzzleId)) {
            retrieve($puzzleId, $link);
            mysqli_close($link);
        } else {
            die("Bad puzzleId.");
        }
    } else {
        die("Missing puzzleId.");
    }
}
