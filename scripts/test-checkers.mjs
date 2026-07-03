import { Impit } from "impit";
import { readFileSync } from "fs";
import { createRequire } from "module";

// Minimal inline test for HN BodyMatch
const impit = new Impit({ browser: "chrome" });
const url = "https://news.ycombinator.com/user?id=hnuniq123456789";
const response = await impit.fetch(url);
const body = await response.text();
console.log("status", response.status, "body", JSON.stringify(body));
console.log("includes No such user", body.includes("No such user."));
