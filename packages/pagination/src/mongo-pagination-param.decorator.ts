import { BadRequestException, createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

const FIRST_PAGE: number = 1;
const DEFAULT_NUMBER_OF_RESULTS: number = 10;

/**
 * Mongo query
 */
export interface MongoPagination {
  filter: {
    // tslint:disable-next-line: no-any
    [key: string]: any;
  };
  limit: number;
  skip: number;
  sort: [];
  project: [];
}

export const getMongoQuery = (
  { pageName = 'page', perPageName = 'per_page' }: { pageName?: string; perPageName?: string } = {},
  ctx: ExecutionContext,
): MongoPagination => {
  const req: Request = ctx.switchToHttp().getRequest();
  const page: number = !isNaN(Number(req.query[pageName])) ? Number(req.query[pageName]) : FIRST_PAGE;
  const limit: number = !isNaN(Number(req.query[perPageName]))
    ? Number(req.query[perPageName])
    : DEFAULT_NUMBER_OF_RESULTS;
  let filter: {};
  let sort: [];
  let project: [];

  try {
    filter = req.query.filter !== undefined ? JSON.parse(req.query.filter as string) : {};
    sort = req.query.sort !== undefined ? JSON.parse(req.query.sort as string) : [];
    project = req.query.project !== undefined ? JSON.parse(req.query.project as string) : [];
  } catch (exception) {
    throw new BadRequestException('Either the sort, filter or project parameter cannot be parsed');
  }

  return {
    filter,
    limit,
    skip: (page - 1) * limit,
    sort,
    project,
  };
};

// tslint:disable-next-line:variable-name
export const MongoPaginationParamDecorator: () => ParameterDecorator = createParamDecorator(getMongoQuery);
