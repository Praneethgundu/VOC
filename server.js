const { createServer } = require("http");
const { parse } = require("url");
const next = require("next");

const dev = false; // FORCED PRODUCTION MODE FOR HOSTINGER
const port = process.env.PORT || 3000;

// Hostinger's Phusion Passenger runs Node apps using a UNIX domain socket path passed in process.env.PORT.
// If port is a string socket path (non-numeric), we pass undefined for hostname/port to Next.js initialization.
const isSocket = isNaN(Number(port));
const hostname = isSocket ? undefined : "localhost";
const nextPort = isSocket ? undefined : Number(port);

const app = next({ dev, hostname, port: nextPort, dir: __dirname });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error("Error occurred handling", req.url, err);
      res.statusCode = 500;
      res.end("internal server error");
    }
  }).listen(port, (err) => {
    if (err) throw err;
    console.log(`> Ready on ${isSocket ? "socket " : "http://localhost:"}${port}`);
  });
});

