#!/bin/bash
sudo cp facerec3.service /etc/systemd/system/
sudo cp check_internet.service /etc/systemd/system/
sudo systemctl stop facerec2.service
sudo systemctl disable facerec2.service
sudo systemctl enable facerec3.service
sudo systemctl enable check_internet.service
sudo systemctl start check_internet.service
cp wificheck.sh ~/
sudo chmod +x /home/linaro/wificheck.sh
echo "linaro ALL=(root) NOPASSWD: /home/linaro/wificheck.sh" | sudo tee -a /etc/sudoers


