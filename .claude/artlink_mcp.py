"""
Artlink MCP Filesystem Server

프로젝트 폴더의 파일을 Claude Code가 도구(Tool)로 직접 접근할 수 있도록 노출합니다.
"""

import os
from mcp.server.fastmcp import FastMCP

PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))
EXCLUDED_DIRS = {".git", ".claude", "node_modules"}

mcp = FastMCP("artlink-filesystem")


def _resolve(relative_path: str) -> str:
    """PROJECT_ROOT 바깥으로의 경로 탈출을 차단하고 절대 경로를 반환합니다."""
    candidate = os.path.abspath(os.path.join(PROJECT_ROOT, relative_path))
    if os.path.commonpath([PROJECT_ROOT, candidate]) != PROJECT_ROOT:
        raise ValueError(f"허용되지 않은 경로입니다: {relative_path}")
    return candidate


@mcp.tool()
def list_files(subdir: str = "") -> str:
    """프로젝트 폴더(또는 하위 폴더)의 파일·폴더 목록을 반환합니다.

    Args:
        subdir: 조회할 하위 폴더 경로 (기본값: 프로젝트 루트)
    """
    try:
        target = _resolve(subdir)
        if not os.path.isdir(target):
            return f"폴더를 찾을 수 없습니다: '{subdir}'"

        entries = [e for e in sorted(os.listdir(target)) if e not in EXCLUDED_DIRS]
        if not entries:
            return "폴더가 비어있습니다."
        return "\n".join(
            f"- {e}{'/' if os.path.isdir(os.path.join(target, e)) else ''}" for e in entries
        )
    except ValueError as e:
        return str(e)
    except Exception as e:
        return f"오류: {e}"


@mcp.tool()
def read_file(relative_path: str) -> str:
    """프로젝트 폴더 내 파일을 읽어 내용을 반환합니다.

    Args:
        relative_path: 프로젝트 루트 기준 상대 경로 (예: content/about.md)
    """
    try:
        filepath = _resolve(relative_path)
        if not os.path.exists(filepath):
            return f"파일을 찾을 수 없습니다: '{relative_path}'"
        if not os.path.isfile(filepath):
            return f"파일이 아닙니다: '{relative_path}'"

        with open(filepath, "r", encoding="utf-8") as f:
            return f.read()
    except ValueError as e:
        return str(e)
    except Exception as e:
        return f"파일 읽기 오류: {e}"


if __name__ == "__main__":
    mcp.run()
