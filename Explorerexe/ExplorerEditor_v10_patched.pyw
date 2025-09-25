# ExplorerEditor.pyw
# A Tkinter GUI editor for explorerdotexe.html that parses/edits FS, DEFAULT_PICTURES, QUICKLINKS, and "Other Places".
# Run with Python 3.10+ on Windows. No external deps required.
#
# Features:
# - Parses FS = { ... } (entire nested tree), DEFAULT_PICTURES, QUICKLINKS, and the "Other Places" anchors.
# - Tree view to browse and manage folders, images, videos (YouTube), drives, and shortcuts.
# - Add / remove / rename / reorder nodes (Up/Down).
# - Inspector to edit title/url/to/href/etc depending on node type.
# - Add Image (copies into /pictures/ and updates DEFAULT_PICTURES + FS), Add YouTube, Add Shortcut, Add Web Link.
# - Templates: Add User Home, Add Documents bundle.
# - Dialogs to manage Quick Links and Other Places (add/edit/remove/reorder).
# - Save writes a timestamped .bak backup, then updates the correct blocks in the HTML in-place.
#
# Notes:
# - Ordering is preserved by keeping "children" as ordered dicts.
# - FS object is JSON-like in the source HTML. We convert JS object syntax to valid JSON for parsing and back.
#
# Author: ChatGPT

from __future__ import annotations
import json, os, re, shutil, sys, datetime
from collections import OrderedDict
from tkinter import *
from tkinter import ttk, filedialog, messagebox, simpledialog

APP_TITLE = "ExplorerEditor"
DEFAULT_HTML_CANDIDATE = "explorerdotexe.html"  # looked up in working dir first

# ------------------------- Utilities -------------------------

def read_text(path:str)->str:
    with open(path, "r", encoding="utf-8") as f:
        return f.read()

def write_text(path:str, s:str):
    with open(path, "w", encoding="utf-8", newline="\n") as f:
        f.write(s)

def timestamp()->str:
    return datetime.datetime.now().strftime("%Y%m%d-%H%M%S")

def ensure_dir(p:str):
    os.makedirs(p, exist_ok=True)

def copy_file_into(src:str, dst_dir:str)->str:
    ensure_dir(dst_dir)
    base = os.path.basename(src)
    dest = os.path.join(dst_dir, base)
    # If name exists, uniquify
    stem, ext = os.path.splitext(base)
    i = 1
    while os.path.exists(dest):
        dest = os.path.join(dst_dir, f"{stem}_{i}{ext}")
        i += 1
    shutil.copy2(src, dest)
    return os.path.basename(dest)

# --------------------- JS<->JSON conversion ------------------

def js_obj_to_json(s:str)->str:
    """Convert a JS object literal to JSON (best-effort for the specific HTML)."""
    s = _safe_remove_comments(s)

    # Quote common keys if unquoted
    keys = ["label","path","type","children","title","url","to","icon","details","href","thumb","src"]
    for k in keys:
        s = re.sub(rf"(?m)(?P<prefix>[\{{\[,]\s*)(?P<key>{k})\s*:", r'\g<prefix>"\g<key>":', s)

    # Remove trailing commas in objects/arrays
    s = re.sub(r",\s*([}\]])", r"\1", s)

    return s

def json_to_js_obj(d, indent=2):
    """Dump Python object to a JS-looking object with unquoted keys for aesthetics (within a safe whitelist)."""
    # We'll output as JSON first, then unquote whitelisted keys.
    txt = json.dumps(d, ensure_ascii=False, indent=indent)
    # Unquote keys that are valid identifiers (whitelist)
    whitelist = {"label","path","type","children","title","url","to","icon","details","href","thumb","src"}
    def unquote_keys(match):
        key = match.group(1)
        if key in whitelist:
            return key + ": "
        return f'"{key}": '
    txt = re.sub(r'"([A-Za-z_][A-Za-z0-9_]*)":\s', unquote_keys, txt)
    return txt


def _build_pictures_folder_from_defaults(default_pictures:list[str])->dict:
    # Mirror the runtime JS pictureFolder(DEFAULT_PICTURES, "pictures/")
    children = OrderedDict()
    for name in default_pictures:
        if not name: continue
        title = re.sub(r"\.\w+$", "", name)
        children[name] = {"type":"image","src":f"pictures/{name}","title":title}
    # Ensure "Cards" subfolder exists (the runtime boot() adds it)
    if "Cards" not in children:
        children["Cards"] = {"type":"folder","children":OrderedDict()}
    return {"type":"folder","children":children}

def _inject_runtime_symbols_into_fs_src(fs_src:str, default_pictures:list[str])->str:
    # Replace bare identifier picturesFolder with a literal object so we can JSON-parse FS.
    if re.search(r'(?<![."\\w])picturesFolder(?![\\w"])', fs_src):
        pics_obj = _build_pictures_folder_from_defaults(default_pictures)
        pics_js = json_to_js_obj(pics_obj, indent=2)
        fs_src = re.sub(r'(?<![."\\w])picturesFolder(?![\\w"])', pics_js, fs_src)
    return fs_src

