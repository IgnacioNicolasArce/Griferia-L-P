-- Esquema de base de datos para Grifería L&P en Supabase
-- Ejecutar este script en el SQL Editor de Supabase

-- Tabla de usuarios
CREATE TABLE IF NOT EXISTS users (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  role TEXT DEFAULT 'client' CHECK (role IN ('admin', 'client')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de productos
CREATE TABLE IF NOT EXISTS products (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  stock INTEGER NOT NULL DEFAULT 0,
  image_url TEXT,
  category TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de órdenes
CREATE TABLE IF NOT EXISTS orders (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  total DECIMAL(10,2) NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'shipped', 'delivered', 'cancelled')),
  shipping_address TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de items de órdenes
CREATE TABLE IF NOT EXISTS order_items (
  id BIGSERIAL PRIMARY KEY,
  order_id BIGINT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de contactos
CREATE TABLE IF NOT EXISTS contacts (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON order_items(product_id);

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para actualizar updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Políticas de seguridad RLS (Row Level Security)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;

-- Políticas para usuarios (solo pueden ver/editar su propio perfil)
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid()::text = id::text);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid()::text = id::text);

-- Políticas para productos (todos pueden leer, solo admins pueden escribir)
CREATE POLICY "Anyone can view products" ON products
  FOR SELECT USING (true);

CREATE POLICY "Only admins can insert products" ON products
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id::text = auth.uid()::text 
      AND users.role = 'admin'
    )
  );

CREATE POLICY "Only admins can update products" ON products
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id::text = auth.uid()::text 
      AND users.role = 'admin'
    )
  );

CREATE POLICY "Only admins can delete products" ON products
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id::text = auth.uid()::text 
      AND users.role = 'admin'
    )
  );

-- Políticas para órdenes (usuarios solo pueden ver sus propias órdenes)
CREATE POLICY "Users can view own orders" ON orders
  FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can create own orders" ON orders
  FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

-- Políticas para order_items
CREATE POLICY "Users can view order items for own orders" ON order_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM orders 
      WHERE orders.id = order_items.order_id 
      AND orders.user_id::text = auth.uid()::text
    )
  );

CREATE POLICY "Users can create order items for own orders" ON order_items
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders 
      WHERE orders.id = order_items.order_id 
      AND orders.user_id::text = auth.uid()::text
    )
  );

-- Políticas para contactos (cualquiera puede crear contactos)
CREATE POLICY "Anyone can create contacts" ON contacts
  FOR INSERT WITH CHECK (true);

-- Crear usuario admin por defecto
INSERT INTO users (name, email, password, role) VALUES 
('Admin', 'admin@griferia.com', '$2a$10$X97vX3UpXtmLrQFMKzEA/.OAPDQxz0I6GAVumKFp1IuIlbDTsn9cO', 'admin')
ON CONFLICT (email) DO NOTHING;

-- Insertar productos de ejemplo
INSERT INTO products (name, description, price, stock, image_url, category) VALUES
('Grifo de Cocina Moderno', 'Grifo de cocina con tecnología de ahorro de agua y diseño moderno', 25000, 15, 'data:image/jpeg;base64,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', 'Cocina'),
('Ducha de Lluvia', 'Ducha de lluvia con múltiples chorros y regulador de temperatura', 45000, 8, 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=400&h=300&fit=crop&crop=center', 'Baño'),
('Lavamanos de Pedestal', 'Lavamanos elegante de porcelana con grifo incluido', 35000, 12, 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=300&fit=crop&crop=center', 'Baño'),
('Grifo de Baño', 'Grifo de baño con acabado cromado y válvula de ahorro', 18000, 20, 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=400&h=300&fit=crop&crop=center', 'Baño'),
('Accesorio de Ducha', 'Set completo de accesorios para ducha con porta jabón', 12000, 25, 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=400&h=300&fit=crop&crop=center', 'Accesorios')
ON CONFLICT DO NOTHING;
