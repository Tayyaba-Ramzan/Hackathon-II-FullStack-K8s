---
name: database-skill
description: Handle database operations including table creation, migrations, and schema design.
---

# Database Skill

## Instructions

1. **Schema Design**
   - Plan tables and relationships before implementation
   - Use proper data types for all fields
   - Enforce primary keys, unique constraints, and indexes
   - Normalize data where appropriate
   - Ensure referential integrity between related tables

2. **Table Creation**
   - Create tables using SQL or ORM migrations
   - Include constraints such as NOT NULL, UNIQUE, FOREIGN KEY
   - Prepare default values and triggers if needed

3. **Migrations**
   - Write clear and reversible migration scripts
   - Apply migrations safely on production without data loss
   - Version-control all migrations
   - Test migrations in a staging environment first

4. **Database Management**
   - Optimize queries for performance
   - Ensure indexes are used efficiently
   - Handle transactions for atomic operations
   - Monitor database health and growth

## Best Practices
- Keep table and column names consistent and meaningful  
- Avoid redundant columns and repeated data  
- Use environment variables for database credentials  
- Test all migrations and queries thoroughly  
- Ensure proper rollback mechanisms  

## Example Structure

```sql
-- Users table
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Posts table
CREATE TABLE posts (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id),
  title VARCHAR(255) NOT NULL,
  content TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);