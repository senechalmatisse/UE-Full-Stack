#!/bin/bash
set -e

echo "Démarrage de l'application Spring Boot..."
java -Xms512m -Xmx1024m -XX:+UseG1GC -XX:+UseStringDeduplication \
     -Dspring.jpa.defer-datasource-initialization=false \
     -Dspring.jpa.hibernate.ddl-auto=create-drop \
     -Dserver.tomcat.threads.max=50 \
     -Dspring.datasource.hikari.maximum-pool-size=5 \
     -jar event-0.0.1-SNAPSHOT.jar &
APP_PID=$!

echo "Attente de la disponibilité de l'API (timeout: 60s)..."
for i in {1..30}; do
  if curl -f -s --connect-timeout 2 --max-time 5 http://localhost:8080/events > /dev/null 2>&1; then
    echo "API prête après $((i*2)) secondes"
    echo "Exécution du script d'initialisation..."
    ./init_data.sh
    echo "Initialisation terminée"
    break
  fi
  if [ $i -eq 30 ]; then
    echo "Timeout: API non disponible après 60s"
    exit 1
  fi
  echo "Tentative $i/30..."
  sleep 2
done

wait $APP_PID