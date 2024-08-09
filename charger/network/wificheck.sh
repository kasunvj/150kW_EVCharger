#!/bin/bash

# Function to check internet connectivity
check_internet() {
    # Try to ping Google's DNS server
    if sudo ping -c 1 google.com &> /dev/null; then
        return 0
    else
        return 1
    fi
}

# Infinite loop to check internet connectivity every 2 minutes
while true; do
    if check_internet; then
        echo "$(date): Internet is available."
    else
        echo "$(date): Internet is not available. Restarting wifiup service."
        sudo systemctl restart wifiup
    fi
    # Sleep for 2 minutes
    sleep 120
done