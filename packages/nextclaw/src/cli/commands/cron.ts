import { CronService, getDataDir } from "@nextclaw/core";
import { join } from "node:path";
import type { CronAddOptions } from "../types.js";

export class CronCommands {
  cronList(opts: { all?: boolean }): void {
    const storePath = join(getDataDir(), "cron", "jobs.json");
    const service = new CronService(storePath);
    const jobs = service.listJobs(Boolean(opts.all));
    if (!jobs.length) {
      console.log("No scheduled jobs.");
      return;
    }
    for (const job of jobs) {
      let schedule = "";
      if (job.schedule.kind === "every") {
        schedule = `every ${Math.round((job.schedule.everyMs ?? 0) / 1000)}s`;
      } else if (job.schedule.kind === "cron") {
        schedule = job.schedule.expr ?? "";
      } else {
        schedule = job.schedule.atMs ? new Date(job.schedule.atMs).toISOString() : "";
      }
      console.log(`${job.id} ${job.name} ${schedule}`);
    }
  }

  cronAdd(opts: CronAddOptions): void {
    const storePath = join(getDataDir(), "cron", "jobs.json");
    const service = new CronService(storePath);
    let schedule: { kind: "every" | "cron" | "at"; everyMs?: number; expr?: string; atMs?: number } | null = null;
    if (opts.every) {
      schedule = { kind: "every", everyMs: Number(opts.every) * 1000 };
    } else if (opts.cron) {
      schedule = { kind: "cron", expr: String(opts.cron) };
    } else if (opts.at) {
      schedule = { kind: "at", atMs: Date.parse(String(opts.at)) };
    }
    if (!schedule) {
      console.error("Error: Must specify --every, --cron, or --at");
      return;
    }
    const job = service.addJob({
      name: opts.name,
      schedule,
      message: opts.message,
      deliver: Boolean(opts.deliver),
      channel: opts.channel,
      to: opts.to
    });
    console.log(`✓ Added job '${job.name}' (${job.id})`);
  }

  cronRemove(jobId: string): void {
    const storePath = join(getDataDir(), "cron", "jobs.json");
    const service = new CronService(storePath);
    if (service.removeJob(jobId)) {
      console.log(`✓ Removed job ${jobId}`);
    } else {
      console.log(`Job ${jobId} not found`);
    }
  }

  cronEnable(jobId: string, opts: { disable?: boolean }): void {
    const storePath = join(getDataDir(), "cron", "jobs.json");
    const service = new CronService(storePath);
    const job = service.enableJob(jobId, !opts.disable);
    if (job) {
      console.log(`✓ Job '${job.name}' ${opts.disable ? "disabled" : "enabled"}`);
    } else {
      console.log(`Job ${jobId} not found`);
    }
  }

  async cronRun(jobId: string, opts: { force?: boolean }): Promise<void> {
    const storePath = join(getDataDir(), "cron", "jobs.json");
    const service = new CronService(storePath);
    const ok = await service.runJob(jobId, Boolean(opts.force));
    console.log(ok ? "✓ Job executed" : `Failed to run job ${jobId}`);
  }
}
