
import os, re, sys, shutil, datetime
from pathlib import Path
from dataclasses import dataclass
from typing import List, Dict, Optional

try:
    from bs4 import BeautifulSoup, Tag
except Exception as e:
    print("BeautifulSoup4 is required. Install with: pip install beautifulsoup4 lxml")
    raise

import tkinter as tk
from tkinter import ttk, filedialog, messagebox

HTML_PATH = Path("atoob.html")
JS_PATH   = Path("script.js")

SECTIONS = [
    ("watching", "watching-videos"),
    ("promoted", "promoted-videos"),
    ("featured", "featured-videos"),
]

YOUTUBE_THUMB_FMT = "https://img.youtube.com/vi/{yid}/hqdefault.jpg"

@dataclass
class Tile:
    id: str = ""                 # href video param ID
    title: str = ""
    description: str = ""        # stored on <a> as data-description
    thumb_src: str = ""          # img src (local path or yt thumb url)
    use_youtube_thumb: bool = False
    youtube_id: str = ""         # from script.js videoData[ID].youtubeId

def load_html(path: Path):
    raw = path.read_text(encoding="utf-8", errors="ignore")
    try:
        soup = BeautifulSoup(raw, "lxml")
    except Exception:
        soup = BeautifulSoup(raw, "html.parser")
    return soup

def parse_tiles_from_html(soup) -> Dict[str, List[Tile]]:
    out: Dict[str, List[Tile]] = {}
    for key, grid_id in SECTIONS:
        out[key] = []
        grid = soup.find(id=grid_id)
        if not grid:
            continue
        for thumb_div in grid.find_all("div", class_="video-thumb", recursive=False):
            a = thumb_div.find("a")
            if not a:
                continue
            href = a.get("href","")
            m = re.search(r"[?&]video=([^&]+)", href)
            vid = m.group(1) if m else ""
            img = a.find("img")
            p = a.find("p")
            title = p.get_text(strip=True) if p else ""
            src = img.get("src","") if img else ""
            desc = a.get("data-description","") or ""
            out[key].append(Tile(id=vid, title=title, description=desc, thumb_src=src, use_youtube_thumb=False))
    return out

def extract_video_data_map(js_text: str) -> Dict[str, Dict[str,str]]:
    m = re.search(r"const\s+videoData\s*=\s*\{(.*?)\};", js_text, re.S)
    if not m:
        return {}
    body = m.group(1)
    entry_re = re.compile(
        r"'(?P<id>[^']+)'\s*:\s*\{\s*('title'\s*:\s*'(?P<title>.*?)'\s*,\s*)?('description'\s*:\s*'(?P<desc>.*?)'\s*,\s*)?('youtubeId'\s*:\s*'(?P<yid>.*?)')\s*\}",
        re.S
    )
    result = {}
    for em in entry_re.finditer(body):
        vid = em.group("id")
        title = em.group("title") or ""
        desc  = em.group("desc") or ""
        yid   = em.group("yid") or ""
        result[vid] = {"title": title, "description": desc, "youtubeId": yid}
    return result

def _js_escape_single_quoted(s: str) -> str:
    # Keep single-quoted JS strings; escape backslashes and single quotes safely.
    return s.replace("\\", "\\\\").replace("'", "\\'")

def update_js_video_data(js_text: str, id_to_youtube: Dict[str, str], id_to_title: Dict[str,str]=None, id_to_desc: Dict[str,str]=None) -> str:
    if id_to_title is None: id_to_title = {}
    if id_to_desc is None: id_to_desc = {}

    entry_re = re.compile(
        r"'(?P<id>[^']+)'\s*:\s*\{\s*('title'\s*:\s*'(?P<title>.*?)'\s*,\s*)?('description'\s*:\s*'(?P<desc>.*?)'\s*,\s*)?('youtubeId'\s*:\s*'(?P<yid>.*?)')\s*\}",
        re.S
    )

    def repl(match):
        vid   = match.group("id")
        title = match.group("title") or ""
        desc  = match.group("desc") or ""
        yid   = match.group("yid") or ""

        if vid in id_to_youtube: yid = id_to_youtube[vid]
        if vid in id_to_title:   title = id_to_title[vid]
        if vid in id_to_desc:    desc = id_to_desc[vid]

        title_esc = _js_escape_single_quoted(title)
        desc_esc  = _js_escape_single_quoted(desc)
        yid_esc   = _js_escape_single_quoted(yid)

        new_block = "'{vid}': {{ 'title': '{t}', 'description': '{d}', 'youtubeId': '{y}' }}".format(
            vid=vid, t=title_esc, d=desc_esc, y=yid_esc
        )
        return new_block

    m = re.search(r"(const\s+videoData\s*=\s*\{)(.*?)(\};)", js_text, re.S)
    if not m:
        return js_text
    head, body, tail = m.group(1), m.group(2), m.group(3)
    new_body = entry_re.sub(repl, body)
    return f"{head}{new_body}{tail}"

