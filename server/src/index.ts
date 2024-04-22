import dotenv from "dotenv";
dotenv.config();
import config from "config";

import app from "./app";

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`App is listening on PORT - ${PORT}`);
  console.log(`Node Env = ${process.env.NODE_ENV}`);
  console.log(`App name = ${config.get("appName")}`);
});
