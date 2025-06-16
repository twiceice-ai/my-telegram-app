-- Создание таблицы пользователей
CREATE TABLE IF NOT EXISTS users (
  id BIGINT PRIMARY KEY, -- Telegram user ID
  username VARCHAR(50),
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Создание enum типов
CREATE TYPE document_type AS ENUM ('tz', 'brief');
CREATE TYPE document_status AS ENUM ('draft', 'active', 'completed', 'rejected');

-- Создание таблицы документов
CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(100) NOT NULL,
  type document_type NOT NULL,
  status document_status DEFAULT 'draft',
  design_config JSONB DEFAULT '{}',
  content JSONB DEFAULT '{}',
  preview_image TEXT,
  is_template BOOLEAN DEFAULT FALSE,
  shared_with TEXT[], -- массив username'ов
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Создание индексов для оптимизации запросов
CREATE INDEX IF NOT EXISTS idx_documents_user_id ON documents(user_id);
CREATE INDEX IF NOT EXISTS idx_documents_status ON documents(status);
CREATE INDEX IF NOT EXISTS idx_documents_type ON documents(type);
CREATE INDEX IF NOT EXISTS idx_documents_created_at ON documents(created_at DESC);

-- Создание таблицы для отслеживания доступа к документам
CREATE TABLE IF NOT EXISTS document_access (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
  user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
  access_type VARCHAR(20) DEFAULT 'view', -- view, edit, admin
  granted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(document_id, user_id)
);
