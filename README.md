# Ecommerce Backend API

A comprehensive monolithic e-commerce backend built with Node.js and MongoDB.

## Architecture Overview

This project implements a modular monolithic architecture for an e-commerce platform, with distinct modules for authentication, products, inventory, cart, orders, and more - all within a single application. The system uses Docker for containerization and is hosted on Amazon EC2.

## Tech Stack

- **Backend:** Node.js with Express
- **Database:** MongoDB
- **Caching & Lock Management:** Redis
- **Storage:** Amazon S3 (for product images and user uploads)
- **Email Service:** AWS SES with Nodemailer
- **Containerization:** Docker & Docker Compose
- **Hosting:** Amazon EC2
- **Content Delivery:** AWS CloudFront
- **Logging:** Winston with Discord Bot integration

## Features

- **User Authentication:** JWT-based authentication system with email verification
- **Product Management:** Complete product lifecycle with categories and search
- **Inventory Control:** Stock tracking and management
- **Shopping Cart:** Persistent cart with product validation
- **Order Processing:** Order creation, payment processing, and status tracking
- **Discount System:** Flexible coupon and promotion management
- **Media Storage:** AWS S3 integration for product images and user uploads
- **Email Notifications:** Transactional emails via AWS SES and Nodemailer
- **Logging:** Comprehensive logging system with Discord notifications for critical events

## Getting Started

### Prerequisites

- Node.js 16+
- Docker and Docker Compose
- MongoDB (or use the containerized version)
- Redis (or use the containerized version)
- AWS Account with S3, SES, and CloudFront services configured

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/pchihieuu/ecommerce-backend.git
   cd ecommerce-backend
2. Install dependencies:
   ```bash
   npm install
3. Create environment files:
   ```bash
   cp .env.example .env
   ```
    Update the .env file with your configuration settings
  
4. Start the application: Using npm
    ```bash
    npm run start
    ```
    Using Docker:
    ```bash
    docker-compose up -d
    ```
