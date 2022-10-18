#!/bin/bash
echo "INSTALLING DEPENDENCIES FOR PROJECT"

#INSTALL NODEJS
curl -sL https://deb.nodesource.com/setup_16.x | sudo -E bash -
sudo apt-get install -y nodejs
npm install pm2 -g
npm install yarn -g

#INSTALL IPFS
wget https://dist.ipfs.tech/kubo/v0.16.0/kubo_v0.16.0_linux-amd64.tar.gz
tar -xvzf kubo_v0.16.0_linux-amd64.tar.gz
bash kubo/install.sh
rm -rf kubo
rm kubo_v0.16.0_linux-amd64.tar.gz
ipfs init

#SETTING UP NGINX
sudo apt update
sudo apt install nginx -y
sudo ufw allow 'Nginx Full'

#INSTALL CERTBOT
sudo apt update
sudo apt install certbot python3-certbot-nginx -y

#SETTING UP FIREWALL
ufw allow 22
ufw allow 3000
ufw allow 4001
ufw allow 4002
ufw --force enable

yarn
cp .env.goerli .env

pm2 start yarn -- dev
pm2 start "ipfs daemon"
pm2 startup
pm2 save