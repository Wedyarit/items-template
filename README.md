# Project Setup

## Prerequisites
- Docker
- Node.js (version specified in `package.json`)

## Steps to Run the Project

1. **Start Docker Compose:**
   First, make sure you have Docker installed. The project requires PostgreSQL and Redis services, which you can run using Docker Compose. Navigate to the root directory of the project and run:

   ```bash
   docker compose up -d
   ```

   This command will spin up the required PostgreSQL and Redis services.

2. **Configure Environment Variables:**
   You need to create a `.env` file based on the provided `.env.example`. The `.env` file contains configuration details like database connection info, Redis settings, and other environment-specific configurations.

   Copy the `.env.example` to `.env`:

   ```bash
   cp .env.example .env
   ```

   Then, adjust the values in the `.env` file as per your setup.

3. Manual Database Setup: Since the project does not use ORM or automated migrations, you must manually set up the database schema for PostgreSQL. The required SQL commands are provided below:
    ```sql
    -- Create the users table
    create table users
    (
        id         serial primary key,
        username   varchar(255) unique,
        password   varchar(255),
        balance    numeric(10, 2) default 0,
        created_at timestamp      default now(),
        updated_at timestamp      default now()
    );
   
    -- Create the items table
    create table items
    (
        id                 serial primary key,
        market_hash_name   varchar(255) not null,
        currency           varchar(10)  not null,
        suggested_price    numeric(10, 2),
        item_page          varchar(255) not null,
        market_page        varchar(255) not null,
        min_price          numeric(10, 2),
        tradable_min_price numeric(10, 2),
        max_price          numeric(10, 2),
        mean_price         numeric(10, 2),
        median_price       numeric(10, 2),
        quantity           integer,
        created_at         timestamp default now(),
        updated_at         timestamp default now()
    );
    
    -- Create the purchases table
    create table purchases
    (
        id            serial primary key,
        user_id       integer references users(id) on delete cascade,
        item_id       integer references items(id) on delete cascade,
        purchase_date timestamp default now(),
        quantity      integer   default 1,
        total_price   numeric(10, 2)
    );
    ```

4. **Install Dependencies:**
   Run the following command to install all project dependencies:

   ```bash
   npm install
   ```

5. **Run the Project:**
   After setting up Docker and configuring the `.env` file, you can start the project using:

   ```bash
   npm run start:dev
   ```

   This will launch the project on the default port `3000`.

## Accessing Swagger API Documentation

Once the project is running, you can view the Swagger API documentation at:

```
http://localhost:3000/api/docs
```

## Default User

Upon the first launch, a default user is created with the following credentials:

- **Username:** `user`
- **Password:** `password`

## Data Fetching

On the first run, the project fetches initial data from an external API to populate the database.

## Redis Caching

The project uses Redis for caching API responses to improve performance.
