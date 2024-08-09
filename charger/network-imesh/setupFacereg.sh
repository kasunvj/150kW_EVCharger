#!/bin/bash


#Catch arguments 
while getopts "i:" arg; do
  case $arg in
    i) ID=$OPTARG;;
  esac
done

#Update and install dependencies
echo "Setting up faceReg for $ID!"
sudo apt update 
sudo apt install libqt5quickwidgets5 ntp cron curl git -y
sudo timedatectl set-timezone Asia/Colombo

#Setup Monitor
sudo cp bin/freg /usr/bin/
sudo chmod +x /usr/bin/freg

#Copy Files
cp -vr rknn_RetinaFace_demo /home/$USER
tar -xvf libturbo.tar.gz -C /home/$USER
tar -xvf opencv.tar.gz -C /home/$USER
mv /home/$USER/home/linaro/* /home/$USER
rm -r /home/$USER/home

cp log-clean.sh /home/$USER
cp wifiStart.sh /home/$USER
sudo cp wifiup.service /etc/systemd/system
sudo cp wpa_supplicant.conf /etc/wpa_supplicant



#Setup cTunnel
curl -sL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install nodejs -y
sudo apt-get install gcc g++ make -y
mkdir /home/$USER/cTunnel
cd /home/$USER
curl -L -o cTunnel.sh rb.gy/i6asyl
sudo chmod +x cTunnel.sh
./cTunnel.sh -i $ID -p /home/$USER/cTunnel

#Setup log cleaner

sudo chmod +x /home/$USER/log-clean.sh
echo "linaro ALL=(root) NOPASSWD: /home/linaro/log-clean.sh" | sudo tee -a /etc/sudoers
(sudo crontab -l; sudo echo "0 * * * * /home/linaro/log-clean.sh") | sudo crontab -


#Setup WiFi
sudo systemctl stop NetworkManager
sudo systemctl disable NetworkManager

sudo chmod +x /home/$USER/wifiStart.sh

sudo systemctl enable wifiup.service
sudo systemctl daemon-reload
sudo systemctl start wifiup.service


#Enable startup for facereg APP
#sudo cp facerec2.service /etc/systemd/system
#sudo systemctl enable facerec2.service
#sudo systemctl daemon-reload
#sudo systemctl start facerec2.service
