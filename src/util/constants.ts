/*!
 * Copyright 2019 Omar Tawfik. Please see LICENSE file at the root of this repository.
 */

export const MAXIMUM_SUPPORTED_VERSION = 0;
export const MAXIMUM_SUPPORTED_SECRETS = 100;
export const MAXIMUM_SUPPORTED_ACTIONS = 100;

export module USES_REGEX {
  const ALPHA_NUM = `[a-zA-Z0-9]`;
  const ALPHA_NUM_DASH = `[a-zA-Z0-9-]`;

  const DOCKER_HOST_COMPONENT = `(${ALPHA_NUM}|(${ALPHA_NUM}${ALPHA_NUM_DASH}*${ALPHA_NUM}))`;
  const DOCKER_REGISTRY = `(${DOCKER_HOST_COMPONENT}(\\.${DOCKER_HOST_COMPONENT})*(:[0-9]+)?\\/)`;
  const DOCKER_PATH_COMPONENT = `(${ALPHA_NUM}+([._-]${ALPHA_NUM}+)*)`;
  const DOCKER_TAG = `(:[a-zA-Z0-9_]+)`;
  const DOCKER_DIGEST_ALGORITHM = `[A-Za-z]${ALPHA_NUM}*`;
  const DOCKER_DIGEST = `(@${DOCKER_DIGEST_ALGORITHM}([+.-_]${DOCKER_DIGEST_ALGORITHM})*:[a-fA-F0-9]+)`;
  const DOCKER_USES = `docker:\\/\\/${DOCKER_REGISTRY}?${DOCKER_PATH_COMPONENT}(\\/${DOCKER_PATH_COMPONENT})*(${DOCKER_TAG}|${DOCKER_DIGEST})?`;

  const LOCAL_USES = `\\.\\/.*`;

  const REMOTE_OWNER = `${ALPHA_NUM}+(${ALPHA_NUM_DASH}${ALPHA_NUM}+)*`;
  const REMOTE_PATH = `(\\/[a-zA-Z0-9-_.]+)`;
  const REMOTE_REF = `@.+`;
  const REMOTE_USES = `${REMOTE_OWNER}${REMOTE_PATH}+${REMOTE_REF}`;

  const COMBINED = new RegExp(`^(${DOCKER_USES})|(${LOCAL_USES})|(${REMOTE_USES})$`);

  export function test(value: string): boolean {
    return COMBINED.test(value);
  }
}
