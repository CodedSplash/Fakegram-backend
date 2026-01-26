import {
  ReferenceObject,
  SchemaObject,
} from '@nestjs/swagger/dist/interfaces/open-api-spec.interface';

interface IExample {
  summary: string;
  type: any;
  value: any;
}

export interface IManyExamples {
  [key: string]: {
    [key: string]: IExample;
  };
}

export interface IBase {
  [key: string]: {
    schema: {
      oneOf: (SchemaObject | ReferenceObject)[];
    };
    examples: any;
  };
}
