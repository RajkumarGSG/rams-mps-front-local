cd rams/mps-front/
git pull
npm run build
sudo chown -R www-data:www-data dist/
sudo rm -fr /var/www/front_dev/
sudo mv dist/ /var/www/front_dev
sudo service nginx reload