def _safe_remove_comments(s:str)->str:
    """Remove // and /* */ comments but preserve anything inside string literals."""
    out = []
    i = 0
    n = len(s)
    in_str = None   # '" or "'" or '`'
    esc = False
    while i < n:
        ch = s[i]
        if in_str:
            out.append(ch)
            if esc:
                esc = False
            elif ch == "\\":
                esc = True
            elif ch == in_str:
                in_str = None
            i += 1
            continue
        # not in string
        if ch in ('"', "'", "`"):
            in_str = ch
            out.append(ch)
            i += 1
            continue
        if ch == "/" and i+1 < n:
            nxt = s[i+1]
            if nxt == "/":
                # line comment: skip until newline
                i += 2
                while i < n and s[i] not in ("\n", "\r"):
                    i += 1
                continue
            if nxt == "*":
                # block comment
                i += 2
                while i+1 < n and not (s[i] == "*" and s[i+1] == "/"):
                    i += 1
                i += 2 if i < n else 0
                continue
        out.append(ch)
        i += 1
    return "".join(out)

# --------------------- HTML parsing/writing ------------------

RE_DEFAULT_PICTURES = re.compile(r"const\s+DEFAULT_PICTURES\s*=\s*\[(?P<body>.*?)\];", re.DOTALL)
RE_QUICKLINKS = re.compile(r"const\s+QUICKLINKS\s*=\s*\[(?P<body>.*?)\];", re.DOTALL)
RE_FS_ASSIGN = re.compile(r"\bFS\s*=\s*\{", re.DOTALL)
# We'll locate the FS block by bracket matching from the start of "FS = {" to its matching "}" then the following ";".

def parse_array_of_strings(body:str)->list[str]:
    # Extract "..." items; allow for trailing commas/newlines
    items = re.findall(r'"([^"]+)"', body)
    return items

def parse_quicklinks(body:str)->list[dict]:
    js = "[" + body + "]"
    js = js_obj_to_json(js)
    arr = json.loads(js)
    # Normalize to list[{"label":..., "path":...}]
    out = []
    for it in arr:
        out.append({"label": it.get("label",""), "path": it.get("path","")})
    return out

def serialize_quicklinks(arr:list[dict])->str:
    return json_to_js_obj(arr, indent=2)[1:-1]  # strip [] for inlining into const [...]

def find_block_range(text:str, start_match:re.Match)->tuple[int,int]:
    """Given text and match where group spans 'FS = {', return (start_index, end_index_exclusive) covering {...} including braces only (no semicolon)."""
    start = start_match.end() - 1  # position at the '{'
    depth = 0
    i = start
    while i < len(text):
        ch = text[i]
        if ch == "{":
            depth += 1
        elif ch == "}":
            depth -= 1
            if depth == 0:
                return (start, i+1)
        i += 1
    raise ValueError("Could not bracket-match FS object.")

def parse_fs(text:str, default_pictures_list:list[str])->tuple[dict, tuple[int,int]]:
    m = RE_FS_ASSIGN.search(text)
    if not m:
        raise ValueError("FS assignment not found.")
    start, end = find_block_range(text, m)
    raw = text[start:end]
    # Inject runtime symbols (e.g., picturesFolder) so JSON parse won't fail
    raw = _inject_runtime_symbols_into_fs_src(raw, default_pictures_list)
    js = js_obj_to_json(raw)
    fs = json.loads(js, object_pairs_hook=OrderedDict)
    return fs, (start, end)

def parse_other_places(text:str)->tuple[list[dict], tuple[int,int]]:
    # Find the Other Places section inside the leftpane.
    # We capture the anchors <a class="quicklink" data-path="...">Label</a> following the "Other Places" <h4>.
    m = re.search(r"(<h4>Other Places</h4>)(?P<body>.*?)(</aside>)", text, flags=re.DOTALL)
    if not m:
        raise ValueError("Other Places block not found.")
    body = m.group("body")
    anchors = []
    for am in re.finditer(r'<a\s+class="quicklink"[^>]*data-path="([^"]+)"[^>]*>(.*?)</a>', body):
        path = am.group(1)
        label = re.sub(r"<.*?>", "", am.group(2)).strip()
        anchors.append({"label": label, "path": path})
    # Compute replacement range for just the anchors within Other Places
    start_idx = m.start("body")
    end_idx = m.end("body")
    # Within that subrange, find the first anchor and last anchor to limit replacement.
    a_list = list(re.finditer(r'\s*<a\s+class="quicklink"[^>]*data-path="[^"]+"[^>]*>.*?</a>\s*', text[start_idx:end_idx], flags=re.DOTALL))
    if a_list:
        a0 = start_idx + a_list[0].start()
        a1 = start_idx + a_list[-1].end()
        rng = (a0, a1)
    else:
        # If no anchors (unlikely), insert after the <h4> line
        insert_after_h4 = start_idx
        rng = (insert_after_h4, insert_after_h4)
    return anchors, rng

def serialize_other_places(anchors:list[dict])->str:
    lines = []
    for a in anchors:
        lines.append(f'        <a class="quicklink" data-path="{a["path"]}">{a["label"]}</a>')
    return "\n".join(lines)

# ------------------------ Data model helpers ------------------------

def ordered_children(d)->OrderedDict:
    """Ensure children is an OrderedDict for ordering stability."""
    ch = d.get("children") or OrderedDict()
    if isinstance(ch, dict) and not isinstance(ch, OrderedDict):
        ch = OrderedDict(ch.items())
    d["children"] = ch
    return ch


def _norm_path(p:str)->str:
    p = (p or "/").strip()
    if not p.startswith("/"):
        p = "/" + p
    # collapse multiple slashes
    p = re.sub(r"/{2,}", "/", p)
    # remove trailing slash except root
    if len(p)>1 and p.endswith("/"):
        p = p[:-1]
    return p

