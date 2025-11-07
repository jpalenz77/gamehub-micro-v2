# Usamos una imagen base de Nginx ligera
FROM nginx:alpine

# Copiamos nuestra configuración de Nginx personalizada
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copiamos el archivo del juego desde la carpeta 'juegos' (un nivel arriba)
# Esto asume que estás ejecutando 'docker build' desde la carpeta 'docker-test'
# y el archivo doom.jsdos está en '../juegos/'
COPY ../juegos/doom.jsdos /usr/share/nginx/html/doom.jsdos

# El puerto 80 es el puerto por defecto de Nginx
EXPOSE 80

# Nginx se inicia por defecto con la imagen base, no necesita CMD