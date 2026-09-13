export const MAX_TOPIC_LENGTH = 500;

export function normalizeTopic(value: unknown): string {
  if (typeof value !== "string") {
    throw new TypeError("topic must be a string");
  }

  const topic = value.trim().replace(/\s+/g, " ");
  if (topic.length < 3) {
    throw new RangeError("topic must contain at least 3 characters");
  }
  if (topic.length > MAX_TOPIC_LENGTH) {
    throw new RangeError(`topic must not exceed ${MAX_TOPIC_LENGTH} characters`);
  }

  return topic;
}
