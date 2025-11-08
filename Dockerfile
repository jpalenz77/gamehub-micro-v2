FROM nginx:alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf

COPY ../juegos/doom.jsdos /usr/share/nginx/html/doom.jsdos

EXPOSE 80