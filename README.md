

# HABDash

This is the repository that holds all of my source code for my A-level CS NEA  

# Server setup and deployment

This section describes the step by step process of setting up the environment and deplying the HABDash webserver. This is not something that a user of HABDash would ever need to do but for those who want to set a copy of this up for some reason it might be usefull

**Please note**: that this was originally develped and set up on Ubuntu 20.04 and therefore alot of commands bellow might not matcht the exact commands for other systems (for example apt).

## Install git

`sudo apt-get install git`



## Clone the repository

`git@github.com:Eugene-Levinson/HABDash.git`
SS
<br> 

## Set up direnv
  
`sudo apt-get install direnv`  

Add the folwing to `~/.bashrc`  
`eval "$(direnv hook bash)"`

If you are not using bash refere to direnv documentation

`cd HABDash`  
`direnv allow .`

<br> 

## Install all other required dependencies
  
`sudo install_dep` (Uses apt as package manager)

## Install node packages

`nmp install`

## Start the server

`sudo node src/app/app.js`

Optional paramters:  
`-m` => mode `dev` or `prod` (default set in src/app/config/common.js)  
`-p` => http port (default set prod and dev configs)  
`-s` => https port (default set in prod and dev config)