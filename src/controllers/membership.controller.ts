import httpStatus from 'http-status';
import pick from '../utils/pick';
import ApiError from '../utils/ApiError';
import catchAsync from '../utils/catchAsync';
import { membershipService } from '../services';

const createMembershipPackage = catchAsync(async (req, res) => {
  const { name, description, price } = req.body;
  const membershipPackage = await membershipService.createMembershipPackage(
    name,
    description,
    price
  );
  res.status(httpStatus.CREATED).send(membershipPackage);
});

const getMembershipPackages = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['id', 'name', 'description', 'price', 'createdAt', 'updatedAt']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const result = await membershipService.queryMembershipPackages(filter, options);
  res.send(result);
});

const getMembershipPackage = catchAsync(async (req, res) => {
  const membershipPackage = await membershipService.getMembershipPackageById(
    req.params.membershipPackageId
  );
  if (!membershipPackage) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Membership package not found');
  }
  res.send(membershipPackage);
});

const updateMembershipPackage = catchAsync(async (req, res) => {
  const membershipPackage = await membershipService.updateMembershipPackageById(
    req.params.membershipPackageId,
    req.body
  );
  res.send(membershipPackage);
});

const deleteMembershipPackage = catchAsync(async (req, res) => {
  await membershipService.deleteMembershipPackageById(req.params.membershipPackageId);
  res.status(httpStatus.NO_CONTENT).send();
});

export default {
  createMembershipPackage,
  getMembershipPackages,
  getMembershipPackage,
  updateMembershipPackage,
  deleteMembershipPackage
};
