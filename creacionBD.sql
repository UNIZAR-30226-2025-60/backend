-- Tabla de TEMAS (categorías)
CREATE TABLE TEMA (
    tematica VARCHAR(100) PRIMARY KEY
);

-- Tabla de LIBROS
CREATE TABLE LIBRO (
    enlace TEXT PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    autor VARCHAR(255) NOT NULL,
    fecha_publicacion DATE NOT NULL,
    resumen TEXT,
    imagen_portada TEXT,
    num_paginas INT,
    num_palabras INT,
    horas_lectura INT,
    contador_lecturas INT,
    puntuacion_media FLOAT DEFAULT 0,
    tema_asociado VARCHAR(100) REFERENCES TEMA(tematica)
);

-- Tabla de USUARIOS
CREATE TABLE USUARIO (
    correo VARCHAR(255) PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    contrasena TEXT NOT NULL,
    foto_perfil TEXT
);

-- Tabla de IMAGENES (portadas de libros, fotos de usuarios)
CREATE TABLE IMAGEN (
    url TEXT PRIMARY KEY
);

-- Tabla de LISTAS (listas de usuarios)
CREATE TABLE LISTA (
    nombre VARCHAR(255),
    usuario_id VARCHAR(255) REFERENCES USUARIO(correo),
    descripcion TEXT,
    publica BOOLEAN DEFAULT FALSE,
    portada TEXT REFERENCES IMAGEN(url),
    PRIMARY KEY (nombre, usuario_id)
);

CREATE TABLE libros_lista (
  usuario_id VARCHAR(255) REFERENCES USUARIO(correo),
  nombre_lista VARCHAR(255),
  enlace_libro TEXT REFERENCES LIBRO(enlace) ON DELETE CASCADE,
  PRIMARY KEY (usuario_id, nombre_lista, enlace_libro),
  FOREIGN KEY (usuario_id, nombre_lista) REFERENCES LISTA(usuario_id, nombre) ON DELETE CASCADE
);

-- Tabla de relación N:M entre USUARIOS y LIBROS (lectura en proceso)
CREATE TABLE en_proceso (
    usuario_id VARCHAR(255) REFERENCES USUARIO(correo) ON DELETE CASCADE,
    libro_id TEXT REFERENCES LIBRO(enlace) ON DELETE CASCADE,
    pagina INT DEFAULT 1,
    PRIMARY KEY (usuario_id, libro_id)
);

-- Tabla de relación N:M entre USUARIOS y LIBROS (leídos)
CREATE TABLE leidos (
    usuario_id VARCHAR(255) REFERENCES USUARIO(correo) ON DELETE CASCADE,
    libro_id TEXT REFERENCES LIBRO(enlace) ON DELETE CASCADE,
    fecha_fin_lectura TIMESTAMP DEFAULT CURRENT_TIMESTAMP, --guarda automatico cuando se inserta, podría sernos útil para las estadísticas
    PRIMARY KEY (usuario_id, libro_id)
);

-- Tabla de OPINIONES (reseñas de libros)
CREATE TABLE OPINION (
    usuario_id VARCHAR(255) REFERENCES USUARIO(correo),
    libro_id TEXT REFERENCES LIBRO(enlace),
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    titulo_resena VARCHAR(255),
    mensaje TEXT NOT NULL,
    valor INT CHECK (valor BETWEEN 1 AND 5),
    PRIMARY KEY (usuario_id, libro_id, fecha)
);


-- Tabla de PREGUNTAS en el FORO
CREATE TABLE PREGUNTA (
    id SERIAL PRIMARY KEY,  -- Identificador autogenerado
    cuestion TEXT NOT NULL,
    usuario_id VARCHAR(255) REFERENCES USUARIO(correo) ON DELETE CASCADE,
    fecha_mensaje TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- Tabla de RESPUESTAS en el FORO
CREATE TABLE RESPUESTA (
    id SERIAL PRIMARY KEY,  -- Identificador autogenerado para la respuesta
    mensaje_respuesta TEXT NOT NULL,
    pregunta_id INT NOT NULL REFERENCES PREGUNTA(id) ON DELETE CASCADE,  -- Relación con la pregunta
    usuario_respuesta VARCHAR(255) REFERENCES USUARIO(correo) ON DELETE CASCADE,
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
