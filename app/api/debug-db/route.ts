import { NextResponse } from "next/server";
import { prisma } from "@/utils/db";
import path from "path";
import fs from "fs";

export async function GET(req: Request) {
  try {
    const envVars = {
      DATABASE_URL: process.env.DATABASE_URL,
      NODE_ENV: process.env.NODE_ENV,
    };

    const startDir = typeof __dirname !== "undefined" ? __dirname : process.cwd();
    let projectRoot = startDir;
    const pathsChecked = [];
    
    for (let i = 0; i < 10; i++) {
      pathsChecked.push(projectRoot);
      if (fs.existsSync(path.join(projectRoot, "package.json"))) {
        break;
      }
      const parentDir = path.dirname(projectRoot);
      if (parentDir === projectRoot) break;
      projectRoot = parentDir;
    }
    
    const dbPath = path.resolve(projectRoot, "dev.db");
    const dbExists = fs.existsSync(dbPath);
    let dbSize = 0;
    let dbPermissions = "";
    
    if (dbExists) {
      dbSize = fs.statSync(dbPath).size;
      try {
        fs.accessSync(dbPath, fs.constants.R_OK | fs.constants.W_OK);
        dbPermissions = "Readable and Writable";
      } catch (err: any) {
        dbPermissions = `Access Error: ${err.message}`;
      }
    }

    let userCount = 0;
    let queryError = null;
    try {
      userCount = await prisma.user.count();
    } catch (e: any) {
      queryError = {
        message: e.message,
        code: e.code,
        meta: e.meta,
        stack: e.stack,
      };
    }

    return NextResponse.json({
      success: true,
      envVars,
      cwd: process.cwd(),
      __dirname: typeof __dirname !== "undefined" ? __dirname : "undefined",
      projectRoot,
      pathsChecked,
      dbPath,
      dbExists,
      dbSize,
      dbPermissions,
      userCount,
      queryError,
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack,
    }, { status: 500 });
  }
}
