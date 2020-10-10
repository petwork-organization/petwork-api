import { ValidationError } from 'apollo-server-express';
import { Repository } from 'typeorm';
import { User } from '../user.model';
import { Register } from './register.service';
import * as bcrypt from 'bcrypt';
import { SubscriptionInput } from '../../../application/api/users/inputs/subscription.input';
import { UsersRepository } from '../../../infrastructure/persistence/users/users.repository';

describe('Register', () => {
  const _ID = 'ID';
  const EMAIL = 'test@test.com';
  const PASSWORD = 'password';
  const FIRSTNAME = 'test';
  const LASTNAME = 'TEST';
  const IS_SUSPENDED = false;

  let usersRepository: UsersRepository;
  let subscriptionManager: Register;

  beforeEach(async () => {
    usersRepository = new UsersRepository(new Repository<User>());
    subscriptionManager = new Register(usersRepository);
  });

  describe('subscription', () => {
    it('should subscribe an user', async () => {
      const subscription = new SubscriptionInput(
        EMAIL,
        PASSWORD,
        FIRSTNAME,
        LASTNAME,
      );
      const mockedUser = User.subscribe(subscription);

      jest
        .spyOn(usersRepository, 'save')
        .mockImplementation(async () => mockedUser);
      jest.spyOn(usersRepository, 'findByEmail').mockImplementation(async () => []);

      const subscriber = await subscriptionManager.subscribe(subscription);

      expect(subscriber.email).toEqual(EMAIL);
      expect(await bcrypt.compare(PASSWORD, subscriber.password)).toEqual(true);
      expect(subscriber.firstname).toEqual(FIRSTNAME);
      expect(subscriber.lastname).toEqual(LASTNAME);
      expect(subscriber.isSuspended).toEqual(IS_SUSPENDED);
    });

    it('should throw validation error', async () => {
      const mockedUser = new User(_ID, EMAIL, PASSWORD, FIRSTNAME, LASTNAME);
      jest
        .spyOn(usersRepository, 'save')
        .mockImplementation(async () => mockedUser);
      jest
        .spyOn(usersRepository, 'findByEmail')
        .mockImplementation(async () => [mockedUser]);

      const subscriptionInput = new SubscriptionInput(
        EMAIL,
        PASSWORD,
        FIRSTNAME,
        LASTNAME,
      );

      expect(
        subscriptionManager.subscribe(subscriptionInput),
      ).rejects.toThrowError(ValidationError);
    });
  });
});
