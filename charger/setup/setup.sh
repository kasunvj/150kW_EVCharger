#!/bin/bash
#Catch arguments 
while getopts "i:" arg; do
  case $arg in
    i) ID=$OPTARG;;
  esac
done

echo "Setup Charger"
echo "ID: $ID"

echo 'Network Setup'
sudo systemctl stop NetworkManager
sudo systemctl disable NetworkManager
chmod +x /home/linaro/charger/setup/wificheck.sh
chmod +x /home/linaro/charger/setup/wifiup.sh
cp /home/linaro/charger/setup/c /etc/systemd/system
cp /home/linaro/charger/setup/check_internet.service /etc/systemd/system
cp /home/linaro/charger/setup/interfaces /etc/network
sudo systemctl enable wifiup.service
sudo systemctl daemon-reload
sudo systemctl start wifiup.service
sudo systemctl enable check_internet.service
sudo systemctl daemon-reload
sudo systemctl start check_internet.service
echo 'Network Setup - completed'



