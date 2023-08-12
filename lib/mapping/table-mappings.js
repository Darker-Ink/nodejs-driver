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

'use strict';

const { Long } = require('../../index.js').types;

/**
 * Contains a set of methods to represent a row into a document and a document into a row.
 * @alias module:mapping~TableMappings
 * @interface
 */
class TableMappings {

  constructor() {
    this.ReservedWords = [
      'ADD', 'ALLOW', 'ALTER', 'AND', 'APPLY', 'ASC', 'AUTHORIZE', 'BATCH', 'BEGIN', 'BY', 'COLUMNFAMILY', 'CREATE', 'DELETE', 'DESC', 'DESCRIBE', 'DROP', 'ENTRIES', 'EXECUTE', 'FROM', 'FULL', 'GRANT', 'IF', 'IN', 'INDEX', 'INFINITY', 'INSERT', 'INTO', 'KEYSPACE', 'LIMIT', 'MODIFY', 'NAN', 'NORECURSIVE', 'NOT', 'NULL', 'OF', 'ON', 'OR', 'ORDER', 'PRIMARY', 'RENAME', 'REPLACE', 'REVOKE', 'SCHEMA', 'SELECT', 'SET', 'TABLE', 'TO', 'TOKEN', 'TRUNCATE', 'UNLOGGED', 'UPDATE', 'USE', 'USING', 'VIEW', 'WHERE', 'WITH'
    ].map((word) => word.toLowerCase());
  }

  /**
   * Method that is called by the mapper to create the instance of the document.
   * @return {Object}
   */
  newObjectInstance() {
    return {};
  }

  /**
   * Gets the name of the column based on the document property name.
   * @param {String} propName The name of the property.
   * @returns {String}
   */
  getColumnName(propName) {
    return propName;
  }

  /**
   * Gets the name of the document property based on the column name.
   * @param {String} columnName The name of the column.
   * @returns {String}
   */
  getPropertyName(columnName) {
    return columnName;
  }
}

/**
 * A [TableMappings]{@link module:mapping~TableMappings} implementation that converts CQL column names in all-lowercase
 * identifiers with underscores (snake case) to camel case (initial lowercase letter) property names.
 * <p>
 *   The conversion is performed without any checks for the source format, you should make sure that the source
 *   format is snake case for CQL identifiers and camel case for properties.
 * </p>
 * @alias module:mapping~UnderscoreCqlToCamelCaseMappings
 * @implements {module:mapping~TableMappings}
 */
class UnderscoreCqlToCamelCaseMappings extends TableMappings {
  /**
   * Creates a new instance of {@link UnderscoreCqlToCamelCaseMappings}
   */
  constructor() {
    super();
  }

  /**
   * Converts a property name in camel case to snake case.
   * @param {String} propName Name of the property to convert to snake case.
   * @return {String}
   */
  getColumnName(PropName) {
    const Propertyname = PropName.split(/(?=[A-Z])/).join('_').toLowerCase();

    if (this.ReservedWords.includes(Propertyname)) {
      return `${Propertyname}_`;
    } else {
      return Propertyname;
    }
  }

  /**
   * Converts a column name in snake case to camel case.
   * @param {String} columnName The column name to convert to camel case.
   * @return {String}
   */
  getPropertyName(columnName) {
    return columnName.replace(/_[a-z]/g, (match, offset) => ((offset === 0) ? match : match.substr(1).toUpperCase()));
  }

  /**
   * Converts an object to an array, converting all keys to camel case.
   * @param {any} obj The object to convert to an array
   * @returns {Array}
   */
  objectToArray(obj) {
    const Output = [];

    for (const [_, value] of Object.entries(obj)) {
      if (typeof value === "object") Output.push(this.objectToTableCasing(value));
      else Output.push(value);
    }

    return Output;
  }

  /**
   * Converts an object to fixed casing, converting all keys to camel case.
   * @param {any} obj The object to convert to fixed casing
   * @returns {Object}
   */
  objectToFixedCasing(obj) {
    if (!Array.isArray(obj)) {
      const newObject = {};

      for (const [key, value] of Object.entries(obj)) {
        if (value instanceof Date || value === null) {
          newObject[this.getPropertyName(key)] = value;
        } else if (typeof value === 'object') {
          newObject[this.getPropertyName(key)] = this.objectToFixedCasing(value);
        } else {
          newObject[this.getPropertyName(key)] = value;
        }
      }

      return newObject;
    } else if (Array.isArray(obj)) {
      return obj.map((value) => this.objectToFixedCasing(value));
    }

    return obj;
  }

