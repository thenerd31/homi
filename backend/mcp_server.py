"""
Model Context Protocol (MCP) Server
Exposes Elastic AI Agent Builder tools via MCP

Sponsor Track: Elastic ($3,000) - Requirement #3

This MCP server allows external LLM clients (Claude Desktop, IDEs, etc.)
to access our custom Elastic Agent Builder tools.

Based on: https://modelcontextprotocol.io/

Usage:
    python mcp_server.py

MCP Clients can connect to:
    ws://localhost:8001/mcp
"""

import asyncio
import json
import logging
from typing import Dict, Any, List
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
import uvicorn
from services.elastic_agent_builder_service import ElasticAgentBuilderService

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize MCP server
app = FastAPI(title="Homi MCP Server", description="Model Context Protocol server for Elastic Agent Builder")

# Initialize Elastic Agent Builder
elastic_agent_builder = ElasticAgentBuilderService()

# Store registered tools (populated on startup)
TOOLS_REGISTRY: Dict[str, Dict[str, Any]] = {}


@app.on_event("startup")
async def startup():
    """Initialize tools on startup"""
    logger.info("🚀 Starting MCP Server...")
    logger.info("📋 Registering Elastic Agent Builder tools...")

    try:
        # Register tools with Elastic
        result = await elastic_agent_builder.setup_agent_builder()

        # Store tools in registry
        for tool in result.get("tools", []):
            TOOLS_REGISTRY[tool["name"]] = {
                "tool_id": tool["tool_id"],
                "status": tool["status"]
            }

        logger.info(f"✅ Registered {len(TOOLS_REGISTRY)} tools")
        logger.info(f"   Tools: {list(TOOLS_REGISTRY.keys())}")

    except Exception as e:
        logger.error(f"❌ Failed to register tools: {e}")


@app.get("/")
async def root():
    """MCP server info"""
    return {
        "server": "Homi MCP Server",
        "protocol": "Model Context Protocol (MCP)",
        "version": "1.0.0",
        "tools_registered": len(TOOLS_REGISTRY),
        "tools": list(TOOLS_REGISTRY.keys()),
        "websocket_endpoint": "ws://localhost:8001/mcp",
        "sponsor": "Elastic AI Agent Builder ($3,000 prize track)"
    }


@app.get("/tools")
async def list_tools():
    """List all available tools"""
    return {
        "tools": [
            {
                "name": "semantic_property_search",
                "description": "Search vacation rentals using natural language and semantic similarity",
                "parameters": ["query", "location", "max_results"]
            },
            {
                "name": "price_range_filter",
                "description": "Filter properties by nightly price range",
                "parameters": ["min_price", "max_price", "property_type"]
            },
            {
                "name": "amenity_matcher",
                "description": "Find properties with specific amenities using LOOKUP JOIN",
                "parameters": ["required_amenities", "location"]
            },
            {
                "name": "availability_checker",
                "description": "Check property availability for date ranges",
                "parameters": ["check_in", "check_out", "guests"]
            },
            {
                "name": "location_proximity_search",
                "description": "Find properties within radius of geographic point",
                "parameters": ["latitude", "longitude", "radius_km"]
            }
        ]
    }


@app.websocket("/mcp")
async def mcp_websocket(websocket: WebSocket):
    """
    MCP WebSocket endpoint

    Protocol:
    - Client sends JSON-RPC 2.0 messages
    - Server responds with tool results
    - Supports tool discovery, invocation, and streaming

    Message format:
    {
        "jsonrpc": "2.0",
        "method": "tools/call",
        "params": {
            "name": "semantic_property_search",
            "arguments": {"query": "beachfront villa", "location": "Malibu"}
        },
        "id": 1
    }
    """

    await websocket.accept()
    logger.info("🔌 MCP client connected")

    try:
        while True:
            # Receive message from client
            data = await websocket.receive_text()
            message = json.loads(data)

            logger.info(f"📥 Received: {message.get('method')}")

            # Handle different MCP methods
            method = message.get("method")
            params = message.get("params", {})
            msg_id = message.get("id")

            if method == "initialize":
                # MCP initialization handshake
                response = {
                    "jsonrpc": "2.0",
                    "result": {
                        "protocolVersion": "1.0",
                        "serverInfo": {
                            "name": "Homi MCP Server",
                            "version": "1.0.0"
                        },
                        "capabilities": {
                            "tools": {
                                "supported": True
                            }
                        }
                    },
                    "id": msg_id
                }

            elif method == "tools/list":
                # List available tools
                tools_list = await list_tools()
                response = {
                    "jsonrpc": "2.0",
                    "result": tools_list,
                    "id": msg_id
                }

            elif method == "tools/call":
                # Call a tool
                tool_name = params.get("name")
                arguments = params.get("arguments", {})

                # Execute tool via Elastic Agent Builder
                try:
                    # Find an agent that can use this tool
                    # For demo, we'll use the property_search_agent
                    agent_id = "property_search_agent"  # This would be dynamic in production

                    # Convert tool call to agent conversation
                    user_message = f"Use the {tool_name} tool with these parameters: {json.dumps(arguments)}"

                    result = await elastic_agent_builder.converse_with_agent(
                        agent_id=agent_id,
                        user_message=user_message,
                        conversation_history=[]
                    )

                    response = {
                        "jsonrpc": "2.0",
                        "result": {
                            "content": [
                                {
                                    "type": "text",
                                    "text": result.get("message", "")
                                }
                            ],
                            "tool_calls": result.get("tool_calls", [])
                        },
                        "id": msg_id
                    }

                except Exception as e:
                    logger.error(f"❌ Tool execution error: {e}")
                    response = {
                        "jsonrpc": "2.0",
                        "error": {
                            "code": -32000,
                            "message": f"Tool execution failed: {str(e)}"
                        },
                        "id": msg_id
                    }

            else:
                # Unknown method
                response = {
                    "jsonrpc": "2.0",
                    "error": {
                        "code": -32601,
                        "message": f"Method not found: {method}"
                    },
                    "id": msg_id
                }

            # Send response
            await websocket.send_text(json.dumps(response))
            logger.info(f"📤 Sent response for {method}")

    except WebSocketDisconnect:
        logger.info("🔌 MCP client disconnected")
    except Exception as e:
        logger.error(f"❌ WebSocket error: {e}")
        await websocket.close()


if __name__ == "__main__":
    logger.info("🚀 Starting Homi MCP Server...")
    logger.info("📍 Endpoint: ws://localhost:8001/mcp")
    logger.info("📊 Info: http://localhost:8001/")
    logger.info("🛠️  Tools: http://localhost:8001/tools")
    logger.info("")
    logger.info("🏆 Elastic AI Agent Builder Sponsor Track")
    logger.info("   ✅ Requirement 1: Data in Elastic")
    logger.info("   ✅ Requirement 2: Custom ES|QL tools")
    logger.info("   ✅ Requirement 3: MCP exposure")
    logger.info("")

    uvicorn.run(app, host="0.0.0.0", port=8001)
