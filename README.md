# ser-servidor-web

## Instalar nginX

Empezamos de forma similar a como lo hacemos siempre, actualizando los paquetes de nuestro sistema:

> `sudo apt update`
>
> `sudo apt upgrade`

Hecho esto, instalamos nginx desde los repositorios de Ubuntu. 

> `sudo apt install nginx`

_Nota: Si miramos la web oficial de nginx, nos dará otra forma de instalación. Seguir estas instrucciones nos hará una instalación con una estructura de ficheros diferente. Se puede lograr lo mismo que en esta práctica, pero habrá que cambiar las rutas de los ficheros que aquí se enumeran._

## Primera parte: un solo servidor para una sola página

En Ubuntu, nginx tiene el fichero de configuración dividido entre varias ubicaciones:

- `/etc/nginx/nginx.conf` es el fichero principal de configuración. En él, se detallan los parámetros más generales, como los ficheros de log, qué modulos se cargan en el servidor o dónde encontrar el resto de ficheros de configuración.
- Hablando de dichos ficheros, `/etc/nginx/sites-enabled/` contine esos ficheros de configuración para cada virtual host que queramos crear. Por defecto, existe un `default` sobre el que podemos empezar trabajando.
- Un directorio relacionado con al anterior es `/etc/nginx/sites-available`. La diferencia entre ambos es que los ficheros de configuración de este directorio no se leen, por lo que mover un fichero de configuración de virtual host de `sites-enabled` a `sites-available` es una manera rápida de dar de baja una página (y moverlo en sentido contrario, una manera de darla de alta).

Entramos por tanto a modificar `/etc/nginx/sites-enabled/default`.

Vamos a ir, paso por paso, cumpliendo con los requisitos de la práctica:

### Deberá servir contenido estático alojado en el directorio `/var/www/`

Cambiamos la línea que incluye la instrucción `root`: cambiamos `root /var/www/html;` por `root /var/www/`

**Nota: Cada vez que modifiquemos algún fichero de configuración de nginx deberemos reiniciar el servidor para aplicar los cambios. Podemos usar `sudo systemctl reload nginx`**

Dos pasos más. Primero, deberíamos borrar el directorio `/var/www/html` y su contenido. Además, deberíamos comprobar los permisos de `/var/www`.

### Crear un fichero index.html que ser sirva desde http://\<IP de tu servidor\>. Un html sencillo servirá (no es el objetivo de esta práctica ver qué tal programas en HTML).

El fichero que hayamos creado deberemos guardarlo en `/var/www/` con un nombre que sea `index.html` (o alguno de los otros similares que se especifiquen en la instrucción `index` de nuestro fichero de configuración).

### Clona el repositorio siguiente https://github.com/pmolrua/Chrono y que tu servidor muestre la página web del repositorio en la siguiente dirección web: http://\<IP de tu servidor\>/Chrono

Para clonar un repositorio, deberemos hacer un `git clone` en alguna carpeta del sistema y copiaremos todo el contenido del repositorio en una subcarpeta de aquella en la que hayamos hecho el comando. Como no queremos servir en nuestro servidor _todo_ lo que incluye el repositorio de git, es mejor práctica clonar el repo en otra carpeta y copiar solo lo que queramos a nuestra carpeta root:

> `cd ~`
>
> `git clone https://github.com/pmolrua/Chrono`
>
> `sudo cp -r Chrono/ /var/www/`
>
> `sudo rm -r /var/www/.git`
>
> `sudo rm -r /var/www/CNAME`


### En http://<IP de tu servidor>/test.php guarda el fichero test.php que puedes descargarte de esta práctica y configura el servidor para que funcione PHP.

Deberemos mover el fichero test.php que nos hemos descargado del aula virtual a `/var/www/` y, además, configurar nuestro servidor para funcionar con PHP.

A diferencia de Apache, nginx NO viene de serie con un intérprete de PHP, por lo que deberemos instalarlo. Necesitamos el PHP FPM (_FastCGI Process Manager_ siendo FastCGI un protocolo para comunicar programas intérpretes con servidores web). Para instalarlo, ejecutamos el siguiente comando **y nos fijamos en qué versión nos instala**:

> `sudo apt install php-fpm`

En mi caso, instala la php8.1-fpm, por lo que en el resto de este manual se utilizará dicha versión (debiéndose cambiar toda referencia a esa versión por la correspondiente si no coincide con la de tu sistema).

Instalado el intérprete de PHP, vamos a la configuración de nuestro sitio para activar PHP.

1. Editamos `/etc/nginx/sites-enabled/default`
2. Buscamos el bloque comentado que lleva como título: _pass PHP scripts to FastCGI server_
3. En él, descomentamos las líneas que empiezan por `location...`, `include...`, `fastcgi_pass unix...` y la llave del final.
4. En la línea de `fastcgi_passfastcgi_pass` cambiamos el número de versión por defecto (7.4) por la nuestra (8.1 o la que hayas instalado en el paso anterior).

