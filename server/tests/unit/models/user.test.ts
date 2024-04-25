import config from "config";
import jwt from "jsonwebtoken";
import { User } from "../../../src/models/user.model";

describe("user.generateAuthToken", () => {
  it("should return a valid access token", () => {
    const user = new User();
    const token = user.generateAuthToken();

    // verfiy token
    const decoded = jwt.verify(token, config.get("secretAccessKey"));
    expect(decoded).toMatchObject({ id: user.id });
  });
});
