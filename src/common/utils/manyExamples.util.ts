import { getSchemaPath } from '@nestjs/swagger';
import { IBase, IManyExamples } from '../types/manyExamples.type';

export const manyExamples = (examples: IManyExamples): IBase => {
  const base: IBase = {};
  const mediaType = {
    schema: {
      oneOf: [],
    },
    examples: {},
  };

  Object.entries(examples).forEach(([examplesKey, examplesValue]) => {
    Object.entries(examplesValue).forEach(([exampleKey, exampleValue]) => {
      mediaType.schema.oneOf.push({
        $ref: getSchemaPath(exampleValue.type),
      });

      mediaType.examples[exampleKey] = {
        summary: exampleValue.summary,
        value: exampleValue.value,
      };
    });

    base[examplesKey] = mediaType;
  });

  return base;
};
