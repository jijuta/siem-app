-- Users Table
CREATE TABLE IF NOT EXISTS siem_app.users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(100) NOT NULL,
  role VARCHAR(50) DEFAULT 'viewer',
  avatar_url TEXT,
  phone VARCHAR(20),
  department VARCHAR(100),
  is_active BOOLEAN DEFAULT true,
  email_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_login_at TIMESTAMP
);

-- Sessions Table (for NextAuth)
CREATE TABLE IF NOT EXISTS siem_app.sessions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES siem_app.users(id) ON DELETE CASCADE,
  session_token VARCHAR(255) UNIQUE NOT NULL,
  expires TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Password Reset Tokens
CREATE TABLE IF NOT EXISTS siem_app.password_reset_tokens (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES siem_app.users(id) ON DELETE CASCADE,
  token VARCHAR(255) UNIQUE NOT NULL,
  expires TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON siem_app.users(email);
CREATE INDEX IF NOT EXISTS idx_sessions_token ON siem_app.sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON siem_app.sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_reset_tokens_token ON siem_app.password_reset_tokens(token);

-- Insert default admin user (password: admin123)
-- bcrypt hash for 'admin123'
INSERT INTO siem_app.users (email, password_hash, name, role, is_active, email_verified)
VALUES (
  'admin@defenderx.com',
  '$2a$10$rZ8qYQJ5xKZJ8ZqYQJ5xKOzJ8ZqYQJ5xKZJ8ZqYQJ5xKZJ8ZqYQJ5xK',
  'Administrator',
  'admin',
  true,
  true
)
ON CONFLICT (email) DO NOTHING;

-- Add auth menu items
INSERT INTO siem_app.menu_items (name, label, description, icon, href, category_id, order_index, is_active)
VALUES
  ('profile',
   '{"ko": "프로필", "en": "Profile", "ja": "プロフィール", "zh": "个人资料"}'::jsonb,
   '{"ko": "사용자 프로필 설정", "en": "User profile settings", "ja": "ユーザープロフィール設定", "zh": "用户配置文件设置"}'::jsonb,
   'User',
   '/profile',
   (SELECT id FROM siem_app.menu_categories WHERE name = 'system_admin'),
   999,
   true
  )
ON CONFLICT (name) DO NOTHING;

COMMENT ON TABLE siem_app.users IS 'User authentication and profile information';
COMMENT ON TABLE siem_app.sessions IS 'User session tokens for authentication';
COMMENT ON TABLE siem_app.password_reset_tokens IS 'Password reset token storage';
