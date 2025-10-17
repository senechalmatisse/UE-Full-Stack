#!/bin/bash

API="http://localhost:8080"
TIMEOUT=5
MAX_RETRIES=3
START_TIME=$(date +%s)

echo "Initialisation complète des données..."

# --- Données d'événements variées ---
declare -A EVENTS
EVENTS["Festival d'Avignon"]="2025-07-05|2025-07-25"
EVENTS["Rock en Seine"]="2025-08-22|2025-08-25"
EVENTS["Jazz à Vienne"]="2025-07-01|2025-07-13"
EVENTS["Salon Bio & Bien-être"]="2025-09-12|2025-09-14"
EVENTS["Les Francofolies"]="2025-07-10|2025-07-14"
EVENTS["Festival de Cannes"]="2025-05-14|2025-05-25"
EVENTS["Hellfest"]="2025-06-20|2025-06-23"
EVENTS["Fête de la Musique"]="2025-06-21|2025-06-21"
EVENTS["Tomorrowland Winter"]="2025-03-15|2025-03-22"
EVENTS["Paris Games Week"]="2025-10-28|2025-11-02"

# --- Données d'artistes variées ---
ARTISTS=(
    "Spectre Analogique"
    "Les Ombres Électriques"
    "Echo du Néant"
    "Terminal Obscur"
    "Neon Mirage"
    "Luna Spectrum"
    "Orchestre des Cités Perdues"
    "Waveform"
    "Eclipse Harmonie"
    "Drumbyte"
)

declare -A EVENT_IDS
declare -A ARTIST_IDS

# --- Fonction générique d'appel API avec gestion d'erreur ---
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
                -X "$method" "$API/$endpoint")
        fi

        body=$(echo "$response" | sed -e 's/HTTPSTATUS\:.*//g')
        status=$(echo "$response" | tr -d '\n' | sed -e 's/.*HTTPSTATUS://')

        if [ "$status" -ge 200 ] && [ "$status" -lt 300 ]; then
            echo "$body"
            return 0
        fi

        echo "Tentative $attempt échouée pour $endpoint (HTTP $status)" >&2
        [ $attempt -lt $MAX_RETRIES ] && sleep 1
    done

    echo "Échec permanent pour $endpoint" >&2
    return 1
}

# --- Création des événements ---
echo "Création des événements..."
for label in "${!EVENTS[@]}"; do
    IFS="|" read start end <<< "${EVENTS[$label]}"
    response=$(api_call "POST" "events" "{\"label\":\"$label\",\"startDate\":\"$start\",\"endDate\":\"$end\"}")
    id=$(echo "$response" | jq -r '.id // empty')

    if [ -n "$id" ]; then
        EVENT_IDS["$label"]=$id
        echo "$label -> ID $id"
    else
        echo "Erreur création événement : $label"
    fi
done

# --- Création des artistes ---
echo "Création des artistes..."
for label in "${ARTISTS[@]}"; do
    response=$(api_call "POST" "artists" "{\"label\":\"$label\"}")
    id=$(echo "$response" | jq -r '.id // empty')

    if [ -n "$id" ]; then
        ARTIST_IDS["$label"]=$id
        echo "$label -> ID $id"
    else
        echo "Erreur création artiste : $label"
    fi
done

# --- Associations événements ↔ artistes ---
echo "Création des associations..."

# Génère au moins une association par artiste
index=0
for artist in "${ARTISTS[@]}"; do
    eventIndex=$((index % ${#EVENTS[@]}))
    eventName=$(printf "%s\n" "${!EVENTS[@]}" | sed -n "$((eventIndex + 1))p")
    eventId="${EVENT_IDS[$eventName]}"
    artistId="${ARTIST_IDS[$artist]}"

    if [ -n "$eventId" ] && [ -n "$artistId" ]; then
        api_call "POST" "events/$eventId/artists/$artistId" >/dev/null
        echo "$artist <-> $eventName"
    fi
    ((index++))
done

# Ajout de quelques associations croisées supplémentaires
EXTRA_ASSOCS=(
    "Rock en Seine|Neon Mirage"
    "Hellfest|Drumbyte"
    "Les Francofolies|Luna Spectrum"
    "Festival d'Avignon|Orchestre des Cités Perdues"
)
for assoc in "${EXTRA_ASSOCS[@]}"; do
    IFS="|" read event artist <<< "$assoc"
    eid="${EVENT_IDS[$event]}"
    aid="${ARTIST_IDS[$artist]}"
    [ -n "$eid" ] && [ -n "$aid" ] && api_call "POST" "events/$eid/artists/$aid" >/dev/null
done

END_TIME=$(date +%s)
echo "Initialisation terminée en $((END_TIME - START_TIME)) secondes !"