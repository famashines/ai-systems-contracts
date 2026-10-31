import { z } from "zod";
import { EventEnvelopeV1 } from "./envelopes.ts";

type Versions = Readonly<Record<number, z.ZodType>>;
type Registry = Readonly<Record<string, Versions>>;

export type EventsOf<R extends Registry> = {
  [T in keyof R & string]: {
    [V in keyof R[T] & number]: Omit<
      EventEnvelopeV1<z.output<R[T][V]>>,
      "type" | "schemaVersion"
    > & { type: T; schemaVersion: V };
  }[keyof R[T] & number];
}[keyof R & string];

const envelope = (type: string, schemaVersion: number, payload: z.ZodType) =>
  EventEnvelopeV1(payload).extend({
    type: z.literal(type),
    schemaVersion: z.literal(schemaVersion),
  });

const oneOf = <T extends z.core.$ZodTypeDiscriminable>(
  key: string,
  options: T[],
) => z.discriminatedUnion(key, options as [T, ...T[]]);

export const defineEvents = <R extends Registry>(registry: R) => {
  const catalog = Object.entries<Versions>(registry).flatMap(
    ([type, versions]) =>
      Object.entries<z.ZodType>(versions).map(([version, payload]) => ({
        type,
        schemaVersion: Number(version),
        payload,
        schema: envelope(type, Number(version), payload),
      })),
  );
  const loose: z.ZodType<EventEnvelopeV1> = oneOf(
    "type",
    [...Map.groupBy(catalog, (entry) => entry.type).values()].map((entries) =>
      oneOf(
        "schemaVersion",
        entries.map((entry) => entry.schema),
      ),
    ),
  );
  const schema = loose as z.ZodType<EventsOf<R>>;
  return {
    catalog,
    schema,
    latest: (type: keyof R & string) =>
      catalog
        .filter((entry) => entry.type === type)
        .reduce((a, b) => (b.schemaVersion > a.schemaVersion ? b : a)),
    parse: (input: unknown): EventsOf<R> => schema.parse(input),
  };
};
