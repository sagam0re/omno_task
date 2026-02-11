const { spawn } = require("child_process");

function runCommand(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    const proc = spawn(command, args, {
      stdio: "inherit",
      shell: true,
      ...options,
    });

    proc.on("close", (code) => {
      resolve(code);
    });

    proc.on("error", (err) => {
      reject(err);
    });
  });
}

async function main() {
  console.log("Starting development environment...");

  try {
    console.log("Starting Docker containers...");
    await runCommand("docker", [
      "compose",
      "-f",
      "docker-compose.yml",
      "up",
      "-d",
      "--build",
      "db",
    ]);
  } catch (error) {
    console.error("Failed to start Docker containers:", error);
    process.exit(1);
  }

  console.log("Starting Node application...");
  const nodemon = spawn("nodemon", ["src/server.ts"], {
    stdio: "inherit",
    shell: true,
  });

  const cleanup = async () => {
    console.log("Shutting down...");
    try {
      console.log("Stopping Docker containers...");
      await runCommand("docker", [
        "compose",
        "-f",
        "docker-compose.yml",
        "down",
      ]);
      console.log("Services stopped successfully.");
    } catch (e) {
      console.error("Error stopping services:", e);
    }
    process.exit();
  };

  process.on("SIGINT", cleanup);
  process.on("SIGTERM", cleanup);

  nodemon.on("exit", (code) => {
    console.log(`Node application exited with code ${code}`);
    cleanup();
  });
}

main();
