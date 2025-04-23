Node.js Authentication with MySQL & FTPS

This project is a full authentication system built with Node.js, MySQL, and an FTPS server, all orchestrated using Docker.

Features

✅ User Registration & Email Verification✅ Login with JWT Authentication✅ Password Reset via Email✅ Sending Emails using Nodemailer✅ FTPS Server File Upload & Retrieval✅ MySQL Database Connection✅ Fully Dockerized with MySQL & FTPS

Project Structure

/nodejs-auth-ftps
│── /config
│── /controllers
│── /middleware
│── /routes
│── /utils
│── /public
│── /db-data   (MySQL persistent data)
│── /ftp-data  (FTPS persistent storage)
│── .env
│── Dockerfile
│── docker-compose.yml
│── package.json
│── server.js

Setup Instructions

1. Clone the Repository

2. Create the .env File

Create a .env file in the root directory and add the following:

# Server Configuration
PORT=3000
SESSION_SECRET=RANDOM_SECRET_KEY

# MySQL Database Configuration
DB_HOST=mysql
DB_USER=auth_user
DB_PASS=auth_password
DB_NAME=auth_db

# JWT Secret Key
JWT_SECRET=ANOTHER_RANDOM_SECRET_KEY

# Email Configuration (Nodemailer - Gmail Example)
EMAIL=your_email@gmail.com
EMAIL_PASS=your_email_password

# FTPS Server Configuration
FTP_HOST=ftps
FTP_USER=ftpuser
FTP_PASS=ftppassword

# Application Base URL
BASE_URL=http://localhost:3000

3. Run the Project with Docker

docker-compose up --build

MySQL will run on localhost:3306

FTPS will be available on localhost:21

Node.js API will be accessible on http://localhost:3000

Swagger API Docs available at http://localhost:3000/api-docs

To stop the project:

docker-compose down

4. API Endpoints

Authentication Routes

Method

Endpoint

Description

POST

/auth/register

Register a new user

GET

/auth/verify/:token

Verify email using token

POST

/auth/login

Login and get JWT token

POST

/auth/forgot-password

Request password reset

POST

/auth/reset-password

Reset password

FTPS Routes

Method

Endpoint

Description

POST

/ftp/upload

Upload a file (requires auth)

API Documentation with Swagger

Swagger is integrated for interactive API documentation.
To access it, visit:
http://localhost:3000/api-docs

5. Testing with Postman

Use Postman or cURL to test API endpoints.

Include the JWT token in the Authorization header for protected routes.

6. Database Setup

The MySQL database will be automatically created and persist data in the db-data volume.
If you want to manually connect to the MySQL container:

docker exec -it mysql_container mysql -u auth_user -p auth_db

7. FTPS Server Access

The FTPS server stores uploaded files in the ftp-data directory. You can connect using an FTP client like FileZilla:

Host: localhost

Username: ftpuser

Password: ftppassword

Port: 21