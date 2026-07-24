import { Composition } from "remotion";
import "./studio.css";
import {
  MEETING_COMP,
  MeetingDetectedDemo,
  MINIBAR_COMP,
  MinibarDemo,
  SSO_CHAT_COMP,
  SsoChatDemo,
} from "./index";

/**
 * Remotion Studio root — registers every Caret demo composition.
 * Preview with `npm run remotion:studio`.
 */
export function RemotionRoot() {
  return (
    <>
      <Composition
        id={MINIBAR_COMP.id}
        component={MinibarDemo}
        durationInFrames={MINIBAR_COMP.durationInFrames}
        fps={MINIBAR_COMP.fps}
        width={MINIBAR_COMP.width}
        height={MINIBAR_COMP.height}
      />
      <Composition
        id={SSO_CHAT_COMP.id}
        component={SsoChatDemo}
        durationInFrames={SSO_CHAT_COMP.durationInFrames}
        fps={SSO_CHAT_COMP.fps}
        width={SSO_CHAT_COMP.width}
        height={SSO_CHAT_COMP.height}
      />
      <Composition
        id={MEETING_COMP.id}
        component={MeetingDetectedDemo}
        durationInFrames={MEETING_COMP.durationInFrames}
        fps={MEETING_COMP.fps}
        width={MEETING_COMP.width}
        height={MEETING_COMP.height}
      />
    </>
  );
}
