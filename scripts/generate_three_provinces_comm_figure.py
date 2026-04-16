from __future__ import annotations

import json
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont


ROOT = Path("/Users/zty/my-project/mailclaw")
SCREENSHOT_PATH = ROOT / "output" / "playwright" / "three-provinces-room-real-zh.png"
ARTIFACT_PATH = ROOT / "output" / "benchmarks" / "three-provinces-room" / "artifacts" / "three-provinces-room.json"
OUTPUT_PATH = ROOT / "output" / "doc" / "results-three-provinces-communication.png"

FONT_CANDIDATES = [
    Path("/System/Library/Fonts/STHeiti Medium.ttc"),
    Path("/System/Library/Fonts/Hiragino Sans GB.ttc"),
    Path("/System/Library/Fonts/Supplemental/Arial Unicode.ttf"),
    Path("/System/Library/Fonts/Supplemental/Songti.ttc"),
]

LABELS = {
    "taizi": "太子",
    "zhongshu": "中书省",
    "menxia": "门下省",
    "shangshu": "尚书省",
    "libu-personnel": "吏部",
    "hubu": "户部",
    "bingbu": "兵部",
    "xingbu": "刑部",
    "libu-rites": "礼部",
    "gongbu": "工部",
}

CORE_SUMMARY = [
    ("太子", "立项：今夜前交付可颁行诏令"),
    ("中书省", "拆解任务包，明确六个政务维度"),
    ("门下省", "封驳后准奏，补齐官责与法度"),
    ("尚书省", "总领执行，把稳定任务包派给六部"),
    ("太子", "收束 final-ready，进入治理覆核"),
]

DEPARTMENT_ROWS = [
    ("吏部", "编制建议", "设督办大臣，州县逐级领责"),
    ("户部", "钱粮口径", "先开常平仓，数字一律标暂估"),
    ("兵部", "转运维稳", "水陆三路转运，不得借机扰民"),
    ("刑部", "法度边界", "可急调，不可越旨直接定重典"),
    ("礼部", "统稿成诏", "先安民，再施救，再写督责"),
    ("工部", "定稿装配", "整合次序与暂估说明，形成成品"),
]


def find_font_path() -> Path:
    for path in FONT_CANDIDATES:
        if path.exists():
            return path
    raise FileNotFoundError("No usable CJK font found.")


FONT_PATH = find_font_path()


def load_font(size: int) -> ImageFont.FreeTypeFont:
    return ImageFont.truetype(str(FONT_PATH), size)


def shorten(text: str, limit: int) -> str:
    clean = " ".join(str(text).split())
    return clean if len(clean) <= limit else clean[: limit - 1] + "…"


def draw_text_box(
    draw: ImageDraw.ImageDraw,
    box: tuple[int, int, int, int],
    title: str,
    body: str,
    *,
    fill: str,
    outline: str,
    title_fill: str = "#f5f7fa",
    body_fill: str = "#b8c0cc",
    badge_fill: str | None = None,
) -> None:
    x1, y1, x2, y2 = box
    draw.rounded_rectangle(box, radius=22, fill=fill, outline=outline, width=2)
    if badge_fill is not None:
        draw.rounded_rectangle((x1 + 18, y1 + 16, x1 + 108, y1 + 46), radius=12, fill=badge_fill)
        draw.text((x1 + 63, y1 + 31), title, font=load_font(17), fill="#ffffff", anchor="mm")
    else:
        draw.text((x1 + 22, y1 + 34), title, font=load_font(24), fill=title_fill, anchor="ls")
    body_font = load_font(18)
    draw.text((x1 + 22, y1 + 68), shorten(body, 48), font=body_font, fill=body_fill, anchor="ls")


def draw_department_box(
    draw: ImageDraw.ImageDraw,
    box: tuple[int, int, int, int],
    dept: str,
    title: str,
    body: str,
) -> None:
    x1, y1, x2, y2 = box
    draw.rounded_rectangle(box, radius=22, fill="#151f2b", outline="#2f3d52", width=2)
    draw.rounded_rectangle((x1 + 18, y1 + 14, x1 + 108, y1 + 44), radius=12, fill="#7a3e30")
    draw.text((x1 + 63, y1 + 29), dept, font=load_font(17), fill="#ffffff", anchor="mm")
    draw.text((x1 + 126, y1 + 31), title, font=load_font(20), fill="#f5f7fa", anchor="ls")
    draw.text((x1 + 22, y1 + 66), shorten(body, 40), font=load_font(17), fill="#c6ced8", anchor="ls")
    draw.text((x1 + 22, y2 - 18), f"尚书省 -> {dept} -> 尚书省", font=load_font(15), fill="#8f9db1", anchor="ls")


def draw_down_arrow(draw: ImageDraw.ImageDraw, x: int, y1: int, y2: int, color: str) -> None:
    draw.line((x, y1, x, y2), fill=color, width=4)
    draw.polygon([(x, y2 + 10), (x - 8, y2 - 4), (x + 8, y2 - 4)], fill=color)


