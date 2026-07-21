<?php

class Database{

    private $host = "localhost";
    private $dbname = "bd_contacto";
    private $user = "root";
    private $pass = "";

    public $conn;

    public function getConnection(){
         $this->conn = null;
            try{
                $this->conn = new PDO("mysql:host=" .$this->host.";dbname="
                .$this->dbname,$this->user,$this->pass);
                $this->conn->exec("SET NAMES utf8");
            } catch (Exception $e){
                echo "El error es:".$e->getMessage();
            }

         return $this->conn;
    }
}

?>