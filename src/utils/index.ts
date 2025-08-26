import bcrypt from 'bcryptjs';

export const DefaultPassword = bcrypt.hashSync('Password123!', 10);
