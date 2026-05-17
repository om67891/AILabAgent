from dataclasses import dataclass, field


@dataclass
class ConversationMemory:
    max_turns: int = 12
    turns: list[dict[str, str]] = field(default_factory=list)

    def add(self, role: str, content: str) -> None:
        self.turns.append({"role": role, "content": content})
        self.turns = self.turns[-self.max_turns :]

    def render(self) -> str:
        return "\n".join(f"{turn['role']}: {turn['content']}" for turn in self.turns)
