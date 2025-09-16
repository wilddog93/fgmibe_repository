import httpStatus from 'http-status';
import pick from '../../utils/pick';
import catchAsync from '../../utils/catchAsync';
import { programRegistrationService } from '../../services';
import { ProgramRegistrationParams } from '../../services/program-registration/service';

const getProgramRegistration = catchAsync(async (req, res) => {
  // ambil filter dari query
  const filter: ProgramRegistrationParams = {
    id: req.query.id as string | undefined,
    email: req.query.email as string | undefined,
    phone: req.query.phone as string | null | undefined,
    segment: req.query.segment as any, // bisa casting ke enum Segment kalau lo import
    institution: req.query.institution as string | null | undefined,
    registeredAt: req.query.registeredAt ? new Date(req.query.registeredAt as string) : undefined,
    source: req.query.source as any, // casting ke enum RegistrationSource juga bisa

    program: req.query.program
      ? ({ name: req.query.program as string } as any) // minimal kasih object karena di service expect Program
      : ({} as any),

    member: req.query.member ? ({ name: req.query.member as string } as any) : undefined
  };

  const options = pick(req.query, ['sortBy', 'limit', 'page', 'sortType']);

  const result = await programRegistrationService.queryProgramRegistrations(filter, {
    limit: options.limit ? Number(options.limit) : 10,
    page: options.page ? Number(options.page) : 1,
    sortBy: options.sortBy as string,
    sortType: options.sortType as 'asc' | 'desc'
  });

  res.status(httpStatus.OK).send(result);
});

export default {
  getProgramRegistration
};