def _is_ancestor(anc:str, desc:str)->bool:
    anc = _norm_path(anc); desc = _norm_path(desc)
    if anc == "/":  # root is ancestor of all (except itself equal)
        return desc != "/"
    return desc.startswith(anc + "/") or desc == anc

def _would_create_cycle(shortcut_parent_path:str, target_path:str)->bool:
    """
    A shortcut at /A/B/C named X pointing to T is unsafe if T is an ancestor
    of /A/B/C (including /A/B/C itself). Entering it would bounce back upward
    and allow infinite path nesting in the UI.
    """
    parent = _norm_path(shortcut_parent_path)
    target = _norm_path(target_path)
    return _is_ancestor(target, parent)  # target is ancestor of parent -> cycle risk


def node_display_name(name:str, node:dict)->str:
    label = node.get("title") or name
    if name.endswith(".yt"):
        label = label.replace(".yt","")
    return label

# ------------------------ GUI ------------------------

class EditorApp:
    def __init__(self, root):
        self.root = root
        root.title(APP_TITLE)
        root.geometry("1100x720")

        self.html_path = None
        self.html_dir = None
        self.text = ""
        self.fs = OrderedDict()
        self.fs_range = None
        self.default_pictures = []
        self.quicklinks = []
        self.other_places = []
        self.other_places_range = None

        # UI
        self._build_menu()
        self._build_main()

        # Auto-open candidate in cwd if exists, else prompt
        candidate = os.path.abspath(DEFAULT_HTML_CANDIDATE)
        if os.path.exists(candidate):
            self.load_html(candidate)
        else:
            self.open_html_dialog()

    # ---------- UI builders ----------
    def _build_menu(self):
        m = Menu(self.root)
        filem = Menu(m, tearoff=0)
        filem.add_command(label="Open HTML…", command=self.open_html_dialog)
        filem.add_separator()
        filem.add_command(label="Save", command=self.save, accelerator="Ctrl+S")
        filem.add_command(label="Save As…", command=self.save_as)
        filem.add_separator()
        filem.add_command(label="Exit", command=self.root.destroy)
        m.add_cascade(label="File", menu=filem)

        linksm = Menu(m, tearoff=0)
        linksm.add_command(label="Manage Quick Links…", command=self.manage_quicklinks)
        linksm.add_command(label="Manage Other Places…", command=self.manage_other_places)
        m.add_cascade(label="Links", menu=linksm)

        templm = Menu(m, tearoff=0)
        templm.add_command(label="Add User Home…", command=self.add_user_home_template)
        templm.add_command(label="Add Documents bundle", command=self.add_documents_bundle_template)
        m.add_cascade(label="Templates", menu=templm)

        self.root.config(menu=m)
        self.root.bind("<Control-s>", lambda e: self.save())

    def _build_main(self):
        # Left: Tree. Right: Inspector + actions
        paned = PanedWindow(self.root, orient=HORIZONTAL)
        paned.pack(fill=BOTH, expand=1)

        # Tree frame
        left = Frame(paned)
        paned.add(left, minsize=360)

        self.tree = ttk.Treeview(left, columns=("type","title","shortcut"), show="tree headings")
        self.tree.heading("#0", text="Name")
        self.tree.heading("type", text="Type")
        self.tree.heading("title", text="Title/Label")
        self.tree.heading("shortcut", text="Shortcut To")
        self.tree.column("#0", width=260)
        self.tree.column("type", width=100, anchor=W)
        self.tree.column("title", width=220, anchor=W)
        self.tree.column("shortcut", width=240, anchor=W)
        self.tree.pack(fill=BOTH, expand=1, side=TOP)

        btns = Frame(left)
        btns.pack(fill=X, side=BOTTOM, pady=4)
        Button(btns, text="Add Folder", command=self.add_folder).pack(side=LEFT, padx=2)
        Button(btns, text="Add Image…", command=self.add_image).pack(side=LEFT, padx=2)
        Button(btns, text="Add YouTube…", command=self.add_youtube).pack(side=LEFT, padx=2)
        Button(btns, text="Add Shortcut…", command=self.add_shortcut).pack(side=LEFT, padx=2)
        Button(btns, text="Add Web Link…", command=self.add_weblink).pack(side=LEFT, padx=2)
        Button(btns, text="Rename…", command=self.rename_node).pack(side=LEFT, padx=8)
        Button(btns, text="Delete", command=self.delete_node).pack(side=LEFT, padx=2)
        Button(btns, text="Up", command=lambda: self.reorder(-1)).pack(side=RIGHT, padx=2)
        Button(btns, text="Down", command=lambda: self.reorder(+1)).pack(side=RIGHT, padx=2)

        # Inspector
        right = Frame(paned, padx=8, pady=8)
        paned.add(right)

        Label(right, text="Inspector", font=("Segoe UI", 11, "bold")).pack(anchor="w")
        form = Frame(right)
        form.pack(fill=X, pady=6)

        self.var_name = StringVar()
        self.var_type = StringVar()
        self.var_title = StringVar()
        self.var_url = StringVar()
        self.var_to = StringVar()
        self.var_href = StringVar()
        self.var_details = StringVar()

        def row(lbl, var):
            r = Frame(form); r.pack(fill=X, pady=2)
            Label(r, text=lbl, width=10, anchor="w").pack(side=LEFT)
            Entry(r, textvariable=var).pack(side=LEFT, fill=X, expand=1)
            return r

        self.row_name = row("Name", self.var_name)
        self.row_type = row("Type", self.var_type)
        self.row_title = row("Title", self.var_title)
        self.row_url = row("URL", self.var_url)
        self.row_to = row("To", self.var_to)
        self.row_href = row("Href", self.var_href)
        self.row_details = row("Details", self.var_details)

        Button(right, text="Apply Changes", command=self.apply_inspector).pack(anchor="e", pady=6)

        # Status
        self.status = StringVar(value="Ready")
        Label(self.root, textvariable=self.status, anchor="w", bd=1, relief=SUNKEN).pack(fill=X, side=BOTTOM)

        # Bindings
        self.tree.bind("<<TreeviewSelect>>", lambda e: self.refresh_inspector())

    # ---------- File I/O ----------
    def open_html_dialog(self):
        path = filedialog.askopenfilename(title="Open explorerdotexe.html", filetypes=[("HTML","*.html;*.htm"),("All files","*.*")])
        if not path:
            return
        self.load_html(path)

    def load_html(self, path:str):
        try:
            self.text = read_text(path)
        except Exception as e:
            messagebox.showerror(APP_TITLE, f"Failed to read file:\n{e}")
            return
        self.html_path = os.path.abspath(path)
        self.html_dir = os.path.dirname(self.html_path)

        # Parse blocks
        try:
            self.default_pictures = parse_array_of_strings(RE_DEFAULT_PICTURES.search(self.text).group("body"))
        except Exception:
            self.default_pictures = []
        try:
            self.quicklinks = parse_quicklinks(RE_QUICKLINKS.search(self.text).group("body"))
        except Exception:
            self.quicklinks = []

        try:
            self.other_places, self.other_places_range = parse_other_places(self.text)
        except Exception:
            self.other_places, self.other_places_range = [], None

        try:
            self.fs, self.fs_range = parse_fs(self.text, self.default_pictures)
            # Ensure all children are OrderedDict recursively
            self._normalize_children(self.fs)
        except Exception as e:
            messagebox.showerror(APP_TITLE, f"Failed to parse FS:\n{e}")
            return

        self.build_treeview()
        self._init_dnd()
        self.status.set(f"Loaded: {os.path.basename(self.html_path)}")

    def _normalize_children(self, node:dict):
        ch = node.get("children")
        if isinstance(ch, dict):
            if not isinstance(ch, OrderedDict):
                ch = OrderedDict(ch.items())
            node["children"] = ch
            for k, v in list(ch.items()):
                self._normalize_children(v)

    def save_as(self):
        if not self.html_path:
            return
        newp = filedialog.asksaveasfilename(defaultextension=".html", initialfile=os.path.basename(self.html_path),
                                            filetypes=[("HTML","*.html;*.htm"),("All files","*.*")])
        if not newp:
            return
        self._write_to(newp)

    def save(self):
        if not self.html_path:
            return
        self._write_to(self.html_path)

    def _write_to(self, path:str):
        # Backup original
        try:
            bak = f"{path}.{timestamp()}.bak"
            shutil.copy2(self.html_path, bak)
        except Exception as e:
            messagebox.showwarning(APP_TITLE, f"Warning: could not write backup:\n{e}")

        # Compose new text
        new_text = self.text

        # Replace FS block
        if self.fs_range:
            start, end = self.fs_range
            fs_js = json_to_js_obj(self.fs, indent=2)
            new_text = new_text[:start] + fs_js + new_text[end:]

        # Replace DEFAULT_PICTURES
        def_pics_body = ",\n  ".join([json.dumps(x, ensure_ascii=False) for x in self.default_pictures])
        new_text = RE_DEFAULT_PICTURES.sub(lambda m: f'const DEFAULT_PICTURES = [\n  {def_pics_body}\n];', new_text)

        # Replace QUICKLINKS
        q_body = serialize_quicklinks(self.quicklinks)
        new_text = RE_QUICKLINKS.sub(lambda m: f'const QUICKLINKS = [\n  {q_body}\n];', new_text)

        # Replace Other Places anchors
        if self.other_places_range:
            astart, aend = self.other_places_range
            anchors_html = serialize_other_places(self.other_places)
            new_text = new_text[:astart] + "\n" + anchors_html + "\n      " + new_text[aend:]

        try:
            write_text(path, new_text)
            self.text = new_text  # update in-memory baseline
            # Recompute ranges (positions changed)
            self.fs, self.fs_range = parse_fs(self.text, self.default_pictures)
            self._normalize_children(self.fs)
            _, self.other_places_range = parse_other_places(self.text)
            self.status.set(f"Saved: {os.path.basename(path)}")
            messagebox.showinfo(APP_TITLE, "Saved successfully (backup created).")
        except Exception as e:
            messagebox.showerror(APP_TITLE, f"Save failed:\n{e}")

    # ---------- Tree operations ----------

    def build_treeview(self):
        self.tree.delete(*self.tree.get_children())
        # Root is FS itself (My Documents); show its children
        self._add_tree_nodes("", "/", self.fs)

    def _add_tree_nodes(self, parent_id, path, node):
        # node has "children" if folder-like
        ch = node.get("children") if isinstance(node, dict) else None
        # Insert current node only if not root
        if parent_id == "":
            # create a virtual root visible in the tree
            root_id = self.tree.insert("", "end", text="My Documents (/)", values=(node.get("type","folder"), node.get("title","My Documents"), "/"), open=True)
            # Add children under this root
            if isinstance(ch, dict):
                for name, child in ch.items():
                    self._insert_recursive(root_id, f"/{name}", name, child)
        else:
            # Not used
            pass

    def _insert_recursive(self, parent_id, path, name, node):
        ntype = node.get("type","folder")
        shortcut_to = path if ntype=="folder" else (node.get("to","") if ntype=="shortcut" else "")
        item_id = self.tree.insert(parent_id, "end", text=name, values=(ntype, node.get("title",""), shortcut_to))
        self.tree.set(item_id, "type", ntype)
        self.tree.set(item_id, "title", node.get("title",""))
        # Recompute shortcut column
        item_type = node.get("type")
        _, cur_path, _, _ = self._selected()
        self.tree.set(item_id, "shortcut", (cur_path if item_type=="folder" else (node.get("to","") if item_type=="shortcut" else "")))
        self.tree.set(item_id, "shortcut", node.get("to","") if ntype=="shortcut" else "")
        self.tree.item(item_id, open=False)

        ch = node.get("children")
        if isinstance(ch, dict):
            for cname, cnode in ch.items():
                self._insert_recursive(item_id, f"{path}/{cname}".replace("//","/"), cname, cnode)

    def _selected(self):
        sel = self.tree.selection()
        if not sel:
            return None, None, None, None
        item_id = sel[0]
        # Compute path by walking up
        names = []
        cur = item_id
        while cur:
            text = self.tree.item(cur, "text")
            parent = self.tree.parent(cur)
            if parent:
                names.append(text)
            cur = parent
        names.reverse()
        path = "/" + "/".join(names)
        parent_path = "/" + "/".join(names[:-1]) if len(names)>1 else "/"
        name = names[-1] if names else None
        return item_id, path, parent_path, name

    def _get_node_by_path(self, path:str):
        parts = [p for p in path.split("/") if p]
        node = self.fs
        for p in parts:
            ch = ordered_children(node)
            node = ch.get(p)
            if node is None:
                return None, None
        parent = self._get_node_by_path("/" + "/".join(parts[:-1]))[0] if parts else None
        return node, parent

    def refresh_inspector(self):
        item_id, path, parent_path, name = self._selected()
        if not item_id:
            return
        node, _ = self._get_node_by_path(path)
        ntype = node.get("type","folder")
        self.var_name.set(name or "")
        self.var_type.set(ntype)
        self.var_title.set(node.get("title",""))
        self.var_url.set(node.get("url",""))
        self.var_to.set(node.get("to",""))
        self.var_href.set(node.get("href",""))
        self.var_details.set(node.get("details",""))

        # Show/hide relevant rows
        for r in (self.row_url, self.row_to, self.row_href, self.row_details):
            r.pack_forget()
        # type-specific fields
        if ntype=="youtube":
            self.row_url.pack(fill=X, pady=2)
        if ntype=="shortcut":
            self.row_to.pack(fill=X, pady=2)
        if ntype=="weblink":
            self.row_href.pack(fill=X, pady=2)
        if node.get("details"):
            self.row_details.pack(fill=X, pady=2)

    def apply_inspector(self):
        item_id, path, parent_path, name = self._selected()
        if not item_id:
            return
        node, parent_node = self._get_node_by_path(path)
        if node is None:
            return
        # Name change = rename within parent's children map
        new_name = self.var_name.get().strip()
        if new_name and new_name != name:
            # Validate unique
            pnode, _ = self._get_node_by_path(parent_path) if parent_path else (self.fs,None)
            ch = ordered_children(pnode)
            if new_name in ch:
                messagebox.showerror(APP_TITLE, "A sibling with that name already exists.")
                return
            # move key
            ch[new_name] = ch.pop(name)
            # update tree text
            self.tree.item(item_id, text=new_name)

        # Type and other fields
        node_type = self.var_type.get().strip() or node.get("type","folder")
        node["type"] = node_type

        # Collect field updates
        new_title = self.var_title.get().strip()
        new_url   = self.var_url.get().strip()
        new_to    = _norm_path(self.var_to.get().strip()) if self.var_to.get().strip() else ""
        new_href  = self.var_href.get().strip()
        new_details = self.var_details.get().strip()

        # If shortcut, validate cycle
        if node_type == "shortcut" and new_to:
            # compute parent path (where the shortcut lives)
            parent_path_norm = _norm_path(parent_path or "/")
            if _would_create_cycle(parent_path_norm, new_to):
                messagebox.showerror(APP_TITLE, f"This shortcut would create a navigation loop.\n\nShortcut location: {parent_path_norm}\nPoints to: {new_to}")
                return

        # Apply fields
        if new_title: node["title"] = new_title
        else: node.pop("title", None)
        if new_url: node["url"] = new_url
        else: node.pop("url", None)
        if new_to: node["to"] = new_to
        else: node.pop("to", None)
        if new_href: node["href"] = new_href
        else: node.pop("href", None)
        if new_details: node["details"] = new_details
        else: node.pop("details", None)

        # Refresh the right-hand display values
        self.tree.set(item_id, "type", node.get("type",""))
        self.tree.set(item_id, "title", node.get("title",""))
        # Recompute shortcut column
        item_type = node.get("type")
        _, cur_path, _, _ = self._selected()
        self.tree.set(item_id, "shortcut", (cur_path if item_type=="folder" else (node.get("to","") if item_type=="shortcut" else "")))
        self.tree.set(item_id, "shortcut", node.get("to","") if ntype=="shortcut" else "")
        self.status.set("Changes applied (not yet saved).")

    def _ensure_folder(self, path:str):
        # Ensure that a folder exists in FS; create if missing.
        parts = [p for p in path.split("/") if p]
        node = self.fs
        for p in parts:
            ch = ordered_children(node)
            if p not in ch:
                ch[p] = {"type":"folder","children":OrderedDict()}
            node = ch[p]
        return node

    def add_folder(self):
        item_id, path, parent_path, name = self._selected()
        parent = self.fs if not item_id else self._get_node_by_path(path)[0]
        # If selected is not a folder, add to its parent
        if parent and parent.get("type") != "folder":
            parent_path = parent_path
            parent = self._get_node_by_path(parent_path)[0]
        if not parent:
            parent = self.fs
        ch = ordered_children(parent)
        new_name = simpledialog.askstring(APP_TITLE, "New folder name:", initialvalue="New Folder")
        if not new_name:
            return
        if new_name in ch:
            messagebox.showerror(APP_TITLE, "That name already exists here.")
            return
        ch[new_name] = {"type":"folder","children":OrderedDict()}
        # insert in tree
        parent_id = self.tree.selection()[0] if self.tree.selection() else self.tree.get_children()[0]
        if self.tree.set(parent_id, "type") != "folder":
            parent_id = self.tree.parent(parent_id)
        self.tree.insert(parent_id, "end", text=new_name, values=("folder","",""))
        self.build_treeview()
        self.status.set(f'Folder "{new_name}" added.')

    def add_image(self):
        if not self.html_dir:
            messagebox.showerror(APP_TITLE, "Open your HTML first.")
            return
        # Choose file
        src = filedialog.askopenfilename(title="Choose image to add",
                                         filetypes=[("Images","*.png;*.jpg;*.jpeg;*.gif;*.webp;*.bmp"),("All files","*.*")])
        if not src:
            return
        # Destination pictures/ dir
        pic_dir = os.path.join(self.html_dir, "pictures")
        ensure_dir(pic_dir)
        base = os.path.basename(src)
        dest_path = os.path.join(pic_dir, base)

        # Decide whether to copy:
        # 1) If the chosen file is already inside pictures/, do not copy — just use it.
        # 2) Else if a file with the same name already exists in pictures/, do not copy — reuse it.
        # 3) Else copy it into pictures/.
        src_norm = os.path.normpath(src)
        pic_dir_norm = os.path.normpath(pic_dir)
        already_in_pictures = os.path.commonpath([src_norm, pic_dir_norm]) == pic_dir_norm

        if already_in_pictures:
            fname = base
            copied = False
        elif os.path.exists(dest_path):
            fname = base
            copied = False
        else:
            fname = copy_file_into(src, pic_dir)  # may uniquify if needed
            copied = True

        # Update DEFAULT_PICTURES if not present
        if fname not in self.default_pictures:
            self.default_pictures.append(fname)

        # Add to selected folder (or /Pictures by default)
        target_path = "/Pictures"
        item_id, path, parent_path, name = self._selected()
        if item_id:
            node, _ = self._get_node_by_path(path)
            if node and node.get("type")=="folder":
                target_path = path

        folder_node = self._ensure_folder(target_path)
        ch = ordered_children(folder_node)
        display_name = fname
        title = os.path.splitext(fname)[0]
        ch[display_name] = {"type":"image","src":f"pictures/{fname}","title":title}
        # Update tree
        self.build_treeview()
        if copied:
            self.status.set(f'Image "{fname}" added to {target_path} and copied into /pictures/.')
        else:
            self.status.set(f'Image "{fname}" added to {target_path} (already in /pictures/, not copied).')

    def add_youtube(self):
        url = simpledialog.askstring(APP_TITLE, "YouTube URL:")
        if not url:
            return
        title = simpledialog.askstring(APP_TITLE, "Title (optional):", initialvalue="Video")
        # Decide parent folder
        item_id, path, parent_path, name = self._selected()
        target_path = path if (item_id and self._get_node_by_path(path)[0].get("type")=="folder") else "/Videos"
        folder_node = self._ensure_folder(target_path)
        ch = ordered_children(folder_node)
        # Name key ends with .yt
        base = (title or "Video").strip() or "Video"
        key = base + ".yt"
        i=1
        while key in ch:
            key = f"{base}_{i}.yt"; i+=1
        ch[key] = {"type":"youtube","url":url,"title":title or base}
        self.build_treeview()
        self.status.set(f'YouTube added under {target_path}.')

    def add_shortcut(self):
        to = simpledialog.askstring(APP_TITLE, "Shortcut target path (e.g., /Pictures):", initialvalue="/Pictures")
        if not to:
            return
        to = _norm_path(to)
        title = simpledialog.askstring(APP_TITLE, "Title (optional):", initialvalue="Shortcut")

        # Parent = selected folder or root
        item_id, path, parent_path, name = self._selected()
        target_path = path if (item_id and self._get_node_by_path(path)[0].get("type")=="folder") else "/"

        # Cycle safety: block ancestor/self targets
        if _would_create_cycle(target_path, to):
            messagebox.showerror(APP_TITLE, f"This shortcut would create a navigation loop.\n\nShortcut location: {target_path}\nPoints to: {to}")
            return

        folder_node = self._ensure_folder(target_path)
        ch = ordered_children(folder_node)
        base = title or "Shortcut"
        key = base
        i=1
        while key in ch:
            key = f"{base}_{i}"; i+=1
        ch[key] = {"type":"shortcut","to":to,"title":title or base}
        self.build_treeview()
        self.status.set(f'Shortcut added under {target_path}.')

    def add_weblink(self):
        href = simpledialog.askstring(APP_TITLE, "Web URL (href):", initialvalue="https://")
        if not href:
            return
        title = simpledialog.askstring(APP_TITLE, "Title (label):", initialvalue="Link")
        # Parent = selected folder or root
        item_id, path, parent_path, name = self._selected()
        target_path = path if (item_id and self._get_node_by_path(path)[0].get("type")=="folder") else "/"
        folder_node = self._ensure_folder(target_path)
        ch = ordered_children(folder_node)
        base = title or "Link"
        key = base
        i=1
        while key in ch:
            key = f"{base}_{i}"; i+=1
        ch[key] = {"type":"weblink","href":href,"title":title or base}
        self.build_treeview()
        self.status.set(f'Web link added under {target_path}.')

    def rename_node(self):
        item_id, path, parent_path, name = self._selected()
        if not item_id:
            return
        new_name = simpledialog.askstring(APP_TITLE, "Rename to:", initialvalue=name or "")
        if not new_name or new_name == name:
            return
        parent_node, _ = self._get_node_by_path(parent_path) if parent_path else (self.fs,None)
        ch = ordered_children(parent_node)
        if new_name in ch:
            messagebox.showerror(APP_TITLE, "A sibling with that name already exists.")
            return
        ch[new_name] = ch.pop(name)
        self.tree.item(item_id, text=new_name)
        self.status.set("Renamed.")

    def delete_node(self):
        item_id, path, parent_path, name = self._selected()
        if not item_id:
            return
        if not messagebox.askyesno(APP_TITLE, f"Delete '{name}'?"):
            return
        parent_node, _ = self._get_node_by_path(parent_path) if parent_path else (self.fs,None)
        ch = ordered_children(parent_node)
        ch.pop(name, None)
        # remove from tree
        self.tree.delete(item_id)
        self.status.set("Deleted.")

    def reorder(self, delta:int):
        item_id, path, parent_path, name = self._selected()
        if not item_id:
            return
        parent_node, _ = self._get_node_by_path(parent_path) if parent_path else (self.fs,None)
        ch = ordered_children(parent_node)
        keys = list(ch.keys())
        if name not in keys:
            return
        i = keys.index(name)
        j = i + delta
        if j < 0 or j >= len(keys):
            return
        keys[i], keys[j] = keys[j], keys[i]
        # rebuild ordered dict in new order
        new_ch = OrderedDict((k, ch[k]) for k in keys)
        parent_node["children"] = new_ch
        # move in tree UI
        parent_id = self.tree.parent(item_id)
        self.tree.move(item_id, parent_id, j)
        self.status.set("Reordered.")


    # ---------- Drag & Drop (Tree reparenting) ----------
    def _item_path(self, item_id):
        # Compute absolute FS path for a given tree item_id
        names = []
        cur = item_id
        while cur:
            text = self.tree.item(cur, "text")
            parent = self.tree.parent(cur)
            if parent:
                names.append(text)
            cur = parent
        names.reverse()
        return "/" + "/".join(names)

    def _is_descendant_item(self, ancestor_id, desc_id):
        # True if desc_id is inside ancestor_id subtree
        cur = self.tree.parent(desc_id)
        while cur:
            if cur == ancestor_id:
                return True
            cur = self.tree.parent(cur)
        return False

    def _unique_child_key(self, parent_node, base_key):
        ch = ordered_children(parent_node)
        if base_key not in ch:
            return base_key
        i = 1
        while True:
            candidate = f"{base_key}_{i}"
            if candidate not in ch:
                return candidate
            i += 1

    def _move_node(self, src_path, dst_path):
        # Move node at src_path (e.g., /A/B) to become child of dst_path (folder)
        if src_path == "/" or dst_path is None:
            return False, "Invalid move"

        # resolve nodes
        src_node, src_parent = self._get_node_by_path(src_path)
        dst_node, _ = self._get_node_by_path(dst_path)
        if src_node is None or src_parent is None or dst_node is None:
            return False, "Path not found"
        if dst_node.get("type") != "folder":
            return False, "Drop target is not a folder"

        # prevent moving folder into its own descendant by path check
        if dst_path.startswith(src_path + "/") or dst_path == src_path:
            return False, "Cannot move a folder into itself or its descendant"

        # key names
        src_key = src_path.rstrip("/").split("/")[-1]
        dst_children = ordered_children(dst_node)

        # conflict handling
        new_key = self._unique_child_key(dst_node, src_key)

        # remove from old parent
        src_children = ordered_children(src_parent)
        node_obj = src_children.pop(src_key)

        # insert into new parent
        dst_children[new_key] = node_obj
        return True, new_key

    def _init_dnd(self):
        self._dragging_item = None
        self._drag_highlight = None
        self.tree.bind("<ButtonPress-1>", self._on_tree_button_press, add="+")
        self.tree.bind("<B1-Motion>", self._on_tree_motion, add="+")
        self.tree.bind("<ButtonRelease-1>", self._on_tree_button_release, add="+")

    def _clear_drag_highlight(self):
        if self._drag_highlight is not None and self.tree.exists(self._drag_highlight):
            self.tree.item(self._drag_highlight, tags=())
        self._drag_highlight = None

    def _on_tree_button_press(self, event):
        # record item under cursor for potential drag
        item = self.tree.identify_row(event.y)
        self._dragging_item = item

    def _on_tree_motion(self, event):
        if not self._dragging_item:
            return
        # highlight potential drop target (folders only)
        row = self.tree.identify_row(event.y)
        self._clear_drag_highlight()
        if row and row != self._dragging_item:
            # only highlight if row is folder
            # compute type from values
            ntype = self.tree.set(row, "type")
            if ntype == "folder":
                self.tree.item(row, tags=("drophl",))
                self._drag_highlight = row
        # ensure tag style
        self.tree.tag_configure("drophl", background="#e6f0ff")

    def _on_tree_button_release(self, event):
        if not self._dragging_item:
            return
        src_item = self._dragging_item
        self._dragging_item = None

        row = self.tree.identify_row(event.y)
        self._clear_drag_highlight()
        if not row or row == src_item:
            return

        # disallow dropping onto own descendant
        if self._is_descendant_item(src_item, row):
            messagebox.showerror(APP_TITLE, "Cannot move a folder into its own subfolder.")
            return

        # compute src/dst paths
        src_path = self._item_path(src_item)
        dst_path = self._item_path(row)

        # perform move in model
        ok, msg = self._move_node(src_path, dst_path)
        if not ok:
            messagebox.showerror(APP_TITLE, msg)
            return

        # rebuild UI to reflect new structure
        self.build_treeview()
        self.status.set(f"Moved {src_path} → {dst_path}")


    # ---------- Templates ----------
    def add_user_home_template(self):
        user = simpledialog.askstring(APP_TITLE, "User name for /My PC/Local Disk (C:)/Users/<Name>:", initialvalue="User")
        if not user:
            return
        base = "/My PC/Local Disk (C:)/Users/" + user
        docs = base + "/Documents"
        node = self._ensure_folder(docs)
        ch = ordered_children(node)
        # Seed with shortcuts
        ch["Pictures"] = {"type":"shortcut","to":"/Pictures"}
        ch["Videos"] = {"type":"shortcut","to":"/Videos"}
        ch["Cards"]  = {"type":"shortcut","to":"/Pictures/Cards"}
        self.build_treeview()
        self.status.set(f"User Home created at {docs}.")

    def add_documents_bundle_template(self):
        item_id, path, parent_path, name = self._selected()
        target_path = path if (item_id and self._get_node_by_path(path)[0].get("type")=="folder") else "/"
        docs = target_path + "/Documents"
        node = self._ensure_folder(docs)
        ch = ordered_children(node)
        ch["Pictures"] = {"type":"shortcut","to":"/Pictures"}
        ch["Videos"] = {"type":"shortcut","to":"/Videos"}
        self.build_treeview()
        self.status.set(f"Documents bundle added at {docs}.")

    # ---------- Link managers ----------
    def manage_quicklinks(self):
        self._manage_links_dialog("Quick Links", self.quicklinks, key_label="label", key_path="path")

    def manage_other_places(self):
        self._manage_links_dialog("Other Places", self.other_places, key_label="label", key_path="path")

    def _manage_links_dialog(self, title, items:list[dict], key_label="label", key_path="path"):
        win = Toplevel(self.root)
        win.title(title)
        win.geometry("500x360")
        frame = Frame(win, padx=8, pady=8); frame.pack(fill=BOTH, expand=1)

        lb = Listbox(frame); lb.pack(fill=BOTH, expand=1, side=LEFT)
        sb = Scrollbar(frame, command=lb.yview); sb.pack(side=LEFT, fill=Y)
        lb.config(yscrollcommand=sb.set)

        def refresh_lb():
            lb.delete(0, END)
            for it in items:
                lb.insert(END, f'{it.get(key_label,"")}  —  {it.get(key_path,"")}' )

        refresh_lb()

        side = Frame(frame); side.pack(fill=Y, side=RIGHT, padx=6)
        def add_item():
            lab = simpledialog.askstring(title, "Label:")
            if not lab: return
            p = simpledialog.askstring(title, "Path (e.g., /Pictures):", initialvalue="/")
            if not p: return
            items.append({key_label:lab, key_path:p})
            refresh_lb()
        def edit_item():
            i = lb.curselection()
            if not i: return
            idx = i[0]
            it = items[idx]
            lab = simpledialog.askstring(title, "Label:", initialvalue=it.get(key_label,""))
            if not lab: return
            p = simpledialog.askstring(title, "Path:", initialvalue=it.get(key_path,""))
            if not p: return
            it[key_label] = lab; it[key_path] = p
            refresh_lb()
        def remove_item():
            i = lb.curselection()
            if not i: return
            idx = i[0]
            items.pop(idx)
            refresh_lb()
        def move(delta):
            i = lb.curselection()
            if not i: return
            idx = i[0]
            j = idx + delta
            if j<0 or j>=len(items): return
            items[idx], items[j] = items[j], items[idx]
            refresh_lb()
            lb.selection_set(j)

        Button(side, text="Add", command=add_item).pack(fill=X, pady=2)
        Button(side, text="Edit", command=edit_item).pack(fill=X, pady=2)
        Button(side, text="Remove", command=remove_item).pack(fill=X, pady=8)
        Button(side, text="Up", command=lambda: move(-1)).pack(fill=X, pady=2)
        Button(side, text="Down", command=lambda: move(+1)).pack(fill=X, pady=2)
        Button(side, text="Close", command=win.destroy).pack(fill=X, pady=12)

# ------------------------ main ------------------------

def main():
    root = Tk()
    app = EditorApp(root)
    root.mainloop()

if __name__ == "__main__":
    main()
