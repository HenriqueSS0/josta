/*
  # Adicionar dados de demonstração

  1. Novas Categorias
    - Livros, Música, Beleza, Brinquedos

  2. Novos Produtos
    - Produtos variados para demonstração
    - Diferentes níveis de estoque

  3. Atualizações
    - Ajustar estoque de produtos existentes
*/

-- Inserir categorias adicionais para demonstração (usando WHERE NOT EXISTS)
INSERT INTO categories (name, description, image_url)
SELECT 'Livros', 'Livros de diversos gêneros e autores', 'https://images.pexels.com/photos/159711/books-bookstore-book-reading-159711.jpeg'
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Livros');

INSERT INTO categories (name, description, image_url)
SELECT 'Música', 'CDs, vinis e instrumentos musicais', 'https://images.pexels.com/photos/164821/pexels-photo-164821.jpeg'
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Música');

INSERT INTO categories (name, description, image_url)
SELECT 'Beleza', 'Cosméticos, perfumes e produtos de cuidado pessoal', 'https://images.pexels.com/photos/3373736/pexels-photo-3373736.jpeg'
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Beleza');

INSERT INTO categories (name, description, image_url)
SELECT 'Brinquedos', 'Jogos, brinquedos educativos e de entretenimento', 'https://images.pexels.com/photos/163064/play-stone-network-networked-interactive-163064.jpeg'
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Brinquedos');

-- Inserir produtos adicionais para demonstração (usando WHERE NOT EXISTS)
INSERT INTO products (name, description, price, stock, category_id, image_url)
SELECT 'Livro: O Alquimista', 'Romance de Paulo Coelho sobre seguir seus sonhos', 29.99, 50, 
       (SELECT id FROM categories WHERE name = 'Livros' LIMIT 1), 
       'https://images.pexels.com/photos/159711/books-bookstore-book-reading-159711.jpeg'
WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = 'Livro: O Alquimista');

INSERT INTO products (name, description, price, stock, category_id, image_url)
SELECT 'Violão Clássico', 'Violão para iniciantes com cordas de nylon', 299.99, 15,
       (SELECT id FROM categories WHERE name = 'Música' LIMIT 1),
       'https://images.pexels.com/photos/164821/pexels-photo-164821.jpeg'
WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = 'Violão Clássico');

INSERT INTO products (name, description, price, stock, category_id, image_url)
SELECT 'Perfume Importado', 'Fragrância masculina amadeirada', 189.99, 30,
       (SELECT id FROM categories WHERE name = 'Beleza' LIMIT 1),
       'https://images.pexels.com/photos/3373736/pexels-photo-3373736.jpeg'
WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = 'Perfume Importado');

INSERT INTO products (name, description, price, stock, category_id, image_url)
SELECT 'Quebra-cabeça 1000 peças', 'Quebra-cabeça com paisagem natural', 45.99, 25,
       (SELECT id FROM categories WHERE name = 'Brinquedos' LIMIT 1),
       'https://images.pexels.com/photos/163064/play-stone-network-networked-interactive-163064.jpeg'
WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = 'Quebra-cabeça 1000 peças');

INSERT INTO products (name, description, price, stock, category_id, image_url)
SELECT 'Calça Jeans Premium', 'Calça jeans com corte moderno e lavagem especial', 179.99, 40,
       (SELECT id FROM categories WHERE name = 'Roupas' LIMIT 1),
       'https://images.pexels.com/photos/1040945/pexels-photo-1040945.jpeg'
WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = 'Calça Jeans Premium');

INSERT INTO products (name, description, price, stock, category_id, image_url)
SELECT 'Tablet 10 polegadas', 'Tablet para estudos e entretenimento', 899.99, 20,
       (SELECT id FROM categories WHERE name = 'Eletrônicos' LIMIT 1),
       'https://images.pexels.com/photos/205421/pexels-photo-205421.jpeg'
WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = 'Tablet 10 polegadas');

INSERT INTO products (name, description, price, stock, category_id, image_url)
SELECT 'Tênis Casual', 'Tênis confortável para uso diário', 159.99, 55,
       (SELECT id FROM categories WHERE name = 'Calçados' LIMIT 1),
       'https://images.pexels.com/photos/2529148/pexels-photo-2529148.jpeg'
WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = 'Tênis Casual');

INSERT INTO products (name, description, price, stock, category_id, image_url)
SELECT 'Vaso Decorativo', 'Vaso de cerâmica para plantas ornamentais', 79.99, 18,
       (SELECT id FROM categories WHERE name = 'Casa & Jardim' LIMIT 1),
       'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg'
WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = 'Vaso Decorativo');

INSERT INTO products (name, description, price, stock, category_id, image_url)
SELECT 'Raquete de Tênis', 'Raquete profissional para tênis', 249.99, 12,
       (SELECT id FROM categories WHERE name = 'Esportes' LIMIT 1),
       'https://images.pexels.com/photos/863988/pexels-photo-863988.jpeg'
WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = 'Raquete de Tênis');

INSERT INTO products (name, description, price, stock, category_id, image_url)
SELECT 'Batom Matte', 'Batom de longa duração cor vermelha', 39.99, 80,
       (SELECT id FROM categories WHERE name = 'Beleza' LIMIT 1),
       'https://images.pexels.com/photos/3373736/pexels-photo-3373736.jpeg'
WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = 'Batom Matte');

-- Atualizar alguns produtos existentes para ter mais variedade de estoque
UPDATE products SET stock = 5 WHERE name = 'Mesa de Escritório';
UPDATE products SET stock = 100 WHERE name = 'Camiseta Básica Premium';
UPDATE products SET stock = 3 WHERE name = 'Notebook Dell Inspiron';