import { assertEquals, assert } from "std/testing/asserts.ts"
import {convert} from 'src/ast.ts'

Deno.test(function convertEmptyJsonString() {
  try {
    convert('', 'json1')
  } catch (error) {
    if (error instanceof Error) {
      assertEquals(error.message, 'json cannot empty')
    }
  }
})
Deno.test(function convertObjectJsonString() {
  const jsonStr = `{
    "name": "a1",
    "age": 10,
    "isUser": false,
    "isMan": true,
    "subname2": null,
    "ages": [1, 2],
    "names": ["a1", "a2"],
    "ids": [123, "456"],
    "users": [
      {
        "name": "a1",
        "age": 10,
        "isUser": false,
        "isMan": true,
        "subname2": null,
        "ages": [1, 2],
        "names": ["a1", "a2"],
        "ids": [123, "123"]
      },
      {
        "name": "a2",
        "age": 20,
        "isUser": true,
        "isMan": false,
        "subname2": null,
        "ages": [10, 20],
        "names": ["b1", "b2"],
        "ids": [456, "456"]
      }
    ],
    "user": {
      "name": "a1",
      "age": 10,
      "isUser": false,
      "isMan": true,
      "subname2": null,
      "ages": [1, 2],
      "names": ["a1", "a2"],
      "ids": [123, "123"]
    }
  }`
  const resultTypeStr = `interface IJson1 {
    name: string;
    age: number;
    isUser: boolean;
    isMan: boolean;
    subname2: undefined;
    ages: number[];
    names: string[];
    ids: Array<number | string>;
    users: Array<{
        name: string;
        age: number;
        isUser: boolean;
        isMan: boolean;
        subname2: undefined;
        ages: number[];
        names: string[];
        ids: Array<number | string>;
    }>;
    user: {
        name: string;
        age: number;
        isUser: boolean;
        isMan: boolean;
        subname2: undefined;
        ages: number[];
        names: string[];
        ids: Array<number | string>;
    };
}`
  assertEquals(convert(jsonStr, 'json1'), resultTypeStr)
});
Deno.test(function convertArrayJsonString() {
  const jsonStr = `["a", "a"]`
  const resultTypeStr = `type Json1 = string[];`
  assertEquals(convert(jsonStr, 'json1'), resultTypeStr)
})
Deno.test(function convertTupleJsonString() {
  const jsonStr = `["a", 1]`
  const resultTypeStr = `type Json1 = Array<string | number>;`
  assertEquals(convert(jsonStr, 'json1'), resultTypeStr)
})
Deno.test(function convertErrorString() {
  try {
    convert(`1`)
    convert(`"1"`)
    convert(`a`)
  } catch (error) {
    assertEquals(error.message, 'json error')
  }
})
Deno.test(function outputName() {
  const jsonStr = `{\"a\": 1}`
  assert(convert(jsonStr, 'foojson').startsWith('interface IFoojson'))
})
