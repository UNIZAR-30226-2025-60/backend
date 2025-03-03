-- TRIGGER PARA QUE SE ACTUALICE LA PUNTUACIÓN MEDIA DE UN LIBRO AUTOMÁTICAMENTE

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

-- Crear el trigger de nuevo
CREATE TRIGGER tg_actualizar_puntuacion_media
AFTER INSERT OR UPDATE OR DELETE ON opinion
FOR EACH ROW
EXECUTE FUNCTION actualizar_puntuacion_media();

-- Ajuste de la constraint en libros_lista
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