def backup(path: Path) -> Path:
    ts = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
    bak = path.with_suffix(path.suffix + f".bak_{ts}")
    shutil.copyfile(path, bak)
    return bak

def build_tile_tag(soup, tile: Tile) -> Tag:
    div = soup.new_tag("div", **{"class":"video-thumb"})
    a = soup.new_tag("a", href=f"video.html?video={tile.id or ''}")
    if tile.description:
        a["data-description"] = tile.description
    img = soup.new_tag("img", src=tile.thumb_src or "Thumbnails/placeholder.png", alt=tile.title or "Video")
    p = soup.new_tag("p"); p.string = tile.title or "(untitled)"
    a.append(img); a.append(p); div.append(a)
    return div

def save_html_and_js(soup, data: Dict[str, List[Tile]]):
    for key, grid_id in SECTIONS:
        grid = soup.find(id=grid_id)
        if not grid: continue
        for child in list(grid.children):
            if getattr(child, "name", None): child.decompose()
        for t in data.get(key, []):
            grid.append(build_tile_tag(soup, t))

    backup_html = backup(HTML_PATH)
    HTML_PATH.write_text(str(soup), encoding="utf-8")

    js_raw = JS_PATH.read_text(encoding="utf-8", errors="ignore")
    id_to_y = {}; id_to_t = {}; id_to_d = {}
    for tiles in data.values():
        for t in tiles:
            if t.id:
                if t.youtube_id is not None:
                    id_to_y[t.id] = t.youtube_id
                id_to_t[t.id] = t.title or ""
                id_to_d[t.id] = t.description or ""

    new_js = update_js_video_data(js_raw, id_to_y, id_to_t, id_to_d)
    backup_js = backup(JS_PATH)
    JS_PATH.write_text(new_js, encoding="utf-8")
    return backup_html, backup_js

