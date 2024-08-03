<?php 

if( !session_id() )
{
    session_start();
}

if(@$_SESSION['opened'] != true){
    echo '
    <script>
    	alert("You don\'t have the access to this building");
    	self.location.replace("index.php");
    </script>';
}

?>

Welcome ! <br />