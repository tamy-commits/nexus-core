import re
from dataclasses import dataclass
from pathlib import Path


@dataclass(frozen=True)
class PolicyChunk:
    code: str
    version: str
    text: str
    score: float


def _tokens(text: str) -> set[str]:
    return set(re.findall(r"[a-zá-ú0-9]+", text.lower()))


class PolicyRetriever:
    """Small, inspectable lexical RAG suitable for the controlled prototype."""

    def __init__(self, knowledge_dir: Path):
        self.documents = list(knowledge_dir.glob("*.md"))

    def retrieve(self, query: str, limit: int = 3) -> list[PolicyChunk]:
        query_tokens = _tokens(query)
        ranked: list[PolicyChunk] = []
        for path in self.documents:
            content = path.read_text(encoding="utf-8")
            header, *paragraphs = [p.strip() for p in content.split("\n\n") if p.strip()]
            metadata = dict(item.split(":", 1) for item in header.splitlines() if ":" in item)
            for paragraph in paragraphs:
                paragraph_tokens = _tokens(paragraph)
                overlap = len(query_tokens & paragraph_tokens)
                score = overlap / max(len(query_tokens), 1)
                ranked.append(PolicyChunk(code=metadata.get("code", path.stem).strip(), version=metadata.get("version", "unknown").strip(), text=paragraph, score=round(score, 4)))
        return sorted(ranked, key=lambda chunk: chunk.score, reverse=True)[:limit]
