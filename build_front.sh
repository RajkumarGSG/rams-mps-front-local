cd ~/rams/mps-front/
git pull

default_folder_name="/var/www/front"
default_env="test"

# Проверяем значение переданного аргумента
if [ -z "$1" ]; then
  # Если аргумент не задан, используем имя по умолчанию
  folder_name="$default_folder_name"
elif [ "$1" == "dev" ]; then
  # Если аргумент равен 'dev', добавляем 'dev' к имени по умолчанию
  folder_name="${default_folder_name}_dev"
  default_env="dev"
else
  # Если передан любой другой аргумент, используем имя по умолчанию
  folder_name="$default_folder_name"
fi

if grep -q "^VUE_APP_ENV=" .env; then
  # Если строка с VUE_ENV уже существует, заменяем ее
sed -i "s/^VUE_APP_ENV=.*/VUE_APP_ENV='$default_env'/" .env
else
  # Если строка с VUE_ENV не найдена, добавляем ее в конец файла
  echo "VUE_APP_ENV='$default_env'" >> .env
fi

npm run build
sudo chown -R www-data:www-data dist/

sudo rm -fr $folder_name
sudo mv dist/ $folder_name
sudo service nginx reload
git restore .env
echo "Successfully deployed"


