/*
 * Copyright DataStax, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { types } from '../types';
import { Client } from '../../';
import Long = types.Long;

type UpperCaseLetters = "A" | "B" | "C" | "D" | "E" | "F" | "G" | "H" | "I" | "J" | "K" | "L" | "M" | "N" | "O" | "P" | "Q" | "R" | "S" | "T" | "U" | "V" | "W" | "X" | "Y" | "Z";
type lowerCaseLetters = "a" | "b" | "c" | "d" | "e" | "f" | "g" | "h" | "i" | "j" | "k" | "l" | "m" | "n" | "o" | "p" | "q" | "r" | "s" | "t" | "u" | "v" | "w" | "x" | "y" | "z";

type snakeCaseConditions<

  P extends string,
  S1 extends string,
  S2 extends string,
> = S1 extends UpperCaseLetters
  ? P extends ""
  ? false : P extends lowerCaseLetters
  ? true : S2 extends lowerCaseLetters
  ? true : false
  : false;

type snakeCase<
  S extends string,
  P extends string = ""> = S extends `${infer S1}${infer S2}${infer S3}`
  ? snakeCaseConditions<P, S1, S2> extends true
  ? `_${Lowercase<S1>}${snakeCase<`${S2}${S3}`, S1>}`
  : `${Lowercase<S1>}${snakeCase<`${S2}${S3}`, S1>}`
  : Lowercase<S>;


type getKeys<T> = snakeCase<keyof T>[];

export namespace mapping {
  interface TableMappings {
    getColumnName(propName: string): string;

    getPropertyName(columnName: string): string;

    objectToArray(obj: any): any[];

    objectToFixedCasing(obj: any): any;

    objectToTableCasing(obj: any): any;

    newObjectInstance(): any;
  }

  class DefaultTableMappings implements TableMappings {
    getColumnName(propName: string): string;

    getPropertyName(columnName: string): string;

    objectToArray(obj: any): any[];

    objectToFixedCasing(obj: any): any;

    objectToTableCasing(obj: any): any;

    newObjectInstance(): any;
  }

  class UnderscoreCqlToCamelCaseMappings implements TableMappings {
    private convertLongsToStrings: boolean;

    constructor(convertLongsToStrings?: boolean);

    getColumnName(propName: string): string;

    getPropertyName(columnName: string): string;

    objectToArray(obj: any): any[];

    objectToFixedCasing(obj: any): any;

    objectToTableCasing(obj: any): any;

    newObjectInstance(): any;
  }

  class UnderscoreCqlToPascalCaseMappings implements TableMappings {
    private convertLongsToStrings: boolean;

    constructor(convertLongsToStrings?: boolean);

    getColumnName(propName: string): string;

    getPropertyName(columnName: string): string;

    objectToArray(obj: any): any[];

    objectToFixedCasing(obj: any): any;

    objectToTableCasing(obj: any): any;

    newObjectInstance(): any;
  }

  interface Result<T = any> extends Iterator<T> {
    wasApplied(): boolean;

    first(): T | null;

    forEach(callback: (currentValue: T, index: number) => void, thisArg?: any): void;

    toArray(): T[];
  }

  type MappingExecutionOptions = {
    executionProfile?: string;
    isIdempotent?: boolean;
    logged?: boolean;
    timestamp?: number | Long;
    fetchSize?: number;
    pageState?: number;
  };

  interface ModelTables {
    name: string;
    isView: boolean;
  }

  class Mapper {
    constructor(client: Client, options?: MappingOptions);

    batch(items: ModelBatchItem[], executionOptions?: string | MappingExecutionOptions): Promise<Result>;

    forModel<T = any>(name: string): ModelMapper<T>;
  }

  type MappingOptions = {
    models: { [key: string]: ModelOptions; };
  };

  type FindDocInfo<T> = {
    fields?: getKeys<T>;
    orderBy?: { [key: string]: string; };
    limit?: number;
    allowFiltering?: boolean;
  };

  type InsertDocInfo<T> = {
    fields?: getKeys<T>;
    ttl?: number;
    ifNotExists?: boolean;
  };

  type UpdateDocInfo<T> = {
    fields?: getKeys<T>;
    ttl?: number;
    ifExists?: boolean;
    when?: { [key: string]: any; };
    orderBy?: { [key: string]: string; };
    limit?: number;
    deleteOnlyColumns?: boolean;
  };

  type RemoveDocInfo<T> = {
    fields?: getKeys<T>;
    ttl?: number;
    ifExists?: boolean;
    when?: { [key: string]: any; };
    deleteOnlyColumns?: boolean;
  };

  type ModelOptions = {
    tables?: string[] | ModelTables[];
    mappings?: TableMappings;
    columns?: { [key: string]: string | ModelColumnOptions; };
    keyspace?: string;
  };

  type ModelColumnOptions = {
    name: string;
    toModel?: (columnValue: any) => any;
    fromModel?: (modelValue: any) => any;
  };

  interface ModelBatchItem {

  }

  interface ModelBatchMapper {
    insert(doc: any, docInfo?: InsertDocInfo<T>): ModelBatchItem;

    remove(doc: any, docInfo?: RemoveDocInfo<T>): ModelBatchItem;

    update(doc: any, docInfo?: UpdateDocInfo<T>): ModelBatchItem;
  }

  interface ModelMapper<T = any> {
    name: string;
    batching: ModelBatchMapper;

    get(doc: Partial<T>, docInfo?: { fields?: getKeys<T>, allowFiltering?: boolean; }, executionOptions?: string | MappingExecutionOptions): Promise<null | T>;

    find(doc: Partial<T>, docInfo?: FindDocInfo<T>, executionOptions?: string | MappingExecutionOptions): Promise<Result<T>>;

    findAll(docInfo?: FindDocInfo<T>, executionOptions?: string | MappingExecutionOptions): Promise<Result<T>>;

    insert(doc: T, docInfo?: InsertDocInfo<T>, executionOptions?: string | MappingExecutionOptions): Promise<Result<T>>;

    update(doc: Partial<T>, docInfo?: UpdateDocInfo<T>, executionOptions?: string | MappingExecutionOptions): Promise<Result<T>>;

    remove(doc: Partial<T>, docInfo?: RemoveDocInfo<T>, executionOptions?: string | MappingExecutionOptions): Promise<Result<T>>;

    mapWithQuery(
      query: string,
      paramsHandler: (doc: any) => any[],
      executionOptions?: string | MappingExecutionOptions
    ): (doc: any, executionOptions?: string | MappingExecutionOptions) => Promise<Result<T>>;
  }

  namespace q {
    interface QueryOperator {

    }

    function in_(arr: any): QueryOperator;

    function gt(value: any): QueryOperator;

    function gte(value: any): QueryOperator;

    function lt(value: any): QueryOperator;

    function lte(value: any): QueryOperator;

    function notEq(value: any): QueryOperator;

    function and(condition1: any, condition2: any): QueryOperator;

    function incr(value: any): QueryOperator;

    function decr(value: any): QueryOperator;

    function append(value: any): QueryOperator;

    function prepend(value: any): QueryOperator;

    function remove(value: any): QueryOperator;
  }
}
