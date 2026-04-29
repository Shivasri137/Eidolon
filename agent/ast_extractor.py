"""
ast_extractor.py
Walks a Python source file via AST and produces a static graph:
  { nodes: [...], edges: [...] }
This graph is sent to the frontend as the first 'graph' packet,
allowing the 3D scene skeleton to be built before live tracing starts.
"""

import ast
from dataclasses import dataclass, field, asdict
from typing import Any


@dataclass
class GraphNode:
    id: str
    type: str            # function | loop | branch | module
    label: str
    lineno: int
    end_lineno: int
    meta: dict = field(default_factory=dict)


@dataclass
class GraphEdge:
    source: str
    target: str
    kind: str            # calls | contains | branches


class CodeGraphExtractor(ast.NodeVisitor):
    """
    Single-pass AST visitor that collects functions, loops, and branches,
    and infers containment/call edges between them.
    """

    def __init__(self, filename: str = "<string>"):
        self.filename = filename
        self.nodes: list[GraphNode] = []
        self.edges: list[GraphEdge] = []
        self._scope_stack: list[str] = []          # track current parent scope
        self._id_counters: dict[str, int] = {}

    # ── ID helpers ──────────────────────────────────────────────────────────

    def _make_id(self, prefix: str, lineno: int) -> str:
        key = f"{prefix}_{lineno}"
        self._id_counters[key] = self._id_counters.get(key, 0) + 1
        suffix = self._id_counters[key]
        return key if suffix == 1 else f"{key}_{suffix}"

    # ── Visitors ────────────────────────────────────────────────────────────

    def visit_FunctionDef(self, node: ast.FunctionDef):
        node_id = self._make_id("fn", node.lineno)
        args = [a.arg for a in node.args.args]
        gnode = GraphNode(
            id=node_id,
            type="function",
            label=node.name,
            lineno=node.lineno,
            end_lineno=getattr(node, "end_lineno", node.lineno),
            meta={"args": args, "decorators": len(node.decorator_list)},
        )
        self.nodes.append(gnode)

        # Containment edge from parent scope
        if self._scope_stack:
            self.edges.append(GraphEdge(
                source=self._scope_stack[-1],
                target=node_id,
                kind="contains",
            ))

        self._scope_stack.append(node_id)
        self.generic_visit(node)
        self._scope_stack.pop()

    visit_AsyncFunctionDef = visit_FunctionDef   # handle async too

    def visit_For(self, node: ast.For):
        node_id = self._make_id("loop_for", node.lineno)
        target_name = ast.unparse(node.target) if hasattr(ast, "unparse") else "?"
        gnode = GraphNode(
            id=node_id,
            type="loop",
            label=f"for {target_name}",
            lineno=node.lineno,
            end_lineno=getattr(node, "end_lineno", node.lineno),
            meta={"loop_type": "for"},
        )
        self.nodes.append(gnode)
        if self._scope_stack:
            self.edges.append(GraphEdge(self._scope_stack[-1], node_id, "contains"))

        self._scope_stack.append(node_id)
        self.generic_visit(node)
        self._scope_stack.pop()

    def visit_While(self, node: ast.While):
        node_id = self._make_id("loop_while", node.lineno)
        gnode = GraphNode(
            id=node_id,
            type="loop",
            label="while",
            lineno=node.lineno,
            end_lineno=getattr(node, "end_lineno", node.lineno),
            meta={"loop_type": "while"},
        )
        self.nodes.append(gnode)
        if self._scope_stack:
            self.edges.append(GraphEdge(self._scope_stack[-1], node_id, "contains"))

        self._scope_stack.append(node_id)
        self.generic_visit(node)
        self._scope_stack.pop()

    def visit_If(self, node: ast.If):
        node_id = self._make_id("branch", node.lineno)
        gnode = GraphNode(
            id=node_id,
            type="branch",
            label="if",
            lineno=node.lineno,
            end_lineno=getattr(node, "end_lineno", node.lineno),
            meta={"has_else": bool(node.orelse)},
        )
        self.nodes.append(gnode)
        if self._scope_stack:
            self.edges.append(GraphEdge(self._scope_stack[-1], node_id, "contains"))

        self._scope_stack.append(node_id)
        self.generic_visit(node)
        self._scope_stack.pop()

    def visit_Call(self, node: ast.Call):
        """Record function call edges (best-effort, name-based)."""
        if self._scope_stack:
            caller = self._scope_stack[-1]
            callee_name: str | None = None
            if isinstance(node.func, ast.Name):
                callee_name = node.func.id
            elif isinstance(node.func, ast.Attribute):
                callee_name = node.func.attr

            if callee_name:
                # Try to resolve callee to a known node id
                target = next(
                    (n.id for n in self.nodes
                     if n.type == "function" and n.label == callee_name),
                    None,
                )
                if target and target != caller:
                    self.edges.append(GraphEdge(caller, target, "calls"))

        self.generic_visit(node)


# ── Public API ───────────────────────────────────────────────────────────────

def extract_graph(source: str, filename: str = "<string>") -> dict[str, Any]:
    """
    Parse *source* and return a serialisable graph dict:
      { "nodes": [...], "edges": [...] }
    """
    try:
        tree = ast.parse(source, filename=filename)
    except SyntaxError as exc:
        return {
            "nodes": [],
            "edges": [],
            "error": f"SyntaxError at line {exc.lineno}: {exc.msg}",
        }

    extractor = CodeGraphExtractor(filename)
    extractor.visit(tree)

    return {
        "nodes": [asdict(n) for n in extractor.nodes],
        "edges": [asdict(e) for e in extractor.edges],
    }
