#!/bin/bash

# Configuration optimisée
API="http://localhost:8080"
TIMEOUT=5
MAX_RETRIES=3
START_TIME=$(date +%s)

echo "Initialisation rapide des données..."

declare -A EVENTS
EVENTS["Festival d'Avignon"]="2025-07-05|2025-07-25"
EVENTS["Rock en Seine"]="2025-08-22|2025-08-25"
EVENTS["Jazz à Vienne"]="2025-07-01|2025-07-13"
EVENTS["Salon Bio & Bien-être"]="2025-09-12|2025-09-14"

ARTISTS=("Spectre Analogique" "Les Ombres Électriques" "Echo du Néant" "Terminal Obscur")

declare -A EVENT_IDS
declare -A ARTIST_IDS

# Fonction d'appel API avec log status HTTP
api_call() {
    local method=$1
    local endpoint=$2
    local data=$3

    for attempt in $(seq 1 $MAX_RETRIES); do
        if [ -n "$data" ]; then
            response=$(curl -s -w "HTTPSTATUS:%{http_code}" \
                --connect-timeout $TIMEOUT --max-time $TIMEOUT \
                -X "$method" "$API/$endpoint" \
                -H "Content-Type: application/json" \
                -d "$data")
        else
            response=$(curl -s -w "HTTPSTATUS:%{http_code}" \
                --connect-timeout $TIMEOUT --max-time $TIMEOUT \
                -X "$method" "$API/$endpoint" \
                -H "Content-Length: 0")
        fi

        body=$(echo "$response" | sed -e 's/HTTPSTATUS\:.*//g')
        status=$(echo "$response" | tr -d '\n' | sed -e 's/.*HTTPSTATUS://')

        if [ "$status" -ge 200 ] && [ "$status" -lt 300 ]; then
            echo "$body"
            return 0
        else
            echo "Erreur HTTP $status → $endpoint" >&2
            [ -n "$body" ] && echo "Réponse: $body" >&2
        fi

        if [ $attempt -lt $MAX_RETRIES ]; then
            echo "Tentative $attempt échouée, retry..." >&2
            sleep 1
        fi
    done

    echo "Erreur après $MAX_RETRIES tentatives pour $endpoint" >&2
    return 1
}

# Créer les événements
echo "Création des événements..."
for label in "${!EVENTS[@]}"; do
    IFS="|" read start end <<< "${EVENTS[$label]}"

    response=$(api_call "POST" "events" "{\"label\":\"$label\",\"startDate\":\"$start\",\"endDate\":\"$end\"}")

    if [ $? -eq 0 ]; then
        id=$(echo "$response" | jq -r '.id // empty')
        if [ -n "$id" ] && [ "$id" != "null" ]; then
            EVENT_IDS["$label"]=$id
            echo "$label → $id"
        else
            echo "Erreur création $label"
        fi
    else
        echo "Échec API pour $label"
    fi
done

# Créer les artistes
echo "Création des artistes..."
for label in "${ARTISTS[@]}"; do
    response=$(api_call "POST" "artists" "{\"label\":\"$label\"}")

    if [ $? -eq 0 ]; then
        id=$(echo "$response" | jq -r '.id // empty')
        if [ -n "$id" ] && [ "$id" != "null" ]; then
            ARTIST_IDS["$label"]=$id
            echo "$label → $id"
        else
            echo "Erreur création $label"
        fi
    else
        echo "Échec API pour $label"
    fi
done

echo "Associations événements ↔ artistes..."

# Associations optimisées
associations=(
    "Festival d'Avignon|Spectre Analogique"
    "Rock en Seine|Spectre Analogique"
    "Rock en Seine|Les Ombres Électriques"
    "Jazz à Vienne|Echo du Néant"
    "Jazz à Vienne|Spectre Analogique"
    "Jazz à Vienne|Les Ombres Électriques"
)

for association in "${associations[@]}"; do
    IFS="|" read event_name artist_name <<< "$association"
    event_id="${EVENT_IDS[$event_name]}"
    artist_id="${ARTIST_IDS[$artist_name]}"

    if [ -n "$event_id" ] && [ -n "$artist_id" ]; then
        response=$(api_call "POST" "events/$event_id/artists/$artist_id")
        if [ $? -eq 0 ]; then
            echo "$event_name ↔ $artist_name"
        else
            echo "Échec association: $event_name ↔ $artist_name"
        fi
    else
        echo "IDs manquants: $event_name (${event_id:-N/A}) ↔ $artist_name (${artist_id:-N/A})"
    fi
done

END_TIME=$(date +%s)
DURATION=$((END_TIME - START_TIME))
echo "Initialisation terminée en ${DURATION} secondes!"