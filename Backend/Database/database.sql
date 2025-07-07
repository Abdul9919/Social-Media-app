

CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        profile_picture VARCHAR(255) DEFAULT 'https://res.cloudinary.com/dv9af2izq/image/upload/v1751284227/default-profile-picture_ubue3c.jpg',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS posts (
        id SERIAL PRIMARY KEY,
        description TEXT,
        media_url TEXT NOT NULL,
        media_type VARCHAR(10) CHECK (media_type IN ('image', 'video')),
        likes INTEGER DEFAULT 0,
        comments INTEGER DEFAULT 0,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );


CREATE INDEX IF NOT EXISTS posts_user_id_idx ON posts(user_id);

CREATE TABLE IF NOT EXISTS comments (
        id SERIAL PRIMARY KEY,
        post_id INTEGER NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        content VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );


CREATE INDEX IF NOT EXISTS comments_post_id_idx ON comments(post_id);


CREATE INDEX IF NOT EXISTS comments_user_id_idx ON comments(user_id);

CREATE TABLE IF NOT EXISTS likes (
        post_id INTEGER NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        PRIMARY KEY (user_id, post_id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
CREATE INDEX IF NOT EXISTS likes_post_id_idx ON likes(post_id);
CREATE INDEX IF NOT EXISTS likes_user_id_idx ON likes(user_id);

CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at);
CREATE INDEX IF NOT EXISTS idx_likes_post_user ON likes(post_id, user_id);