import { PrismaClient } from '../src/generated/prisma'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed...')

  // Check if admin user already exists
  const existingAdmin = await prisma.user.findUnique({
    where: { email: 'admin@example.com' }
  })

  if (existingAdmin) {
    console.log('✅ Admin user already exists')
    return
  }

  // Create admin user
  const hashedPassword = await bcrypt.hash('1f1femsk', 12)
  
  const adminUser = await prisma.user.create({
    data: {
      email: 'gkozyris@i4ria.com',
      password: hashedPassword,
      name: 'System Administrator',
      role: 'ADMINISTRATOR'
    }
  })

  console.log('✅ Created admin user:', adminUser.email)
  console.log('📝 Default credentials:')
  console.log('   Email: gkozyris@i4ria.com')
  console.log('   Password: 1f1femsk')
  console.log('⚠️  Remember to change the password after first login!')

  // Create some sample users for testing
  const sampleUsers = [
    {
      email: 'manager@example.com',
      password: 'manager123',
      name: 'Project Manager',
      role: 'MANAGER' as const
    },
    {
      email: 'employee@example.com',
      password: 'employee123',
      name: 'John Employee',
      role: 'EMPLOYEE' as const
    },
    {
      email: 'collaborator@example.com',
      password: 'collab123',
      name: 'External Collaborator',
      role: 'COLLABORATOR' as const
    }
  ]

  for (const userData of sampleUsers) {
    const existingUser = await prisma.user.findUnique({
      where: { email: userData.email }
    })

    if (!existingUser) {
      const hashedPassword = await bcrypt.hash(userData.password, 12)
      
      await prisma.user.create({
        data: {
          email: userData.email,
          password: hashedPassword,
          name: userData.name,
          role: userData.role
        }
      })

      console.log(`✅ Created ${userData.role.toLowerCase()} user: ${userData.email}`)
    }
  }

  console.log('🎉 Database seeding completed!')
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
