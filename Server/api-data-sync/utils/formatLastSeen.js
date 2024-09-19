//
// Formats "last seen" into "x minutes ago"

import { parse, format } from "date-fns";

export const formatLastSeen = (lastSeen) => {
  try {
    const dt = parse(lastSeen, "yyyyMMdd'T'HHmmss.SSSX", new Date());
    return format(dt, "yyyy-MM-dd HH:mm:ss");
  } catch (error) {
    return lastSeen;
  }
};
