import config from "config";
import jwt from "jsonwebtoken";
import ms from "ms";
import { User } from "../../../src/models/user.model";

describe("user.generateAuthToken", () => {
  it("should return a valid access token", () => {
    const user = new User();
    const token = user.generateAuthToken();

    // verfiy token
    const decoded = jwt.verify(token, config.get("secretAccessKey"));
    expect(decoded).toMatchObject({ id: user.id });
  });

  it("should return a valid verification token", () => {
    const user = new User();
    const { token, hashedToken, expiresAt } = user.generateVerificationToken();

    expect(token).toBeDefined();
    expect(hashedToken).toBeDefined();

    // check token expiration duration
    const expiresAtMs = new Date(expiresAt).getTime();

    // Calculate the expected expiration time in milliseconds
    const expectedExpiresAtMs =
      Date.now() + parseInt(ms(config.get("expiresIn.verificationToken")));

    // Allow for a small tolerance in milliseconds
    const tolerance = 10000; // 10 seconds tolerance
    const lowerBoundMs = expectedExpiresAtMs - tolerance;
    const upperBoundMs = expectedExpiresAtMs + tolerance;

    // Check if `expiresAt` is within the tolerance range
    expect(expiresAtMs).toBeGreaterThanOrEqual(lowerBoundMs);
    expect(expiresAtMs).toBeLessThanOrEqual(upperBoundMs);
  });
});
