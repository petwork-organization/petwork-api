import { Resolver, Query, Args, Mutation } from '@nestjs/graphql';
import { ProfileInput } from './inputs/profile.input';
import { SubscriptionInput } from './inputs/subscription.input';
import { User } from './models/user.model';
import { ProfileDisplayer } from './services/profile-displayer.service';
import { ProfileUpdater } from './services/profile-updater.service';
import { SubscriptionManager } from './services/subscription-manager.service';
import { Suspender } from './services/suspender.service';
import { PasswordUpdater } from './services/password-updater.service';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Resolver(of => User)
export class UsersResolver {
  constructor(
    private readonly subscriptionManager: SubscriptionManager,
    private readonly profileDisplayer: ProfileDisplayer,
    private readonly profileUpdater: ProfileUpdater,
    private readonly suspender: Suspender,
    private readonly passwordUpdater: PasswordUpdater,
  ) {}

  @Mutation(/* istanbul ignore next */ returns => User)
  async subscribe(
    @Args('subscription') subscription: SubscriptionInput,
  ): Promise<User> {
    return this.subscriptionManager.subscribe(subscription);
  }

  @UseGuards(JwtAuthGuard)
  @Query(/* istanbul ignore next */ returns => User)
  async showProfile(@Args('_id') _id: string): Promise<User> {
    return this.profileDisplayer.show(_id);
  }

  @UseGuards(JwtAuthGuard)
  @Mutation(/* istanbul ignore next */ returns => User)
  async updateProfile(@Args('profile') profile: ProfileInput): Promise<User> {
    return this.profileUpdater.update(profile);
  }

  @UseGuards(JwtAuthGuard)
  @Mutation(/* istanbul ignore next */ returns => User)
  async suspend(@Args('_id') _id: string): Promise<User> {
    return this.suspender.suspend(_id);
  }

  @UseGuards(JwtAuthGuard)
  @Mutation(/* istanbul ignore next */ returns => User)
  async updatePassword(
    @Args('_id') _id: string,
    @Args('password') password: string,
  ): Promise<User> {
    return this.passwordUpdater.update(_id, password);
  }
}
