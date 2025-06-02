# Maintenance planning (frontend)

## Requirements
Linux - Ubuntu Server 22.04 64 bit

`vue --version`
should be: @vue/cli 5.0.8

`n --version`
should be: v9.2.0

`node --version`
should be: 22.14

`nodejs --version`
should be: v12.22.9

## Installation
**Run once or if the versions do not comply**

- Update the packages
>   `sudo apt update && sudo apt -y upgrade`

- Install node.js and npm
>   `sudo apt install -y nodejs npm`

- Install n for easy management of Node.js versions
>   `sudo npm install -g n`

- Install Node.js 22.14 and to show actual node.js version after installation
>   `sudo n 22.14 && hash -r`

- Update npm
>   `sudo npm install -g npm@latest`

- Install necessary global dependencies
>   `sudo npm install -g vue@2.7.16 @vue/cli @vue/cli-service vue-ui semver core-js serve eslint@latest eslint-plugin-vue@latest`

- Setup git access via generating ssh keys and editing ~/.ssh/config
git config --global user.email "mamutoff@gmail.com" && git config --global user.name "Meder"
git config --global credential.helper cache

- Get latest source code
>   `git clone git@gitlab.com:anoxis/rams.git`

- Go to project folder and install dependencies
>   `cd rams`

- We usually use mps branch
>   `git checkout mps`

>   `cd mps-front/`

- Install indicated project dependencies
>   `npm install --legacy-peer-deps`

- Some module sometimes need to be rebuilt
>   `npm rebuild sass`

**Important!!! Sometimes in order to run the system we need to remove eslint plugin**
>   `npm remove @vue/cli-plugin-eslint`

- Build the project in Dev mode 
>   `npm run dev` or `npm run serve`

## To delete (for example if need to start from scratch):
>   `sudo rm -rf /usr/local/bin/npm /usr/local/share/man/man1/node* ~/.npm /usr/local/lib/node* /usr/local/bin/node* /usr/local/include/node*`

>   `rm -fr node_modules/`

>   `sudo apt purge -y nodejs npm`
|
>   `sudo apt autoremove -y`
