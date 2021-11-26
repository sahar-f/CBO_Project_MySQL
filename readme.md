This is a simple application for a potential Food Drive charities to track events and people involved.

AJAX is used with: Server -> Nodejs, Client -> HTML/JavaScript, Database -> MySQL, and Library -> Express as per requirements.  

### System Requirements:
    Docker
    NodeJS

### Steps to Start on Terminal in Project Folder: 
## Build image:

    docker build -t node-api:v1 .

## Create network:

    docker network create node-api-network

## Start the program with:

    docker-compose up

## After you're done with the program:

    docker-compose down

### To restart Network 
    Service docker restart
    docker network ls   
    docker network rm ID

