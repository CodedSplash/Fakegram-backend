import { ValidationError } from '@domain/common/errors/domain.error';
import { SelfFollowError } from '@domain/Follow/errors/follow.errors';
import { UserIdVO } from '@domain/User/value-objects/userId.vo';
import { FollowIdVO } from '@domain/Follow/value-objects/followId.vo';

export class Follow {
  private readonly _id: FollowIdVO;
  private _followerId: UserIdVO;
  private _followingId: UserIdVO;
  private _createdAt: Date;

  constructor(follow: {
    id: string;
    followerId: string;
    followingId: string;
    createdAt?: Date;
  }) {
    this._validation(follow.followerId, follow.followingId);

    this._id = new FollowIdVO(follow.id);
    this._followerId = new UserIdVO(follow.followerId);
    this._followingId = new UserIdVO(follow.followingId);
    this._createdAt = follow?.createdAt ? follow.createdAt : new Date();
  }

  private _validation(followerId: string, followingId: string) {
    if (!followerId.trim()) {
      throw new ValidationError('Follower id cannot be empty.');
    }
    if (!followingId.trim()) {
      throw new ValidationError('Following id cannot be empty.');
    }
    if (followerId === followingId) {
      throw new SelfFollowError();
    }
  }

  get id() {
    return this._id;
  }
  get followerId() {
    return this._followerId;
  }
  get followingId() {
    return this._followingId;
  }
  get createdAt() {
    return this._createdAt;
  }
}
