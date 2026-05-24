const { execSync } = require("child_process");

const PORTS = [3000, 3001, 3002, 3003, 3004, 3005];

function killOnPort(port) {
  try {
    const out = execSync(`netstat -ano | findstr :${port}`, { encoding: "utf8" });
    const pids = new Set();

    for (const line of out.split("\n")) {
      if (!line.includes("LISTENING")) continue;
      const parts = line.trim().split(/\s+/);
      const pid = parts[parts.length - 1];
      if (pid && pid !== "0") pids.add(pid);
    }

    for (const pid of pids) {
      try {
        execSync(`taskkill /PID ${pid} /F`, { stdio: "ignore" });
        console.log(`  تم إيقاف العملية ${pid} (منفذ ${port})`);
      } catch {
        /* already stopped */
      }
    }
  } catch {
    /* no process on this port */
  }
}

console.log("\n  إيقاف خوادم TAWJIHII القديمة...\n");
PORTS.forEach(killOnPort);
console.log("  تم. يمكنك الآن تشغيل: npm start\n");
