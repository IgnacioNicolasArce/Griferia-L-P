-- Actualizar tabla orders para soportar Mercado Pago
-- Ejecutar este script en el SQL Editor de Supabase

-- Agregar columnas necesarias para Mercado Pago
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS payment_method TEXT DEFAULT 'cash',
ADD COLUMN IF NOT EXISTS payment_id TEXT,
ADD COLUMN IF NOT EXISTS external_reference TEXT,
ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS notes TEXT;

-- Actualizar constraint de status para incluir estados de pago
ALTER TABLE orders 
DROP CONSTRAINT IF EXISTS orders_status_check;

ALTER TABLE orders 
ADD CONSTRAINT orders_status_check 
CHECK (status IN ('pending', 'pending_payment', 'paid', 'processing', 'shipped', 'delivered', 'cancelled'));

-- Actualizar constraint de payment_status
ALTER TABLE orders 
ADD CONSTRAINT orders_payment_status_check 
CHECK (payment_status IN ('pending', 'approved', 'rejected', 'cancelled'));

-- Crear índices para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_orders_payment_id ON orders(payment_id);
CREATE INDEX IF NOT EXISTS idx_orders_external_reference ON orders(external_reference);
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON orders(payment_status);

-- Comentarios para documentación
COMMENT ON COLUMN orders.payment_method IS 'Método de pago: mercadopago, transfer, cash';
COMMENT ON COLUMN orders.payment_id IS 'ID del pago en Mercado Pago';
COMMENT ON COLUMN orders.external_reference IS 'Referencia externa para Mercado Pago';
COMMENT ON COLUMN orders.payment_status IS 'Estado del pago: pending, approved, rejected, cancelled';
COMMENT ON COLUMN orders.notes IS 'Notas adicionales del cliente';
