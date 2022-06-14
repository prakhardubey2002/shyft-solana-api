#!/bin/bash

echo "Deploying Server"

# Restart Server
pm2 start dist/main.js --name solana-api
echo "S E R V E R   D E P L O Y E D"