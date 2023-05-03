#! /bin/sh


mkdir /srv/site_sprint_i

cd site || ! echo "FALHA! Pasta não encontrada"

docker network create puc
docker ps -a | awk '{ print $1,$2 }' | grep flpsantoro/site_sprint_i:1.0 | awk '{print $1 }' | xargs -I {} docker rm -f {}
docker rmi flpsantoro/site_sprint_i:1.0
docker build --tag=flpsantoro/site_sprint_i:1.0 --rm=true .

docker run \
  --name site_sprint_i \
  --hostname=site_sprint_i \
  --network=puc \
  -v /srv/site_sprint_i:/usr/share/nginx/html \
  -p 33001:80 \
  -d flpsantoro/site_sprint_i:1.0

echo "Iniciando Aplicação..."
cp -R * /srv/site_sprint_i/
