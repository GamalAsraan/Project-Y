# Project-Y (X.com Clone)

Project-Y is a light clone of X (formerly Twitter), designed as a modern full-stack application. It features a microservices architecture orchestrated with Docker Compose.

## 🚀 Features

- **Frontend**: A responsive React application built with **Vite** for a fast and interactive user experience. It utilizes **React Router** for seamless client-side navigation.
- **Backend**: A robust Node.js server handling API requests and business logic.
- **ML Service**: A dedicated Python service for machine learning tasks.
- **Database**: PostgreSQL for reliable data persistence.
- **Containerization**: Fully Dockerized environment for easy setup and deployment.

## 📂 File Structure

```
.
├── backend/                # Node.js backend service
│   ├── node_modules/
│   ├── src/
│   ├── Dockerfile
│   └── package.json
├── frontend/               # React frontend application
│   ├── node_modules/
│   ├── public/
│   ├── src/
│   ├── Dockerfile
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
├── ml-service/             # Python machine learning service
│   ├── app/
│   ├── sentiment_model/
│   ├── Dockerfile
│   ├── requirements.txt
│   └── requirements-core.txt
├── docker-compose.yml      # Docker Compose orchestration
├── test_integration.sh     # Integration test script
└── README.md
```

## 🛠️ Getting Started

To get the application running locally:

1.  Ensure you have **Docker** and **Docker Compose** installed.
2.  Run the following command in the root directory:

    ```bash
    docker-compose up --build
    ```

This will start all services:
- Frontend: [http://localhost:5173](http://localhost:5173)
- Backend: [http://localhost:3000](http://localhost:3000)
- ML Service: [http://localhost:8000](http://localhost:8000)

## 🧪 Testing

To test the backend sentiment analysis integration:

1.  Ensure the services are running.
2.  Run the integration test script:

    ```bash
    ./test_integration.sh
    ```

    This script sends a sample request to the backend, which forwards it to the ML service, and prints the result.