  /**
   * Converts an object to table casing, converting all keys to snake case.
   * @param {any} obj The object to convert to table casing
   * @returns {Object}
   */
  objectToTableCasing(obj) {
    if (!Array.isArray(obj)) {
      const newObject = {};

      for (const [key, value] of Object.entries(obj)) {
        if (value instanceof Date || value === null) {
          newObject[this.getColumnName(key)] = value;
        } else if (typeof value === 'object') {
          newObject[this.getColumnName(key)] = this.objectToTableCasing(value);
        } else {
          newObject[this.getColumnName(key)] = value;
        }
      }

      return newObject;
    } else if (Array.isArray(obj)) {
      return obj.map((value) => this.objectToTableCasing(value));
    }

    return obj;
  }
}

class UnderscoreCqlToPascalCaseMappings extends TableMappings {
  constructor() {
    super();
  }

  getColumnName(PropName) {
    const Propertyname = PropName.split(/(?=[A-Z])/).join('_').toLowerCase();

    if (this.ReservedWords.includes(Propertyname)) {
      return `${Propertyname}_`;
    } else {
      return Propertyname;
    }
  }

  getPropertyName(ColumnName) {
    return ColumnName.split('_').map((word) => {
      return word.charAt(0).toUpperCase() + word.slice(1);
    }).join('');
  }

  objectToArray(obj) {
    const Output = [];

    for (const [_, value] of Object.entries(obj)) {
      if (typeof value === "object") Output.push(this.objectToTableCasing(value));
      else Output.push(value);
    }

    return Output;
  }

  objectToFixedCasing(obj) {
    if (!Array.isArray(obj)) {
      const newObject = {};

      for (const [key, value] of Object.entries(obj)) {
        if (value instanceof Date || value === null) {
          newObject[this.getPropertyName(key)] = value;
        } else if (typeof value === 'object') {
          newObject[this.getPropertyName(key)] = this.objectToFixedCasing(value);
        } else {
          newObject[this.getPropertyName(key)] = value;
        }
      }

      return newObject;
    } else if (Array.isArray(obj)) {
      return obj.map((value) => this.objectToFixedCasing(value));
    }

    return obj;
  }

  objectToTableCasing(obj) {
    if (!Array.isArray(obj)) {
      const newObject = {};

      for (const [key, value] of Object.entries(obj)) {
        if (value instanceof Date || value === null) {
          newObject[this.getColumnName(key)] = value;
        } else if (typeof value === 'object') {
          newObject[this.getColumnName(key)] = this.objectToTableCasing(value);
        } else {
          newObject[this.getColumnName(key)] = value;
        }
      }

      return newObject;
    } else if (Array.isArray(obj)) {
      return obj.map((value) => this.objectToTableCasing(value));
    }

    return obj;
  }

  newObjectInstance() {
    return {};
  }
}

/**
 * Default implementation of [TableMappings]{@link module:mapping~TableMappings} that doesn't perform any conversion.
 * @alias module:mapping~DefaultTableMappings
 * @implements {module:mapping~TableMappings}
 */
class DefaultTableMappings extends TableMappings {
  /**
   * Creates a new instance of {@link DefaultTableMappings}.
   */
  constructor() {
    super();
  }

  /**  @override */
  getColumnName(propName) {
    return super.getColumnName(propName);
  }

  /** @override */
  getPropertyName(columnName) {
    return super.getPropertyName(columnName);
  }

  ObjecttoCorrectObject(obj) {
    const NewObject = {};

    for (const [key, value] of Object.entries(obj)) {
      console.log(key, value, typeof value);
      if (Array.isArray(value)) {
        NewObject[this.getPropertyName(key)] = value.map((item) => this.ObjecttoCorrectObject(item));
      } else if (typeof value === 'object' && value !== null && !(value instanceof Date) && !(value instanceof Long)) {
        NewObject[this.getPropertyName(key)] = this.ObjecttoCorrectObject(value);
      } else {
        NewObject[this.getPropertyName(key)] = value;
      }
    }

    return NewObject;
  }

  /**
   * Creates a new object instance, using object initializer.
   */
  newObjectInstance() {
    return super.newObjectInstance();
  }
}

exports.TableMappings = TableMappings;
exports.UnderscoreCqlToCamelCaseMappings = UnderscoreCqlToCamelCaseMappings;
exports.DefaultTableMappings = DefaultTableMappings;
exports.UnderscoreCqlToPascalCaseMappings = UnderscoreCqlToPascalCaseMappings;