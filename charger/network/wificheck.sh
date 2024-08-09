#!/bin/bash

# Function to check internet connectivity
attempt=1
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
        echo "$(date): Internet is available. attempt $attempt "
	sleep 120
    else
        echo "$(date): Internet is not available. attemprt $attempt /10."
	attempt=$(( $attempt + 1 ))
	if [ "$attempt" -eq 10 ]; then
		echo "Not going to work, Im restarting wifi interface"
		#sudo systemctl restart wifiup
		sudo ifdown wlan0
	       	sudo ifup wlan0 	
		sleep 5
		attempt=1
	fi
	sleep 10
    fi
done