Recargamos el servidor con `systemctl` y ya deberíamos poder visualizar el contenido interpretado de test.php

### Descarga el fichero 404.html y configura nginx para que muestre dicho fichero cuando se acceda a una url que no existe (y solo en ese caso, no directamente).

Antes de desarrollar la respuesta, una cuestión sobre la parte final del enunciado, porque el enunciado no termina de tener sentido. Si no se puede acceder directamente al fichero de 404.html, ¿qué debería mostar al intentar acceder? Un error... ¿como el 404? Si fue una errata por mi parte o una pregunta trampa para desarrollar vuestra capacidad de análisis crítico, es algo que nunca confesaré.

Volviendo a la pregunta, de nuevo deberemos copiar el fichero 404.html al directorio de nuestro servidor web. Además, deberemos volver a modificar el fichero de configuración en `/etc/nginx/sites-enabled/default`. Con nuestro fichero favorito, añadimos la siguiente línea dentro del bloque `server`:

> `error_page 404 /404.html;`


### Crea un certificado autofirmado y configura nginx para usar https.

Como hicimos en la práctica anterior, creamos primero un certificado autofirmado.

> `sudo openssl req -x509 -newkey rsa:2048 -keyout /etc/ssl/private/nginx.key -out /etc/ssl/certs/nginx.crt -nodes -days 365`

Creado el certificado, una vez más, modificamos el fichero de configuración `/etc/nginx/sites-enabled/default`:

1. Descomentamos las líneas que comienzan con `listen 443...` y `listen [::]:443...` para aceptar conexiones ssl (por IPv4 y IPv6).
2. Añadimos la línea `ssl_certificate     /etc/ssl/certs/nginx.crt;`
3. Y también `ssl_certificate_key /etc/ssl/private/nginx.key;`

### Configura nginx para redirigir todo el tráfico http a la versión https, haciendo que toda la navegación en el sitio web sea forzosamente segura.

En el fichero de configuración, debemos separar el server que teníamos en dos servers distintos. En uno de ellos, tendremos una configuración muy sencilla para que las peticiones HTTP se redirigan a HTTPS de forma permanente (código 301):

```
server {
    listen 80 default_server;
    listen [::]:80 default_server;

    server_name _;

    return 301 https://$host$request_uri;
}
```

En el server que ya teníamos quitamos las líneas del `listen` que hacen referencia al puerto 80 y lo dejamos igual por lo demás.

### Crea un directorio admin, haz que cuando se acceda a él nginx liste su contenido y guarda en él algunas imágenes.

Para crear el directorio y mover las imágenes utilizamos los comandos típicos de la terminal de linux.

En el fichero de configuración del servidor, creamos (dentro del bloque `server` seguro) un nuevo bloque `location`:

```
location /admin {
    autoindex on;
}
```
Recargamos el servicio y veremos el listado de las imágenes que hayamos subido.

### Protege el acceso al directorio admin por usuario y contraseña utilizando nginx. Incluye, como mínimo, el usuario "ser" con contraseña "1234".

En el fichero de configuración, dentro del bloque `location /admin` que hemos creado antes, debemos añadir dos nuevas líneas. La primera especifica que utilizaremos autentificación para poder acceder:

> `auth_basic "Acceso restringido. Necesitarás credenciales de administrador.";`

Y la segunda servirá para especificar dónde guardaremos el fichero con los nombres de usuario y las contraseñas encriptadas. Ese fichero debría estar fuera de la ruta desde la que sirve nuestro servidor, para evitar que cualquiera pueda descargarse el fichero.

> `auth_basic_user_file /etc/nginx/.htpasswd;`

Para crear ese fichero podríamso encriptar a mano la contraseña o utilizar una herramienta creada para el servidor Apache que la encriptará por nosotros. Usaremos aquí ese segundo camino.

Primero instalamos la herramienta:

> `sudo apt install apache2-utils`

Y luego creamos el fichero con la contraseña (que nos pedirá por duplicado al ejecutar el comando):

> `htpasswd -c /etc/nginx/.htpasswd ser`


## Segunda parte: un solo servidor para dos páginas

Todos los pasos anteriores vas a poder probarlos sin ningún problema en tu máquina. Los siguientes pasos no podrás probarlos directamente, sino que necesitarás modificar el fichero de hosts para poder hacer que los dominios que se utilizan en las siguientes secciones redirijan a la misma máquina que has utilizado hasta ahora.

- Todo lo que había hasta ahora deberá ser accesible desde https://ser
- Crea un nuevo servidor virtual que responda a peticiones realizadas a https://onoser. Incluye un nuevo index.html, diferente del creado anteriormente. Incluye también el test.php en dicho dominio.