import {
  HASS_HOST_ENV,
  HASS_HTTP_PATH_ENV,
  HASS_PORT_ENV,
  HASS_TOKEN_ENV,
  HASS_WS_PATH_ENV,
  SUPERVISOR_TOKEN_ENV,
} from "./constants.ts";

import { getEnv } from "@utils";
import dotEnv from "dotenv";

export interface HassConfig {
  /**
   * Home Assistant host
   */
  host: string;

  /**
   * Home Assistant port
   */
  port?: number;

  /**
   * Home assistant token
   */
  token: string;

  /**
   * Path to Websocket API
   */
  websocketPath: string;

  /**
   * Path to HTTP API
   */
  httpPath: string;
}

export const getConfig = (): HassConfig => {
  dotEnv.config();
  const supervisorToken = process.env[SUPERVISOR_TOKEN_ENV];

  const websocketPath = supervisorToken
    ? `/core/websocket`
    : process.env[HASS_WS_PATH_ENV] ?? `/api/websocket`;

  const httpPath = supervisorToken
    ? `/core/api`
    : process.env[HASS_HTTP_PATH_ENV] ?? `/api`;

  const host = supervisorToken ? `supervisor` : getEnv(HASS_HOST_ENV);
  const port = supervisorToken ? undefined : process.env[HASS_PORT_ENV] ?? 8123;
  const token = supervisorToken ?? getEnv(HASS_TOKEN_ENV);

  return {
    host,
    port: port ? Number(port) : undefined,
    token,
    websocketPath,
    httpPath,
  };
};
