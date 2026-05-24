import { Type, applyDecorators } from '@nestjs/common';
import { ApiExtraModels, ApiOkResponse, getSchemaPath } from '@nestjs/swagger';

/**
 * Swagger helper: documents an endpoint that returns a PaginatedResult<TModel>.
 * Keeps controllers free of repeated schema boilerplate.
 */
export const ApiPaginatedResponse = <TModel extends Type<unknown>>(model: TModel) =>
  applyDecorators(
    ApiExtraModels(model),
    ApiOkResponse({
      schema: {
        properties: {
          success: { type: 'boolean', example: true },
          data: {
            type: 'object',
            properties: {
              data: { type: 'array', items: { $ref: getSchemaPath(model) } },
              meta: {
                type: 'object',
                properties: {
                  total: { type: 'number' },
                  page: { type: 'number' },
                  limit: { type: 'number' },
                  totalPages: { type: 'number' },
                  hasNext: { type: 'boolean' },
                  hasPrev: { type: 'boolean' },
                },
              },
            },
          },
        },
      },
    }),
  );
