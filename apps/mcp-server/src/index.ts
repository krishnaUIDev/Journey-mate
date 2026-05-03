import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";

// Initialize Supabase Client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY/SUPABASE_ANON_KEY in environment");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Create an MCP server
const server = new McpServer({
  name: "Journey-Mate Travel Assistant",
  version: "1.0.0"
});

// Tool: get_recent_journeys
server.tool(
  "get_recent_journeys",
  "Fetch a list of recent journeys from Journey-Mate.",
  {
    limit: z.number().optional().describe("Number of journeys to fetch (default: 5)"),
  },
  async ({ limit = 5 }) => {
    try {
      const { data, error } = await supabase
        .from('journeys')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      return {
        content: [{ type: "text", text: JSON.stringify(data, null, 2) }]
      };
    } catch (e: any) {
      return {
        isError: true,
        content: [{ type: "text", text: `Error fetching journeys: ${e.message}` }]
      };
    }
  }
);

// Tool: get_journey_itinerary
server.tool(
  "get_journey_itinerary",
  "Fetch the itinerary for a specific journey.",
  {
    journey_id: z.string().describe("The UUID of the journey"),
  },
  async ({ journey_id }) => {
    try {
      const { data, error } = await supabase
        .from('journey_itinerary')
        .select('*')
        .eq('journey_id', journey_id)
        .order('start_time', { ascending: true });

      if (error) throw error;

      return {
        content: [{ type: "text", text: JSON.stringify(data, null, 2) }]
      };
    } catch (e: any) {
      return {
        isError: true,
        content: [{ type: "text", text: `Error fetching itinerary: ${e.message}` }]
      };
    }
  }
);

// Start the server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Journey-Mate MCP Server is running on stdio");
}

main().catch((err) => {
  console.error("Server error:", err);
  process.exit(1);
});
