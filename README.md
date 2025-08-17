# Role-Based Access Control System

A secure authentication system built with Next.js 15, Prisma ORM, and MySQL, featuring role-based access control with four distinct user roles: Administrator, Manager, Employee, and Collaborator.

## Features

- 🔐 **Secure Authentication**: Email/password-based authentication with JWT tokens
- 👥 **Role-Based Access Control**: Four distinct user roles with hierarchical permissions
- 🎨 **Modern UI**: Built with shadcn/ui components and Tailwind CSS
- 📧 **Password Reset**: SMTP-based password reset functionality
- 🛡️ **Route Protection**: Middleware-based route protection and role verification
- 🗄️ **Database Integration**: MySQL database with Prisma ORM
- 📱 **Responsive Design**: Mobile-first responsive design

## User Roles

### Administrator (Level 4)
- Full system access and control
- User management and role assignment
- System settings and configuration
- Security controls and monitoring
- Database management

### Manager (Level 3)
- Team and project management
- Reports and analytics
- Limited administrative access
- User oversight capabilities

### Employee (Level 2)
- Daily task management
- Time tracking and reporting
- Personal dashboard access
- Project collaboration

### Collaborator (Level 1)
- Limited project viewing
- Feedback submission
- Team contact capabilities
- Restricted system access

## Tech Stack

- **Frontend**: Next.js 15 with App Router
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Database**: MySQL with Prisma ORM
- **Authentication**: Custom JWT-based system
- **Email**: Nodemailer with SMTP
- **Language**: TypeScript

## Prerequisites

- Node.js 18+ 
- MySQL database
- SMTP server (Gmail, SendGrid, etc.)

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd prismafiles
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env.local
   ```
   
   Update `.env.local` with your configuration:
   ```env
   # Database
   DATABASE_URL="mysql://username:password@localhost:3306/prismafiles"
   
   # Auth.js
   AUTH_SECRET="your-super-secret-auth-secret-key-here"
   AUTH_URL="http://localhost:3000"
   
   # SMTP Configuration
   SMTP_HOST="smtp.gmail.com"
   SMTP_PORT=587
   SMTP_USER="your-email@gmail.com"
   SMTP_PASS="your-app-password"
   SMTP_FROM="noreply@yourdomain.com"
   
   # Next.js
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="your-super-secret-auth-secret-key-here"
   ```

4. **Set up the database**
   ```bash
   # Generate Prisma client
   npx prisma generate
   
   # Run database migrations
   npx prisma db push
   
   # (Optional) Open Prisma Studio
   npx prisma studio
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

## Database Schema

The system uses the following main models:

- **User**: Core user information with role assignment
- **Account**: OAuth account linking (for future extensibility)
- **Session**: User session management
- **VerificationToken**: Password reset and email verification tokens

## API Endpoints

### Authentication
- `POST /api/auth/signin` - User login
- `POST /api/auth/signup` - User registration
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password with token
- `POST /api/auth/logout` - User logout

### Protected Routes
- `/dashboard` - User dashboard (requires authentication)
- `/admin` - Admin panel (requires Administrator role)
- `/profile` - User profile (requires authentication)

## Usage

### 1. User Registration
Navigate to `/auth/signup` to create a new account. Users can select their role during registration.

### 2. User Authentication
Use `/auth/signin` to log in with email and password.

### 3. Password Reset
- Go to `/auth/forgot-password` to request a reset
- Check email for reset link
- Use `/auth/reset-password?token=<token>` to set new password

### 4. Role-Based Access
- Different user roles see different content and have different permissions
- Middleware automatically protects routes based on user roles
- Unauthorized access attempts are redirected appropriately

## Security Features

- **JWT Tokens**: Secure, HTTP-only cookies for authentication
- **Password Hashing**: bcrypt with salt rounds for password security
- **Role Verification**: Server-side role checking for all protected routes
- **Input Validation**: Comprehensive input validation and sanitization
- **CSRF Protection**: Built-in CSRF protection through Next.js
- **Rate Limiting**: Configurable rate limiting for API endpoints

## Customization

### Adding New Roles
1. Update the `UserRole` enum in `prisma/schema.prisma`
2. Add role logic in `src/lib/auth-utils.ts`
3. Update middleware configuration in `src/middleware.ts`
4. Add role-specific UI components

### Modifying Permissions
1. Update the `roleHierarchy` object in `src/middleware.ts`
2. Modify route protection rules
3. Update UI components to show/hide based on roles

### Styling
- All styling uses Tailwind CSS utility classes
- shadcn/ui components can be customized through CSS variables
- Theme colors are defined in `src/app/globals.css`

## Deployment

### Production Considerations
1. **Environment Variables**: Ensure all sensitive data is properly configured
2. **Database**: Use production-ready MySQL instance with connection pooling
3. **SMTP**: Configure production SMTP service (SendGrid, AWS SES, etc.)
4. **HTTPS**: Always use HTTPS in production
5. **Secrets**: Use strong, unique secrets for AUTH_SECRET

### Deployment Platforms
- **Vercel**: Optimized for Next.js applications
- **Netlify**: Good for static and serverless deployments
- **AWS/GCP**: Full control over infrastructure
- **Docker**: Containerized deployment option

## Troubleshooting

### Common Issues

1. **Database Connection Errors**
   - Verify DATABASE_URL format
   - Check MySQL server status
   - Ensure database exists and user has proper permissions

2. **Authentication Issues**
   - Verify AUTH_SECRET is set and consistent
   - Check JWT token expiration settings
   - Ensure cookies are properly configured

3. **Email Not Working**
   - Verify SMTP credentials
   - Check firewall/network restrictions
   - Test with different SMTP providers

4. **Role Access Issues**
   - Verify user role assignment in database
   - Check middleware configuration
   - Ensure proper role hierarchy setup

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions:
- Create an issue in the repository
- Check the troubleshooting section
- Review the code examples and documentation

## Roadmap

- [ ] OAuth provider integration (Google, GitHub, etc.)
- [ ] Two-factor authentication (2FA)
- [ ] Audit logging system
- [ ] Advanced permission system
- [ ] API rate limiting
- [ ] User activity monitoring
- [ ] Bulk user import/export
- [ ] Advanced reporting and analytics
