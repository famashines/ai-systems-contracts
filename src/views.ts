import { z } from "zod";
import { Id } from "./common.ts";
import { EventEnvelopeV1 } from "./envelopes.ts";
import { Topic } from "./ws.ts";

export const ViewSubject = z.union([
  z.enum(["view.tasks", "view.budget", "view.agents", "view.notifications"]),
  z.templateLiteral(["view.task.", Id]),
]);
export type ViewSubject = z.infer<typeof ViewSubject>;

export const ViewNoticeV1 = z
  .object({
    topic: Topic,
    docId: z.string().min(1).max(200),
    rev: z.int().nonnegative(),
    data: z.unknown(),
    commandId: Id.exactOptional(),
  })
  .describe("A read model document changed.");
export type ViewNoticeV1 = z.infer<typeof ViewNoticeV1>;

export const viewSubject = (topic: Topic): ViewSubject =>
  `view.${topic.replace(":", ".")}` as ViewSubject;

export const ViewMessageV1 = EventEnvelopeV1(ViewNoticeV1)
  .extend({ type: ViewSubject })
  .refine((message) => message.type === viewSubject(message.payload.topic), {
    message: "The type must be the subject of payload.topic",
    path: ["type"],
  });
export type ViewMessageV1 = z.infer<typeof ViewMessageV1>;

export const topicFromSubject = (subject: string): Topic =>
  Topic.parse(
    ViewSubject.parse(subject).slice("view.".length).replace(".", ":"),
  );
