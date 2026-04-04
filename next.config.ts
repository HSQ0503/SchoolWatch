import type { NextConfig } from "next";
import config from "./school.config";
import { validateConfig } from "./lib/validateConfig";

validateConfig(config);

const nextConfig: NextConfig = {};

export default nextConfig;