class App:
    def __init__(self, master):
        self.master = master
        master.title("ApacheToob Direct HTML/JS Editor (Fixed)")
        master.geometry("1060x640")

        if not HTML_PATH.exists():
            messagebox.showerror("Missing file", f"{HTML_PATH.name} not found.")
            master.destroy(); return
        if not JS_PATH.exists():
            messagebox.showerror("Missing file", f"{JS_PATH.name} not found.")
            master.destroy(); return

        self.soup = load_html(HTML_PATH)
        self.data = parse_tiles_from_html(self.soup)

        js_raw = JS_PATH.read_text(encoding="utf-8", errors="ignore")
        video_map = extract_video_data_map(js_raw)

        for tiles in self.data.values():
            for t in tiles:
                info = video_map.get(t.id, {})
                t.youtube_id = info.get("youtubeId","")
                if t.youtube_id and t.thumb_src == YOUTUBE_THUMB_FMT.format(yid=t.youtube_id):
                    t.use_youtube_thumb = True

        self.section_var = tk.StringVar(value=SECTIONS[0][0])

        left = ttk.Frame(master, padding=8); left.pack(side="left", fill="y")
        ttk.Label(left, text="Section").pack(anchor="w")
        self.section_cb = ttk.Combobox(left, values=[k for k,_ in SECTIONS], textvariable=self.section_var, state="readonly")
        self.section_cb.pack(fill="x"); self.section_cb.bind("<<ComboboxSelected>>", lambda e: self.refresh_list())

        self.listbox = tk.Listbox(left, activestyle="dotbox")
        self.listbox.pack(fill="both", expand=True, pady=8)

        btns = ttk.Frame(left); btns.pack(fill="x")
        ttk.Button(btns, text="Up", command=self.move_up).pack(side="left", expand=True, fill="x", padx=2)
        ttk.Button(btns, text="Down", command=self.move_down).pack(side="left", expand=True, fill="x", padx=2)

        abtns = ttk.Frame(left); abtns.pack(fill="x", pady=(8,0))
        ttk.Button(abtns, text="Add", command=self.add_item).pack(side="left", expand=True, fill="x", padx=2)
        ttk.Button(abtns, text="Remove", command=self.remove_item).pack(side="left", expand=True, fill="x", padx=2)
        ttk.Button(abtns, text="Duplicate", command=self.duplicate_item).pack(side="left", expand=True, fill="x", padx=2)

        right = ttk.Frame(master, padding=8); right.pack(side="left", fill="both", expand=True)

        form = ttk.Frame(right); form.pack(fill="x", pady=(0,8))
        self.var_id = tk.StringVar(); self.var_title = tk.StringVar(); self.var_thumb = tk.StringVar()
        self.var_youtube = tk.StringVar(); self.var_use_yt = tk.BooleanVar(value=False)

        ttk.Label(form, text="Tile Video ID (href param)").grid(row=0, column=0, sticky="e")
        ttk.Entry(form, textvariable=self.var_id).grid(row=0, column=1, sticky="ew", padx=6, pady=2)

        ttk.Label(form, text="Title").grid(row=1, column=0, sticky="e")
        ttk.Entry(form, textvariable=self.var_title).grid(row=1, column=1, sticky="ew", padx=6, pady=2)

        ttk.Label(form, text="YouTube Video ID").grid(row=2, column=0, sticky="e")
        ttk.Entry(form, textvariable=self.var_youtube).grid(row=2, column=1, sticky="ew", padx=6, pady=2)

        thumb_group = ttk.LabelFrame(right, text="Thumbnail")
        thumb_group.pack(fill="x", pady=(0,8))

        yt_row = ttk.Frame(thumb_group); yt_row.pack(fill="x", padx=8, pady=6)
        ttk.Checkbutton(yt_row, variable=self.var_use_yt, text="Use YouTube default thumbnail (hqdefault.jpg)",
                        command=self.toggle_thumb_mode).pack(anchor="w")

        file_row = ttk.Frame(thumb_group); file_row.pack(fill="x", padx=8, pady=6)
        ttk.Label(file_row, text="Local image (Thumbnails/)").pack(side="left")
        self.ent_thumb = ttk.Entry(file_row, textvariable=self.var_thumb)
        self.ent_thumb.pack(side="left", fill="x", expand=True, padx=6)
        ttk.Button(file_row, text="Browse…", command=self.pick_thumb).pack(side="left")

        ttk.Label(right, text="Description").pack(anchor="w")
        self.txt_desc = tk.Text(right, height=9, wrap="word")
        self.txt_desc.pack(fill="both", expand=True)

        actions = ttk.Frame(right); actions.pack(fill="x", pady=8)
        ttk.Button(actions, text="Save HTML + JS", command=self.save).pack(side="right")

        form.grid_columnconfigure(1, weight=1)
        self.refresh_list()
        self.listbox.bind("<<ListboxSelect>>", lambda e: self.load_selected())
        self.toggle_thumb_mode()

    def current_list(self) -> List[Tile]:
        return self.data.get(self.section_var.get(), [])

    def refresh_list(self):
        self.listbox.delete(0, "end")
        for t in self.current_list():
            self.listbox.insert("end", f'{t.title or "(untitled)"}  —  id:{t.id}  yid:{t.youtube_id or "-"}')

    def get_sel_index(self) -> Optional[int]:
        sel = self.listbox.curselection()
        return sel[0] if sel else None

    def load_selected(self):
        idx = self.get_sel_index()
        if idx is None: return
        t = self.current_list()[idx]
        self.var_id.set(t.id); self.var_title.set(t.title)
        self.var_youtube.set(t.youtube_id); self.var_thumb.set(t.thumb_src)
        self.var_use_yt.set(bool(t.use_youtube_thumb))
        self.txt_desc.delete("1.0","end"); self.txt_desc.insert("1.0", t.description or "")
        self.toggle_thumb_mode()

    def add_item(self):
        lst = self.current_list()
        used = {x.id for x in lst}; nid = 1
        while str(nid) in used: nid += 1
        lst.append(Tile(id=str(nid), title="New Video"))
        self.refresh_list(); self.listbox.selection_set("end"); self.load_selected()

    def duplicate_item(self):
        idx = self.get_sel_index()
        if idx is None: return
        lst = self.current_list(); src = lst[idx]
        used = {x.id for x in lst}; nid = 1
        while str(nid) in used: nid += 1
        dup = Tile(id=str(nid), title=src.title, description=src.description, thumb_src=src.thumb_src,
                   use_youtube_thumb=src.use_youtube_thumb, youtube_id=src.youtube_id)
        lst.insert(idx+1, dup)
        self.refresh_list(); self.listbox.selection_set(idx+1); self.load_selected()

    def remove_item(self):
        idx = self.get_sel_index()
        if idx is None: return
        del self.current_list()[idx]; self.refresh_list()

    def move_up(self):
        idx = self.get_sel_index()
        if idx is None or idx == 0: return
        lst = self.current_list(); lst[idx-1], lst[idx] = lst[idx], lst[idx-1]
        self.refresh_list(); self.listbox.selection_set(idx-1)

    def move_down(self):
        idx = self.get_sel_index()
        lst = self.current_list()
        if idx is None or idx >= len(lst)-1: return
        lst[idx+1], lst[idx] = lst[idx], lst[idx+1]
        self.refresh_list(); self.listbox.selection_set(idx+1)

    def toggle_thumb_mode(self):
        use_yt = self.var_use_yt.get()
        state = ("disabled" if use_yt else "normal")
        self.ent_thumb.configure(state=state)
        try:
            browse_btn = self.ent_thumb.master.winfo_children()[-1]
            browse_btn.configure(state=("disabled" if use_yt else "normal"))
        except Exception:
            pass

    def pick_thumb(self):
        initial = os.path.join(os.getcwd(), "Thumbnails")
        if not os.path.isdir(initial): initial = os.getcwd()
        path = filedialog.askopenfilename(
            title="Choose thumbnail image",
            initialdir=initial,
            filetypes=[("Images","*.png;*.jpg;*.jpeg;*.gif;*.webp;*.bmp"), ("All files","*.*")]
        )
        if path:
            rel = os.path.relpath(path, os.getcwd()).replace("\\","/")
            self.var_thumb.set(rel)

    def save(self):
        idx = self.get_sel_index()
        if idx is not None:
            t = self.current_list()[idx]
            t.id = self.var_id.get().strip()
            t.title = self.var_title.get().strip()
            t.youtube_id = self.var_youtube.get().strip()
            t.description = self.txt_desc.get("1.0","end").strip()
            use_yt = self.var_use_yt.get()
            t.use_youtube_thumb = use_yt
            if use_yt and t.youtube_id:
                t.thumb_src = YOUTUBE_THUMB_FMT.format(yid=t.youtube_id)
            else:
                t.thumb_src = self.var_thumb.get().strip()

        # Warn on duplicate IDs
        for sec, tiles in self.data.items():
            ids = [t.id for t in tiles]
            if len(ids) != len(set(ids)):
                if not messagebox.askyesno("Warning", f"Duplicate tile IDs detected in section '{sec}'. Continue save?"):
                    return

        backup_html, backup_js = save_html_and_js(self.soup, self.data)
        messagebox.showinfo("Saved", f"Saved to:\n- {HTML_PATH.name}\n- {JS_PATH.name}\nBackups:\n- {backup_html.name}\n- {backup_js.name}")
        self.refresh_list()

if __name__ == "__main__":
    root = tk.Tk()
    App(root)
    root.mainloop()