def draw_connector(draw: ImageDraw.ImageDraw, start: tuple[int, int], end: tuple[int, int], color: str) -> None:
    sx, sy = start
    ex, ey = end
    mid_x = sx + 110
    draw.line((sx, sy, mid_x, sy), fill=color, width=3)
    draw.line((mid_x, sy, mid_x, ey), fill=color, width=3)
    draw.line((mid_x, ey, ex - 16, ey), fill=color, width=3)
    draw.polygon([(ex, ey), (ex - 16, ey - 8), (ex - 16, ey + 8)], fill=color)


def main() -> None:
    artifact = json.loads(ARTIFACT_PATH.read_text(encoding="utf-8"))
    room = artifact["roomView"]
    scenario = artifact["scenario"]

    canvas_w, canvas_h = 1600, 1220
    image = Image.new("RGB", (canvas_w, canvas_h), "#0b0f14")
    screenshot = Image.open(SCREENSHOT_PATH).convert("RGB")

    sidebar = screenshot.crop((0, 0, 250, screenshot.height)).resize((215, canvas_h))
    header = screenshot.crop((250, 0, screenshot.width, 92)).resize((canvas_w - 215, 92))
    image.paste(sidebar, (0, 0))
    image.paste(header, (215, 0))

    draw = ImageDraw.Draw(image)

    draw.rounded_rectangle((245, 120, 1560, 1170), radius=28, fill="#101720", outline="#232c39", width=2)
    draw.rounded_rectangle((275, 150, 1530, 250), radius=24, fill="#151e2a", outline="#283344", width=2)

    title_font = load_font(34)
    subtitle_font = load_font(18)
    metric_label_font = load_font(16)
    metric_value_font = load_font(28)
    small_font = load_font(15)

    draw.text((305, 188), "三省六部通信链", font=title_font, fill="#f5f7fa", anchor="ls")
    draw.text(
        (305, 221),
        shorten(f"{scenario['title']} · 从真实 room artifact 与 demo 前端截图重绘", 54),
        font=subtitle_font,
        fill="#93a0b2",
        anchor="ls",
    )

    chip_specs = [
        ("前台", LABELS.get(str(room["frontAgentId"]), str(room["frontAgentId"]))),
        ("参与者", str(room["agentCount"])),
        ("消息", str(room["virtualMessageCount"])),
        ("投递", str(room["mailboxDeliveryCount"])),
    ]
    chip_x = 940
    for index, (label, value) in enumerate(chip_specs):
        x1 = chip_x + index * 145
        x2 = x1 + 130
        draw.rounded_rectangle((x1, 170, x2, 232), radius=18, fill="#1b2532", outline="#314054", width=2)
        draw.text((x1 + 18, 191), label, font=metric_label_font, fill="#92a0b1", anchor="ls")
        draw.text((x1 + 18, 219), value, font=metric_value_font, fill="#f5f7fa", anchor="ls")

    draw.text(
        (305, 286),
        "结构说明：左侧是主责任链，右侧是尚书省向六部派案并收束回信的实际通信。",
        font=load_font(19),
        fill="#d4d9e1",
        anchor="ls",
    )

    left_x1, left_x2 = 310, 640
    left_center_x = (left_x1 + left_x2) // 2
    core_ys = [340, 470, 600, 730, 1045]
    core_fill = "#1b2532"
    accent_fill = "#7a3e30"
    for index, ((title, body), y) in enumerate(zip(CORE_SUMMARY, core_ys)):
        box = (left_x1, y, left_x2, y + 92)
        draw_text_box(
            draw,
            box,
            title,
            body,
            fill=core_fill if index < 4 else "#18232c",
            outline="#324156",
            badge_fill=accent_fill if index != 4 else "#2f6a63",
        )
        if index < len(core_ys) - 1:
            draw_down_arrow(draw, left_center_x, y + 92, core_ys[index + 1] - 18, "#7b8898")

    dept_x1, dept_x2 = 840, 1490
    dept_ys = [340, 460, 580, 700, 820, 940]
    for (dept, title, body), y in zip(DEPARTMENT_ROWS, dept_ys):
        box = (dept_x1, y, dept_x2, y + 100)
        draw_department_box(draw, box, dept, title, body)
        draw_connector(draw, (left_x2, 776), (dept_x1, y + 50), "#8b95a4")

    draw.rounded_rectangle((305, 1120, 1490, 1150), radius=12, fill="#141c26")
    draw.text(
        (326, 1139),
        "最终回收路径：六部回信 -> 尚书省总装 -> 太子 final-ready -> 治理覆核通过。",
        font=load_font(16),
        fill="#98a5b7",
        anchor="ls",
    )

    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    image.save(OUTPUT_PATH)
    print(OUTPUT_PATH)


if __name__ == "__main__":
    main()
