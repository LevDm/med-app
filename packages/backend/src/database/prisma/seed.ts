import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';

import { PrismaClient } from '@prisma/client';
import { addDays } from 'date-fns';

import { AppModule } from '../../app.module';
import { InviteService } from '../../invite/invite.service';
import { CreateUserDto } from '../../user/dto';
import { UserService } from '../../user/user.service';

const prisma = new PrismaClient();
async function main() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const userService = app.get(UserService);
  const configService = app.get(ConfigService);
  const inviteService = app.get(InviteService);

  const createUserIfNotExist = async (user: CreateUserDto) => {
    try {
      await userService.getUserByEmail(user.email);
    } catch (e) {
      let inviteId: string | undefined = undefined;
      if (user.role === 'doctor') {
        const invite = await inviteService.createInvite(addDays(new Date(), 1).toISOString());
        inviteId = invite.id;
      }
      await userService.createUser({ ...user, inviteId });
    }
  };
  const patientPassword = configService.get('SEED_PATIENT_PASSWORD');
  const doctorPassword = configService.get('SEED_DOCTOR_PASSWORD');
  const adminPassword = configService.get('SEED_ADMIN_PASSWORD');
  if (!patientPassword) throw new Error('No patient password');
  if (!doctorPassword) throw new Error('No doctor password');
  if (!adminPassword) throw new Error('No admin password');

  await createUserIfNotExist({
    email: 'doctor@gmail.com',
    firstName: 'Абрам',
    lastName: 'Докторович',
    password: doctorPassword,
    age: 22,
    role: 'doctor',
    gender: 'male',
  });
  await createUserIfNotExist({
    email: 'patient@gmail.com',
    firstName: 'Иван',
    lastName: 'Пациентович',
    password: patientPassword,
    age: 22,
    role: 'user',
    gender: 'male',
  });
  await createUserIfNotExist({
    email: 'admin@gmail.com',
    firstName: 'Владислав',
    lastName: 'Админыч',
    password: adminPassword,
    age: 22,
    role: 'admin',
    gender: 'male',
  });
  app.close();
}

main()
  .then(async () => {
    await prisma.$disconnect();
    process.exit(0);
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
