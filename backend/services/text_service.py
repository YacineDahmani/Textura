import re
from typing import Any, Dict, List

class TextService:
    @staticmethod
    def test_regex(
        text: str, pattern: str, replace_pattern: str, flags_str: str, mode: str
    ) -> Dict[str, Any]:
        # Build regex flags mask
        flags_mask = 0
        if "i" in flags_str:
            flags_mask |= re.IGNORECASE
        if "m" in flags_str:
            flags_mask |= re.MULTILINE
        
        try:
            regex = re.compile(pattern, flags_mask)
        except re.error as e:
            raise ValueError(f"Invalid Regular Expression: {str(e)}")

        if mode == "replace":
            try:
                replaced = regex.sub(replace_pattern, text)
                return {"output": replaced, "matches": []}
            except Exception as e:
                raise ValueError(f"Replacement Error: {str(e)}")

        # Else "test" mode: extract matches and captured groups
        matches = []
        # Support global search
        for match in regex.finditer(text):
            matches.append({
                "text": match.group(0),
                "start": match.start(),
                "end": match.end(),
                "groups": list(match.groups()),
                "groupdict": match.groupdict(),
            })

        # We can format the output to display match summaries clearly
        if not matches:
            output_str = "No matches found."
        else:
            summary = []
            for idx, m in enumerate(matches):
                groups_info = f" | Groups: {m['groups']}" if m["groups"] else ""
                summary.append(
                    f"Match {idx + 1}: \"{m['text']}\" at pos {m['start']}-{m['end']}{groups_info}"
                )
            output_str = "\n".join(summary)

        return {
            "output": output_str,
            "matches": matches,
        }
