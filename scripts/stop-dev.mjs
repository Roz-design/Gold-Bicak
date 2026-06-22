import { execSync } from "node:child_process";
import { existsSync, readFileSync, unlinkSync } from "node:fs";
import { resolve } from "node:path";

const lockPath = resolve(process.cwd(), ".next/dev/lock");
const ports = [3000, 3001];

function killPid(pid) {
  if (!pid || Number.isNaN(Number(pid))) return;

  try {
    if (process.platform === "win32") {
      execSync(`taskkill /PID ${pid} /F`, { stdio: "ignore" });
    } else {
      process.kill(Number(pid), "SIGTERM");
    }
    console.log(`[dev:stop] Süreç kapatıldı: PID ${pid}`);
  } catch {
    // Süreç zaten kapalı olabilir.
  }
}

function killWindowsPort(port) {
  try {
    const output = execSync("netstat -ano -p tcp", { encoding: "utf8" });
    const pids = new Set();

    for (const line of output.split("\n")) {
      if (!line.includes(`:${port}`) || !line.includes("LISTENING")) continue;
      const parts = line.trim().split(/\s+/);
      const pid = parts.at(-1);
      if (pid && pid !== "0") pids.add(pid);
    }

    for (const pid of pids) killPid(pid);
  } catch {
    // Port boş olabilir.
  }
}

if (existsSync(lockPath)) {
  try {
    const lock = JSON.parse(readFileSync(lockPath, "utf8"));
    if (lock?.pid) killPid(lock.pid);
  } catch {
    // Bozuk lock dosyası yine silinir.
  }

  try {
    unlinkSync(lockPath);
    console.log("[dev:stop] Eski Next.js kilidi temizlendi.");
  } catch {
    // Kilit silinemezse devam et.
  }
}

if (process.platform === "win32") {
  for (const port of ports) killWindowsPort(port);
}

console.log("[dev:stop] Port 3000/3001 hazır.");
