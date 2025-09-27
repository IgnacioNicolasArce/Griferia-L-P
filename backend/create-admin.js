const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');

// Configuración de Supabase con service_role key
const supabaseUrl = 'https://elfgaqydhlulttrbthys.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVsZmdhcXlkaGx1bHR0cmJ0aHlzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkwMDgyODYsImV4cCI6MjA3NDU4NDI4Nn0.eDMW-E1nrCz5QE1KHCLGb40ZKM3ubMlm17F6kCruhqo';

// NOTA: Para crear usuarios admin, necesitas la service_role key
// Obtén la service_role key desde Settings > API en tu dashboard de Supabase
// const supabaseKey = 'tu_service_role_key_aqui';

const supabase = createClient(supabaseUrl, supabaseKey);

async function createAdminUser() {
  try {
    console.log('🔍 Verificando si el usuario admin ya existe...');
    
    // Verificar si ya existe
    const { data: existingUser } = await supabase
      .from('users')
      .select('*')
      .eq('email', 'admin@griferia.com')
      .single();

    if (existingUser) {
      console.log('✅ Usuario admin ya existe:', existingUser.email);
      console.log('🔑 Credenciales:');
      console.log('   Email: admin@griferia.com');
      console.log('   Password: admin123');
      return;
    }

    console.log('👤 Creando usuario administrador...');
    
    // Crear hash de la contraseña
    const adminPassword = bcrypt.hashSync('admin123', 10);
    
    // Crear usuario admin
    const { data: newUser, error } = await supabase
      .from('users')
      .insert({
        name: 'Admin',
        email: 'admin@griferia.com',
        password: adminPassword,
        role: 'admin'
      })
      .select()
      .single();

    if (error) {
      console.error('❌ Error creando usuario admin:', error.message);
      console.log('💡 Solución: Usa el SQL Editor en Supabase con el comando:');
      console.log(`
INSERT INTO users (name, email, password, role) VALUES 
('Admin', 'admin@griferia.com', '$2a$10$X97vX3UpXtmLrQFMKzEA/.OAPDQxz0I6GAVumKFp1IuIlbDTsn9cO', 'admin')
ON CONFLICT (email) DO NOTHING;
      `);
      return;
    }

    console.log('✅ Usuario administrador creado exitosamente!');
    console.log('🔑 Credenciales:');
    console.log('   Email: admin@griferia.com');
    console.log('   Password: admin123');
    console.log('   Role: admin');

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

createAdminUser();
