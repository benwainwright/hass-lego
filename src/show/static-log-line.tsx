import { HassLegoEvent, StateChanged } from "@types";
import { Box, Text } from "ink";

interface StaticLogLineProps {
  event: HassLegoEvent;
}

const getIcon = (event: HassLegoEvent<any, any>) => {
  if ("status" in event) {
    switch (event.status) {
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
        <Text>{"status" in event}</Text>
      </Box>

      <Box width={12}>
        <Text>{event.type}</Text>
      </Box>
      {"parent" in event ? (
        <Box width={28}>
          <Text>{event.parent?.name}</Text>
        </Box>
      ) : null}
      {"name" in event ? (
        <Box>
          <Text>{event.name}</Text>
        </Box>
      ) : null}
    </Box>
  );
};
