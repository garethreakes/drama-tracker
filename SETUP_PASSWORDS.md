# Password Setup Instructions

## Initial Setup Required!

Before anyone can log in, passwords need to be set for all users.

## Setting Passwords

1. **Lowri (Admin)** needs to set her password first
2. Go to http://localhost:3000/login
3. Since no passwords are set yet, you'll need to temporarily disable middleware

## Temporary Workaround to Set Initial Passwords

Run this command to set Lowri's password:

```bash
/opt/homebrew/bin/node -e "const { PrismaClient } = require('@prisma/client'); const prisma = new PrismaClient(); const password = Buffer.from('YOUR_PASSWORD_HERE').toString('base64'); prisma.person.update({ where: { name: 'Lowri' }, data: { password } }).then(() => console.log('✅ Password set!')).finally(() => prisma.\$disconnect())"
```

Replace `YOUR_PASSWORD_HERE` with Lowri's actual password.

Then Lowri can log in and set passwords for everyone else through the Manage Friends page!

## For Each Friend

1. Lowri logs in as admin
2. Goes to "Manage Friends"
3. Clicks "Change Password" on each friend's card
4. Sets a password for them
5. Friends can then log in and change their own passwords

## Security Note

This is a simple password system for a personal project. In production, you would use proper password hashing (bcrypt) and more secure authentication methods.
