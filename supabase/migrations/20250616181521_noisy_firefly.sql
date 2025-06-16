/*
  # Sistema de E-commerce - Schema Inicial

  1. Novas Tabelas
    - `profiles` - Perfis de usuário com informações adicionais
    - `categories` - Categorias de produtos
    - `products` - Produtos do sistema
    - `orders` - Pedidos realizados
    - `order_items` - Itens dos pedidos
    - `cart_items` - Itens no carrinho de compras

  2. Segurança
    - Habilitar RLS em todas as tabelas
    - Políticas para usuários autenticados
    - Políticas específicas para administradores
*/

-- Criar enum para status de pedidos
CREATE TYPE order_status AS ENUM ('pending', 'processing', 'shipped', 'delivered', 'cancelled');

-- Criar enum para roles de usuário
CREATE TYPE user_role AS ENUM ('customer', 'admin', 'moderator');

-- Tabela de perfis de usuário
CREATE TABLE IF NOT EXISTS profiles (
  id uuid REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email text UNIQUE NOT NULL,
  full_name text NOT NULL,
  role user_role DEFAULT 'customer',
  avatar_url text,
  phone text,
  address text,
  city text,
  postal_code text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Tabela de categorias
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  image_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Tabela de produtos
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  price decimal(10,2) NOT NULL DEFAULT 0,
  stock integer NOT NULL DEFAULT 0,
  category_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  image_url text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Tabela de pedidos
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  status order_status DEFAULT 'pending',
  total_amount decimal(10,2) NOT NULL DEFAULT 0,
  shipping_address text NOT NULL,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Tabela de itens do pedido
CREATE TABLE IF NOT EXISTS order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
  product_id uuid REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  quantity integer NOT NULL DEFAULT 1,
  unit_price decimal(10,2) NOT NULL,
  total_price decimal(10,2) NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Tabela de carrinho de compras
CREATE TABLE IF NOT EXISTS cart_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  product_id uuid REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  quantity integer NOT NULL DEFAULT 1,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, product_id)
);

-- Habilitar RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;

-- Políticas para profiles
CREATE POLICY "Usuários podem ver próprio perfil"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Usuários podem atualizar próprio perfil"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Admins podem ver todos os perfis"
  ON profiles FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('admin', 'moderator')
    )
  );

-- Políticas para categories
CREATE POLICY "Todos podem ver categorias"
  ON categories FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Apenas admins podem gerenciar categorias"
  ON categories FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('admin', 'moderator')
    )
  );

-- Políticas para products
CREATE POLICY "Todos podem ver produtos ativos"
  ON products FOR SELECT
  TO authenticated
  USING (is_active = true);

CREATE POLICY "Admins podem gerenciar produtos"
  ON products FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('admin', 'moderator')
    )
  );

-- Políticas para orders
CREATE POLICY "Usuários podem ver próprios pedidos"
  ON orders FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem criar pedidos"
  ON orders FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins podem ver todos os pedidos"
  ON orders FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('admin', 'moderator')
    )
  );

-- Políticas para order_items
CREATE POLICY "Usuários podem ver itens de seus pedidos"
  ON order_items FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE id = order_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Usuários podem criar itens de pedido"
  ON order_items FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders
      WHERE id = order_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Admins podem gerenciar todos os itens"
  ON order_items FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('admin', 'moderator')
    )
  );

-- Políticas para cart_items
CREATE POLICY "Usuários podem gerenciar próprio carrinho"
  ON cart_items FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Função para criar perfil automaticamente
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (new.id, new.email, COALESCE(new.raw_user_meta_data->>'full_name', 'Usuário'));
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para criar perfil automaticamente
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Inserir dados iniciais
INSERT INTO categories (name, description, image_url) VALUES
  ('Eletrônicos', 'Smartphones, notebooks, tablets e acessórios', 'https://images.pexels.com/photos/356056/pexels-photo-356056.jpeg'),
  ('Roupas', 'Camisetas, calças, vestidos e acessórios de moda', 'https://images.pexels.com/photos/996329/pexels-photo-996329.jpeg'),
  ('Calçados', 'Tênis, sapatos, sandálias e botas', 'https://images.pexels.com/photos/2529148/pexels-photo-2529148.jpeg'),
  ('Casa & Jardim', 'Móveis, decoração e utensílios domésticos', 'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg'),
  ('Esportes', 'Equipamentos esportivos e roupas fitness', 'https://images.pexels.com/photos/863988/pexels-photo-863988.jpeg');

INSERT INTO products (name, description, price, stock, category_id, image_url) VALUES
  ('Smartphone Galaxy S24', 'Smartphone premium com câmera de 108MP e 256GB de armazenamento', 2499.99, 45, (SELECT id FROM categories WHERE name = 'Eletrônicos'), 'https://images.pexels.com/photos/699122/pexels-photo-699122.jpeg'),
  ('Notebook Dell Inspiron', 'Notebook para trabalho e estudos com Intel i7 e 16GB RAM', 3299.99, 23, (SELECT id FROM categories WHERE name = 'Eletrônicos'), 'https://images.pexels.com/photos/205421/pexels-photo-205421.jpeg'),
  ('Camiseta Básica Premium', 'Camiseta 100% algodão com corte moderno', 59.99, 120, (SELECT id FROM categories WHERE name = 'Roupas'), 'https://images.pexels.com/photos/8532616/pexels-photo-8532616.jpeg'),
  ('Tênis Esportivo Nike', 'Tênis para corrida com tecnologia de amortecimento', 299.99, 67, (SELECT id FROM categories WHERE name = 'Calçados'), 'https://images.pexels.com/photos/2529148/pexels-photo-2529148.jpeg'),
  ('Fone de Ouvido Bluetooth', 'Fone sem fio com cancelamento de ruído', 199.99, 89, (SELECT id FROM categories WHERE name = 'Eletrônicos'), 'https://images.pexels.com/photos/3394650/pexels-photo-3394650.jpeg'),
  ('Jaqueta Jeans', 'Jaqueta jeans clássica unissex', 149.99, 34, (SELECT id FROM categories WHERE name = 'Roupas'), 'https://images.pexels.com/photos/1040945/pexels-photo-1040945.jpeg'),
  ('Mesa de Escritório', 'Mesa ergonômica para home office', 599.99, 15, (SELECT id FROM categories WHERE name = 'Casa & Jardim'), 'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg'),
  ('Bola de Futebol', 'Bola oficial para jogos profissionais', 89.99, 78, (SELECT id FROM categories WHERE name = 'Esportes'), 'https://images.pexels.com/photos/863988/pexels-photo-863988.jpeg');