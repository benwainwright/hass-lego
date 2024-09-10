import { HassLegoEvent, StateChanged } from "@types";
import { Box, Text } from "ink";

interface StaticLogLineProps {
  event: HassLegoEvent;
}

const getIcon = (event: HassLegoEvent<any, any>) => {
  if ("status" in event) {
    switch (event.status) {
      case "error":
        return "🚨";

      case "aborted":
        return "🛑";

      case "started":
        return "🚀";

      case "finished":
        return "🏁";
    }
  }
};

export const StaticLogLine = ({ event }: StaticLogLineProps) => {
  return (
    <Box flexDirection="row" width="100%">
      <Box width={4}>
        <Text>{getIcon(event)}</Text>
      </Box>
      <Box width={12}>
        <Text>{"status" in event && event.status}</Text>
      </Box>

      <Box width={12}>
        <Text>{event.type}</Text>
      </Box>
      <Box width={35}>
        <Text>{"parent" in event && event.parent?.name}</Text>
      </Box>
      <Box width={40}>
        <Text>{"name" in event && event.name}</Text>
      </Box>
      <Box>
        <Text>{"triggerId" in event && event.triggerId}</Text>
      </Box>
    </Box>
  );
};
