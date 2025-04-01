import os
from fastmcp import FastMCP
from fastmcp.tools import tool

@tool(description="Reads rows from a Supabase table", config_schema={"table": {"type": "string"}})
def read_rows(table: str):
    # Simulated read rows from a Supabase table.
    return {"data": [{"id": 1, "name": "Row 1"}, {"id": 2, "name": "Row 2"}]}

@tool(description="Creates a new record in a Supabase table", config_schema={"table": {"type": "string"}, "record": {"type": "object"}})
def create_record(table: str, record: dict):
    # Simulated record creation.
    return {"status": "success", "record": record}

@tool(description="Updates a record in a Supabase table", config_schema={"table": {"type": "string"}, "id": {"type": "integer"}, "record": {"type": "object"}})
def update_record(table: str, id: int, record: dict):
    # Simulated record update.
    return {"status": "success", "id": id, "record": record}

@tool(description="Deletes a record from a Supabase table", config_schema={"table": {"type": "string"}, "id": {"type": "integer"}})
def delete_record(table: str, id: int):
    # Simulated record deletion.
    return {"status": "success", "id": id}

def main():
    port = int(os.environ.get("MCP_SERVER_PORT", 8000))
    app = FastMCP(
        name="supabase-mcp",
        description="Supabase MCP server for database operations",
        tools=[read_rows, create_record, update_record, delete_record]
    )
    print(f"Supabase MCP Server is running on port {port}")
    app.run(port=port)

if __name__ == "__main__":
    main()