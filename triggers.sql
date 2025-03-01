-- TRIGGER PARA QUE SE ACTUALICE LA PUNTUACIÓN MEDIA DE UN LIBRO AUTOMÁTICAMENTE
-- FUNCIONAAAAAA
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


CREATE TRIGGER tg_actualizar_puntuacion_media
AFTER INSERT OR UPDATE OR DELETE ON OPINION
FOR EACH ROW
EXECUTE FUNCTION actualizar_puntuacion_media();