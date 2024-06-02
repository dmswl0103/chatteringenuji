
DROP DATABASE IF EXISTS chatdb;
DROP USER IF EXISTS '202301513user'@'localhost'; 
create user '202301513user'@'localhost' identified with mysql_native_password by '202301513pw';
create database chatdb;
use chatdb;
grant all privileges on chatdb.* to '202301513user'@'localhost' with grant option;
commit;
ALTER USER '202301513user'@'localhost' IDENTIFIED WITH mysql_native_password BY '202301513pw';


create table signup(
	id int auto_increment primary key,
    user_id varchar(20) unique,
    pw varchar(20)
    );
    
create table chatroom( 
	id int auto_increment primary key,
    room varchar(20) unique,
    users json
    );

create table chat(
	timestamp varchar(50),
    user_id varchar(20),
    room varchar(20),
    message varchar(200),
    primary key	(timestamp),
    FOREIGN KEY (user_id) references signup(user_id),
    foreign key (room) references chatroom(room)
    );


