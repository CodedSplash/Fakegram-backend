import { ValidationError } from '@domain/common/errors/domain.error';
import { SelfFollowError } from '@domain/Follow/errors/follow.errors';
import { UserIdVO } from '@domain/User/value-objects/userId.vo';
import { FollowIdVO } from '@domain/Follow/value-objects/followId.vo';

export class FollowRequest {
  private readonly _id: FollowIdVO;
  private _requesterId: UserIdVO;
  private _targetId: UserIdVO;
  private _createdAt: Date;

  constructor(request: {
    id: string;
    requesterId: string;
    targetId: string;
    createdAt?: Date;
  }) {
    this._validation(request.requesterId, request.targetId);

    this._id = new FollowIdVO(request.id);
    this._requesterId = new UserIdVO(request.requesterId);
    this._targetId = new UserIdVO(request.targetId);
    this._createdAt = request?.createdAt ? request.createdAt : new Date();
  }

  private _validation(requesterId: string, targetId: string) {
    if (!requesterId.trim()) {
      throw new ValidationError('Requester id cannot be empty.');
    }
    if (!targetId.trim()) {
      throw new ValidationError('Target id cannot be empty.');
    }
    if (requesterId === targetId) {
      throw new SelfFollowError();
    }
  }

  get id() {
    return this._id;
  }
  get requesterId() {
    return this._requesterId;
  }
  get targetId() {
    return this._targetId;
  }
  get createdAt() {
    return this._createdAt;
  }
}
