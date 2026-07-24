export { MeetingDetectedDemo } from "./MeetingDetectedDemo";
export { MinibarDemo } from "./MinibarDemo";
export { SsoChatDemo } from "./SsoChatDemo";

export const MINIBAR_COMP = {
  id: "CaretMinibarDemo",
  fps: 30,
  durationInFrames: 300,
  width: 1440,
  height: 384,
} as const;

export const SSO_CHAT_COMP = {
  id: "CaretSsoChatDemo",
  fps: 30,
  durationInFrames: 240,
  width: 500,
  height: 400,
} as const;

export const MEETING_COMP = {
  id: "CaretMeetingDetectedDemo",
  fps: 30,
  durationInFrames: 180,
  width: 400,
  height: 200,
} as const;
