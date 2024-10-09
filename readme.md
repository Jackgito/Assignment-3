This project is a full-stack application that includes a backend built with Node.js, Express, and MongoDB, and a frontend built with React and Vite.

## Table of Contents

- [Project Title](#project-title)
- [Table of Contents](#table-of-contents)
- [Getting Started](#getting-started)
  - Prerequisites
  - Installation
- [Running the Application](#running-the-application)
  - Backend
  - Frontend
- [Project Structure](#project-structure)
- [API Endpoints](#api-endpoints)
- [Frontend Components](#frontend-components)
- Styling
- Linting
- License

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)
- MongoDB
- PostgreSQL

### Installation

1. Clone the repository:
    ```sh
    git clone <repository-url>
    cd <repository-directory>
    ```

2. Install dependencies for both backend and frontend:
    ```sh
    cd Backend
    npm install
    cd ../Frontend
    npm install
    ```

## Running the Application

### Backend

1. Create a [`.env`](command:_github.copilot.openSymbolFromReferences?%5B%22%22%2C%5B%7B%22uri%22%3A%7B%22scheme%22%3A%22file%22%2C%22authority%22%3A%22%22%2C%22path%22%3A%22%2Fc%3A%2FUsers%2FJuise%2FDesktop%2FKoulu%2FDI%20kurssit%2FData%20intensive%20systems%2FAssignment%203%2F.gitignore%22%2C%22query%22%3A%22%22%2C%22fragment%22%3A%22%22%7D%2C%22pos%22%3A%7B%22line%22%3A1%2C%22character%22%3A1%7D%7D%5D%2C%22904efc5f-3aa7-41ac-b4f9-24782cd1dd5b%22%5D "Go to definition") file in the 

Backend

 directory with the following content:
    ```env
    MONGO_URI=<your-mongodb-uri>
    PG_USER=<your-postgres-user>
    PG_HOST=<your-postgres-host>
    PG_PASSWORD=<your-postgres-password>
    NA_PG_NAME=<your-na-postgres-db-name>
    ASIA_PG_NAME=<your-asia-postgres-db-name>
    PG_PORT=<your-postgres-port>
    PORT=5000
    ```

2. Start the backend server:
    ```sh
    cd Backend
    npm start
    ```

### Frontend

1. Start the frontend development server:
    ```sh
    cd Frontend
    npm run dev
    ```

## Project Structure

```
.gitignore
Backend/
    .env
    models/
        player.js
    package.json
    routes/
        create.js
        delete.js
        read.js
    server.js
    utils/
        createRandomPlayer.js
Frontend/
    eslint.config.js
    index.html
    package.json
    public/
    src/
        App.css
        App.jsx
        DataDisplay.jsx
        index.css
        main.jsx
    vite.config.js
```

## API Endpoints

### Create a New Player

- **URL:** `/api/create/:region`
- **Method:** `POST`
- **Description:** Creates a new player in the specified region (EU, NA, or Asia).

### Read Player Data

- **URL:** `/api/read`
- **Method:** `GET`
- **Description:** Retrieves player data.

### Delete a Player

- **URL:** `/api/delete/:id`
- **Method:** `DELETE`
- **Description:** Deletes a player by ID.
