-- ========================================================
-- TRIGGER PARA QUE SE ACTUALICE LA PUNTUACIÓN MEDIA DE UN LIBRO AUTOMÁTICAMENTE
-- ========================================================

-- Eliminar la función y el trigger si ya existen
DROP TRIGGER IF EXISTS tg_actualizar_puntuacion_media ON opinion CASCADE;
DROP FUNCTION IF EXISTS actualizar_puntuacion_media() CASCADE;

-- Crear/Reemplazar la función
CREATE OR REPLACE FUNCTION actualizar_puntuacion_media()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
    enlace_afectado TEXT;
BEGIN
    IF (TG_OP = 'DELETE') THEN
        enlace_afectado := OLD.libro_id;
    ELSE
        enlace_afectado := NEW.libro_id;
    END IF;
       
    UPDATE libro
    SET puntuacion_media = (
        SELECT COALESCE(AVG(valor), 0)
        FROM opinion
        WHERE libro_id = enlace_afectado
    )
    WHERE enlace = enlace_afectado;
    
    RETURN NEW;
END;
$$;

-- Crear el trigger
CREATE TRIGGER tg_actualizar_puntuacion_media
AFTER INSERT OR UPDATE OR DELETE ON opinion
FOR EACH ROW
EXECUTE FUNCTION actualizar_puntuacion_media();

-- ========================================================
-- AJUSTE DE LA CONSTRAINT EN libros_lista
-- ========================================================

BEGIN;

ALTER TABLE "libros_lista"
  DROP CONSTRAINT IF EXISTS "libros_lista_usuario_id_nombre_lista_fkey";

ALTER TABLE "libros_lista"
  ADD CONSTRAINT "libros_lista_usuario_id_nombre_lista_fkey"
  FOREIGN KEY ("usuario_id", "nombre_lista")
  REFERENCES "lista"("usuario_id", "nombre")
  ON UPDATE CASCADE
  ON DELETE CASCADE;

COMMIT;

-- ========================================================
-- TRIGGER PARA CREAR LISTAS AUTOMÁTICAMENTE AL CREAR UN USUARIO
-- ========================================================

-- Eliminar el trigger y la función si ya existen
DROP TRIGGER IF EXISTS trigger_crear_listas_usuario ON usuario;
DROP FUNCTION IF EXISTS crear_listas_usuario() CASCADE;

-- Crear o reemplazar la función para insertar las listas por defecto
CREATE OR REPLACE FUNCTION crear_listas_usuario()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    INSERT INTO lista (nombre, usuario_id, descripcion, publica)
    VALUES 
      ('Mis Favoritos', NEW.correo, 'Lista de mis favoritos', false),
      ('Leídos', NEW.correo, 'Lista de libros leídos', false),
      ('En proceso', NEW.correo, 'Lista de libros en proceso', false);
      
    RETURN NEW;
END;
$$;

-- Crear el trigger que se ejecute después de insertar en la tabla usuario
CREATE TRIGGER trigger_crear_listas_usuario
AFTER INSERT ON usuario
FOR EACH ROW
EXECUTE FUNCTION crear_listas_usuario();