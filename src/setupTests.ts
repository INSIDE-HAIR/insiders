import "@testing-library/jest-dom";
import { expect } from "vitest";
import * as matchers from "@testing-library/jest-dom/matchers";
import { server } from "./mocks/server";

expect.extend(matchers);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
