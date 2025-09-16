import httpStatus from 'http-status';
import pick from '../../utils/pick';
import ApiError from '../../utils/ApiError';
import catchAsync from '../../utils/catchAsync';
import { programService } from '../../services';

const createProgram = catchAsync(async (req, res) => {
  const { name, description, startDate, endDate, priceMember, priceNonMember, category } = req.body;
  // const id = createUUID();
  const program = await programService.createProgram(
    name,
    description,
    startDate,
    endDate,
    priceMember,
    priceNonMember,
    category
  );
  res.status(httpStatus.CREATED).send(program);
});

const getPrograms = catchAsync(async (req, res) => {
  const filter = pick(req.query, [
    'id',
    'name',
    'description',
    'category',
    'status',
    'startDate',
    'endDate',
    'priceMember',
    'priceNonMember'
  ]);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const result = await programService.queryPrograms(filter, options);
  res.send(result);
});

const getProgram = catchAsync(async (req, res) => {
  const program = await programService.getProgramById(req.params.programId);
  if (!program) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Program not found');
  }
  res.send(program);
});

const updateProgram = catchAsync(async (req, res) => {
  const program = await programService.updateProgramById(req.params.programId, req.body);
  res.send(program);
});

const deleteProgram = catchAsync(async (req, res) => {
  await programService.deleteProgramById(req.params.programId);
  res.status(httpStatus.NO_CONTENT).send();
});

export default {
  createProgram,
  getPrograms,
  getProgram,
  updateProgram,
  deleteProgram
};
