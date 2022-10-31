SET timezone = 'America/Santiago';

DROP DATABASE IF EXISTS sopaipillas;
CREATE DATABASE sopaipillas;
\c sopaipillas;
CREATE TABLE miembros (
    rut int NOT NULL,
    nombre varchar NOT NULL,
    apellido varchar NOT NULL,
    email varchar NOT NULL,
    patenteCar varchar NOT NULL,
    premium varchar NOT NULL,
    PRIMARY KEY (rut)
);

CREATE TABLE carritos (
    patente varchar NOT NULL,
    ubicacion int NOT NULL,
    stock int NOT NULL,
    autorepo int NOT NULL,
    PRIMARY KEY (patente)
);

CREATE TABLE ventas (
    id SERIAL NOT NULL,
    cliente int NOT NULL,
    patente varchar NOT NULL,
    cant int NOT NULL,
    hora timestamp NOT NULL,
    stock int NOT NULL,
    ubi int NOT NULL,
    PRIMARY KEY (id)
);

CREATE TABLE reportes(
    id SERIAL NOT NULL,
    patente varchar NOT NULL,
    ubi int NOT NULL,
    PRIMARY KEY (id)
);