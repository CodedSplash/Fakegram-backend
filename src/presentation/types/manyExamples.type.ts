import { ReferenceObject, SchemaObject } from '@nestjs/swagger';

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
