#!/bin/bash
/usr/bin/ip link set wlan0 down
/sbin/wpa_supplicant -B -Dnl80211 -i wlan0 -c /etc/wpa_supplicant/wpa_supplicant.conf
/sbin/dhclient
