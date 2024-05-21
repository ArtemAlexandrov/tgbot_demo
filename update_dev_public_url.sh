#!/bin/sh
sleep 5

PUBLIC_URL=$(curl --silent --max-time 10 --connect-timeout 5 http://localhost:4040/api/tunnels | jq --raw-output '.tunnels[0].public_url')

sed -i '' '/^PUBLIC_URL/d' .env
echo "PUBLIC_URL=$PUBLIC_URL" >> .env
echo "Your public url is $PUBLIC_URL"