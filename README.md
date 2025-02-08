# frontend-movil
TUTORIAL
    PASO Nº0
        git pull origin main
    PASO Nº1
        Nos metemos en la carpeta en la que queremos trabajar (backend, frontend-movil, frontend-web) cd backend.
    PASO Nº2
        Creamos SIEMPRE una rama para trabajar en local, es decir, los cambios que hagas en los archivos y los que creas o destruyes solo se hace en local.
        git checkout -b nombreRama
        Siendo nombreRama el nombre que tu quieras, con el checkout te cambias de rama y con el -b creas la rama.
        Si solo quieres cambiarte de rama git checkout nombreADondeVas
        Y si solo quieres crear rama git branch nuevaRama, siendo nuevaRama el nombre de la que creas.
        Y si solo quieres ver en que rama estas git branch y te saldra con asterisco o en verde en la que estás.

    PASO Nº3
        Ahora podemos comprobar en la rama en la que estamos git branch, y tendrá que ser la que hemos creado anteriormente.
        Si coincide ya estamos en disposición de empezar a modificar, añadir o eliminar ficheros.

        Una vez acabemos con nuestra tarea tendremos que guardar los cambios (en nuestra rama)
        1- git add .
        2- git commit -m “Cambio”
        3- git push origin nombreRama
        Ahora ya tenemos los cambios que hemos hecho en local subidos a una rama, pero esta no es la rama main a la que todos tienen acceso.

    PASO Nº4
        Ahora haremos un  git checkout main para volver a la rama main(la compartida entre todos) y con git pull origin main me bajo los posibles cambios. Unimos nuestra rama con la compartida, git merge ramaPrueba y git push origin main (subes los cambios definitivamente a lo compartido por todos)





    git pull origin main(te bajas lo último que ha hecho alguien)
    git checkout -b ramaPrueba (Creas la rama con el -b y te cambias a la vez con el checkout).
    //modifico lo que quiera
    git add . (para guardar todos los cambios que has hecho).
    git commit -m “Cambio”
    git push origin ramaPrueba
    git checkout main (te cambias a la rama principal).
    git pull origin main (para bajarte los cambios de la rama que especificas despues del origin).
    git merge ramaPrueba (“fusionas la rama”).
    git push origin main (subes los cambios definitivamente).
