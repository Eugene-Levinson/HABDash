
# HABDash

The HABDash project was started as my Computer Science A-Level coursework. The goal is to provide a way to visualise telemetry and data recieved from weather balloons or any other payloads. The hope is to provide an alternative solution to the currently existing ones, that is simple, dynamic and scales well on mobile devices.

<br>


# Server setup and deployment

This project was developed on Ubuntu 20.04 

<br> 

## Server Setup

``` bash
sudo apt-get update
```

### Install git

``` bash
sudo apt-get install git 
```

### Clone the repository

``` bash
git clone git@github.com:Eugene-Levinson/HABDash.git
```

### Set up direnv
  
``` bash
sudo apt-get install direnv
```  

Add the folwing to your `~/.bashrc`  

``` bash
eval "$(direnv hook bash)"
```

### Set up project directory

``` bash
cd HABDash
```

### Install dependencies
  
``` bash
sudo ./install_dep
npm install
```

<br>

## Database setup

### Secure DB installation

``` bash
sudo mysql_secure_installation
```

### Login to DB with root user

``` bash
sudo mysql
```

### Create a user to access the DB

``` sql
CREATE USER '<username>'@'<host-to-be-accessed-from>' IDENTIFIED BY '<password>';
```

### Grant privileges to the user
``` sql
GRANT CREATE, ALTER, INSERT, UPDATE, DELETE, SELECT, REFERENCES on *.* TO '<username>'@'<host-to-be-accessed-from>' WITH GRANT OPTION;
```

### Flush privileges and exit

```sql
FLUSH PRIVILEGES;
```

```sql
exit
```

### Enable mysql server on startup

```bash
sudo systemctl enable mysql.service
```

<br>

## SSL Certificate Setup

You have to aquire a SSL certificate for the server.
You can aquire one for free from [LetsEncrypt.org](https://letsencrypt.org/getting-started/)

Make sure to save the location of your certificate. The path to the certificate will need to be added to the secret manager later (Cloud setup step)

<br>

## Cloud Setup

This project utilises several google cloud services. The following setup is required to host this platform.

1. Make sure that you have created a GCP project. 
2. Enable Maps JavaScript API.
3. Generate an auth token (not a service account!) and make sure that the JavaScript Map API is added as a service for the token.
4. Enable Secret Manager API.

Make sure the following secrets are created:

- SSL_KEY - file path to the SSL Key file
- SSL_CERT - file path to the SSL Certificate file
- DB_HOST - database host
- DB_USER - database user
- DB_PASSWORD - database password
- DB_NAME - database name
- MAPS_KEY - javascript maps API token

<br>

## Setup GCS in the project directory

### Next few steps set up service account on the server. They should be completed only after Cloud Setup has been done

### Go into the project directory

``` bash
cd ~/HABDash
```

### Make sure no old service account are enabled

``` bash
cloud auth revoke --all
```

### Set up gcp service account

``` bash
./config <gcp_project_name>
```

### Allow direnv

``` bash
direnv allow .
```

### Create HABDash main DB and all required tables

``` bash
node utils/createdb.js
```

<br>

## Start the server

### Typical run command

``` bash
nohup sudo --preserve-env node src/app/app.js -m prod &
```

Optional paramters:  
`-m` => mode `dev` or `prod` (default set in src/app/config/common.js)  
`-p` => http port (default set prod and dev configs)  
`-s` => https port (default set in prod and dev config)  
`-d` => when set to `true` disables https and runs the server in http only mode
