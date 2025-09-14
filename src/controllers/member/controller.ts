import httpStatus from 'http-status';
import pick from '../../utils/pick';
import ApiError from '../../utils/ApiError';
import catchAsync from '../../utils/catchAsync';
import { memberService } from '../../services';

const createMember = catchAsync(async (req, res) => {
  const {
    name,
    email,
    phone,
    institution,
    segment,
    interestAreas,
    joinDate,
    status,
    membershipPackageId,
    userId
  } = req.body;
  const member = await memberService.createMember(
    name,
    email,
    phone,
    institution,
    segment,
    interestAreas,
    joinDate,
    status,
    membershipPackageId,
    userId
  );
  res.status(httpStatus.CREATED).send(member);
});

const getMembers = catchAsync(async (req, res) => {
  const filter = pick(req.query, [
    'id',
    'name',
    'email',
    'phone',
    'institution',
    'segment',
    'interestAreas',
    'joinDate',
    'status'
  ]);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const result = await memberService.queryMembers(filter, options);
  res.send(result);
});

const getMember = catchAsync(async (req, res) => {
  const member = await memberService.getMemberById(req.params.memberId);
  if (!member) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Member not found');
  }
  res.send(member);
});

const updateMember = catchAsync(async (req, res) => {
  const member = await memberService.updateMemberById(req.params.memberId, req.body);
  res.send(member);
});

const deleteMember = catchAsync(async (req, res) => {
  await memberService.deleteMemberById(req.params.memberId);
  res.status(httpStatus.NO_CONTENT).send();
});

export default {
  createMember,
  getMembers,
  getMember,
  updateMember,
  deleteMember
};
